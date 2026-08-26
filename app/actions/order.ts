'use server'

import { revalidatePath } from 'next/cache'

import { checkRateLimit, clientIp, getCurrentUser } from '@/lib/auth'
import { ensureSchema, isDatabaseConfigured, num, query } from '@/lib/db'
import { orderConfirmationEmail } from '@/lib/email-templates'
import { sendEmail, siteUrl } from '@/lib/mailer'
import {
  generateReference,
  priceOrder,
  validateCoupon,
  type CartLine,
  type OrderType,
} from '@/lib/orders'
import { getOrderingSettings, getWhatsappNumber } from '@/lib/settings'

export type QuoteResult = {
  ok: boolean
  error?: string
  lines: Array<{ menuItemId: string; name: string; unitPrice: number; quantity: number; lineTotal: number }>
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  total: number
  pointsEarned: number
  pointsRedeemed: number
  couponCode: string | null
  pointsBalance: number
  pointValue: number
}

/**
 * Live server-side quote for the cart.
 *
 * The browser never computes money. It sends item ids and quantities; this
 * action returns authoritative prices which the checkout UI simply displays.
 */
export async function quoteOrderAction(input: {
  lines: CartLine[]
  orderType: OrderType
  couponCode?: string | null
  redeemPoints?: number
}): Promise<QuoteResult> {
  const empty: QuoteResult = {
    ok: false,
    lines: [],
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0,
    pointsEarned: 0,
    pointsRedeemed: 0,
    couponCode: null,
    pointsBalance: 0,
    pointValue: 1,
  }

  if (!isDatabaseConfigured) {
    return { ...empty, error: 'Online ordering is temporarily unavailable.' }
  }

  await ensureSchema()
  const user = await getCurrentUser()
  const settings = await getOrderingSettings()

  let pointsBalance = 0
  if (user) {
    const rows = await query<{ points_balance: number }>(
      'SELECT points_balance FROM loyalty_accounts WHERE user_id = $1',
      [user.id],
    )
    pointsBalance = rows[0]?.points_balance ?? 0
  }

  const priced = await priceOrder({
    lines: input.lines ?? [],
    orderType: input.orderType,
    couponCode: input.couponCode,
    redeemPoints: input.redeemPoints,
    userId: user?.id ?? null,
  })

  return {
    ok: priced.ok,
    error: priced.error,
    lines: priced.lines,
    subtotal: priced.subtotal,
    discount: priced.discount,
    deliveryFee: priced.deliveryFee,
    tax: priced.tax,
    total: priced.total,
    pointsEarned: priced.pointsEarned,
    pointsRedeemed: priced.pointsRedeemed,
    couponCode: priced.couponCode,
    pointsBalance,
    pointValue: settings.pointValue,
  }
}

/** Standalone coupon check so the checkout can validate before submitting. */
export async function checkCouponAction(code: string, subtotal: number) {
  if (!isDatabaseConfigured) return { ok: false as const, error: 'Coupons are unavailable.' }
  await ensureSchema()
  const user = await getCurrentUser()
  return validateCoupon(code, subtotal, user?.id ?? null)
}

export type PlaceOrderResult =
  | {
      ok: true
      reference: string
      orderId: string
      total: number
      discount: number
      whatsappNumber: string
      lines: Array<{ name: string; quantity: number; price: number }>
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

/**
 * Creates a real order in Neon.
 *
 * Everything about money is recalculated here. Anything the client sent about
 * prices is discarded. A short idempotency window prevents a double-tap or a
 * refresh from creating duplicate orders.
 */
export async function placeOrderAction(input: {
  lines: CartLine[]
  orderType: OrderType
  customerName: string
  customerPhone: string
  customerEmail?: string
  addressId?: string | null
  address?: string
  specialRequests?: string
  couponCode?: string | null
  redeemPoints?: number
}): Promise<PlaceOrderResult> {
  if (!isDatabaseConfigured) {
    return { ok: false, error: 'Online ordering is temporarily unavailable. Please call us.' }
  }

  await ensureSchema()
  const user = await getCurrentUser()

  const name = (input.customerName ?? '').trim().slice(0, 120)
  const phone = (input.customerPhone ?? '').trim().slice(0, 40)
  const email = (input.customerEmail ?? user?.email ?? '').trim().slice(0, 160)
  const specialRequests = (input.specialRequests ?? '').trim().slice(0, 600)

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.customerName = 'Please enter your name.'
  if (phone.replace(/\D/g, '').length < 7) fieldErrors.customerPhone = 'Enter a valid phone number.'

  const orderType: OrderType =
    input.orderType === 'DELIVERY' || input.orderType === 'DINE_IN' ? input.orderType : 'PICKUP'

  // ---- resolve the delivery address ----
  let addressSnapshot: Record<string, unknown> | null = null

  if (orderType === 'DELIVERY') {
    if (input.addressId && user) {
      const rows = await query<{
        label: string
        recipient_name: string | null
        phone: string | null
        line1: string
        line2: string | null
        city: string | null
        landmark: string | null
      }>(
        // Scoped to the signed-in user so one customer cannot ship to another's address.
        `SELECT label, recipient_name, phone, line1, line2, city, landmark
           FROM addresses WHERE id = $1 AND user_id = $2`,
        [input.addressId, user.id],
      )
      if (rows[0]) addressSnapshot = { ...rows[0] }
    }

    if (!addressSnapshot) {
      const freeform = (input.address ?? '').trim().slice(0, 400)
      if (freeform.length < 5) {
        fieldErrors.address = 'Please enter a delivery address.'
      } else {
        addressSnapshot = { label: 'Delivery', line1: freeform }
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors }
  }

  const allowed = await checkRateLimit(`order:${user?.id ?? (await clientIp())}`, 12, 600)
  if (!allowed) {
    return { ok: false, error: 'Too many orders placed just now. Please wait a moment or call us.' }
  }

  // ---- AUTHORITATIVE pricing ----
  const priced = await priceOrder({
    lines: input.lines ?? [],
    orderType,
    couponCode: input.couponCode,
    redeemPoints: input.redeemPoints,
    userId: user?.id ?? null,
  })

  if (!priced.ok) return { ok: false, error: priced.error ?? 'We could not price this order.' }

  // ---- duplicate guard ----
  const signature = priced.lines
    .map((line) => `${line.menuItemId}:${line.quantity}`)
    .sort()
    .join('|')

  const recent = await query<{ id: string; reference: string }>(
    `SELECT o.id, o.reference
       FROM orders o
      WHERE o.customer_phone = $1
        AND o.total = $2
        AND o.created_at > now() - interval '2 minutes'
        AND o.status <> 'CANCELLED'
      ORDER BY o.created_at DESC LIMIT 1`,
    [phone, priced.total],
  )

  if (recent[0]) {
    const items = await query<{ menu_item_id: string; quantity: number }>(
      'SELECT menu_item_id, quantity FROM order_items WHERE order_id = $1',
      [recent[0].id],
    )
    const recentSignature = items
      .map((item) => `${item.menu_item_id}:${item.quantity}`)
      .sort()
      .join('|')

    if (recentSignature === signature) {
      // Same order submitted twice — return the original instead of duplicating.
      return {
        ok: true,
        orderId: recent[0].id,
        reference: recent[0].reference,
        total: priced.total,
        discount: priced.discount,
        whatsappNumber: await getWhatsappNumber(),
        lines: priced.lines.map((line) => ({
          name: line.name,
          quantity: line.quantity,
          price: line.unitPrice,
        })),
      }
    }
  }

  // ---- persist ----
  let reference = generateReference()
  let orderId: string | null = null

  for (let attempt = 0; attempt < 5 && !orderId; attempt += 1) {
    const inserted = await query<{ id: string }>(
      `INSERT INTO orders
         (reference, user_id, customer_name, customer_phone, customer_email, order_type,
          address_snapshot, subtotal, discount, delivery_fee, tax, total,
          coupon_code, points_redeemed, points_earned, special_requests, status, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15,$16,'PENDING','UNPAID')
       ON CONFLICT (reference) DO NOTHING
       RETURNING id`,
      [
        reference,
        user?.id ?? null,
        name,
        phone,
        email || null,
        orderType,
        addressSnapshot ? JSON.stringify(addressSnapshot) : null,
        priced.subtotal,
        priced.discount,
        priced.deliveryFee,
        priced.tax,
        priced.total,
        priced.couponCode,
        priced.pointsRedeemed,
        priced.pointsEarned,
        specialRequests || null,
      ],
    )
    if (inserted[0]) orderId = inserted[0].id
    else reference = generateReference()
  }

  if (!orderId) return { ok: false, error: 'We could not save your order. Please try again.' }

  for (const line of priced.lines) {
    await query(
      `INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity, line_total)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [orderId, line.menuItemId, line.name, line.unitPrice, line.quantity, line.lineTotal],
    )
  }

  await query(
    `INSERT INTO order_status_events (order_id, status, note) VALUES ($1, 'PENDING', $2)`,
    [orderId, 'Order received'],
  )

  // ---- coupon usage ----
  if (priced.couponId) {
    await query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1', [priced.couponId])
    await query(
      `INSERT INTO coupon_redemptions (coupon_id, user_id, order_id, amount)
       VALUES ($1,$2,$3,$4)`,
      [priced.couponId, user?.id ?? null, orderId, priced.discount],
    )
  }

  // ---- loyalty: spend now, earn on completion ----
  if (user && priced.pointsRedeemed > 0) {
    await query(
      `UPDATE loyalty_accounts SET points_balance = GREATEST(0, points_balance - $2), updated_at = now()
        WHERE user_id = $1`,
      [user.id, priced.pointsRedeemed],
    )
    await query(
      `INSERT INTO loyalty_transactions (user_id, points, type, description, order_id)
       VALUES ($1, $2, 'REDEEM', $3, $4)`,
      [user.id, -priced.pointsRedeemed, `Redeemed on order ${reference}`, orderId],
    )
  }

  // ---- confirmation email (never blocks the order) ----
  if (email) {
    await sendEmail({
      to: email,
      content: orderConfirmationEmail(
        name,
        reference,
        priced.lines.map((line) => ({
          name: line.name,
          quantity: line.quantity,
          lineTotal: line.lineTotal,
        })),
        priced.total,
        orderType === 'DELIVERY' ? 'Delivery' : orderType === 'DINE_IN' ? 'Dine in' : 'Pickup',
        siteUrl(),
      ),
      type: 'ORDER_CONFIRMATION',
      userId: user?.id ?? null,
    })
  }

  revalidatePath('/account')
  revalidatePath('/account/orders')
  revalidatePath('/admin')
  revalidatePath('/admin/orders')

  return {
    ok: true,
    orderId,
    reference,
    total: priced.total,
    discount: priced.discount,
    whatsappNumber: await getWhatsappNumber(),
    lines: priced.lines.map((line) => ({
      name: line.name,
      quantity: line.quantity,
      price: line.unitPrice,
    })),
  }
}

/** Rebuilds a past order into a cart payload for one-click reorder. */
export async function reorderAction(orderId: string) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Please sign in to reorder.' }

  await ensureSchema()

  // Scoped by user_id — a customer can only reorder their own orders.
  const rows = await query<{ menu_item_id: string | null; quantity: number; name: string }>(
    `SELECT oi.menu_item_id, oi.quantity, oi.name
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
      WHERE oi.order_id = $1 AND o.user_id = $2`,
    [orderId, user.id],
  )

  if (rows.length === 0) return { ok: false as const, error: 'Order not found.' }

  const ids = rows.map((row) => row.menu_item_id).filter((id): id is string => Boolean(id))
  if (ids.length === 0) {
    return { ok: false as const, error: 'These dishes are no longer on the menu.' }
  }

  const available = await query<{ id: string; name: string; price: string; is_available: boolean }>(
    `SELECT i.id, i.name, i.price, i.is_available
       FROM menu_items i JOIN menu_categories c ON c.id = i.category_id
      WHERE i.id = ANY($1::uuid[]) AND i.is_active = TRUE AND c.is_active = TRUE`,
    [ids],
  )

  const byId = new Map(available.map((item) => [item.id, item]))
  const lines = rows
    .filter((row) => row.menu_item_id && byId.has(row.menu_item_id))
    .map((row) => {
      const item = byId.get(row.menu_item_id as string)
      return {
        menuItemId: row.menu_item_id as string,
        name: item?.name ?? row.name,
        price: num(item?.price),
        quantity: row.quantity,
        isAvailable: item?.is_available ?? false,
      }
    })

  const unavailable = lines.filter((line) => !line.isAvailable).map((line) => line.name)
  const orderable = lines.filter((line) => line.isAvailable)

  if (orderable.length === 0) {
    return { ok: false as const, error: 'None of those dishes are available right now.' }
  }

  return { ok: true as const, lines: orderable, unavailable }
}
