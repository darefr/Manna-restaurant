import 'server-only'

import { randomBytes } from 'node:crypto'

import { num, query } from './db'
import {
  MAX_QTY_PER_ITEM,
  MAX_TOTAL_ITEMS,
  type OrderStatus,
  type OrderType,
  type PaymentStatus,
} from './order-constants'
import { getOrderingSettings } from './settings'

export * from './order-constants'

export function generateReference() {
  const stamp = new Date()
  const ymd = `${String(stamp.getFullYear()).slice(2)}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}`
  return `MN-${ymd}-${randomBytes(2).toString('hex').toUpperCase()}`
}

// ------------------------------------------------------------------ pricing

export type CartLine = { menuItemId: string; quantity: number }

export type PricedLine = {
  menuItemId: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type PricingResult = {
  ok: boolean
  error?: string
  lines: PricedLine[]
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  total: number
  couponCode: string | null
  couponId: string | null
  pointsRedeemed: number
  pointsEarned: number
}

const EMPTY: PricingResult = {
  ok: false,
  lines: [],
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  couponCode: null,
  couponId: null,
  pointsRedeemed: 0,
  pointsEarned: 0,
}

type PriceOptions = {
  lines: CartLine[]
  orderType: OrderType
  couponCode?: string | null
  redeemPoints?: number
  userId?: string | null
}

/**
 * THE authoritative price calculation.
 *
 * Prices, discounts and totals are always recomputed here from the database.
 * Nothing the browser sends about money is trusted — the client may only
 * choose item ids and quantities.
 */
export async function priceOrder(options: PriceOptions): Promise<PricingResult> {
  const settings = await getOrderingSettings()

  // Merge duplicates and validate quantities.
  const merged = new Map<string, number>()
  for (const line of options.lines) {
    if (typeof line.menuItemId !== 'string' || !line.menuItemId) continue
    const qty = Math.floor(Number(line.quantity))
    if (!Number.isFinite(qty) || qty <= 0) continue
    merged.set(line.menuItemId, (merged.get(line.menuItemId) ?? 0) + qty)
  }

  if (merged.size === 0) {
    return { ...EMPTY, error: 'Your cart is empty.' }
  }

  let totalUnits = 0
  for (const [id, qty] of merged) {
    if (qty > MAX_QTY_PER_ITEM) {
      return { ...EMPTY, error: `Maximum ${MAX_QTY_PER_ITEM} of any single dish per order.` }
    }
    totalUnits += qty
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return { ...EMPTY, error: 'That dish is no longer on the menu.' }
    }
  }
  if (totalUnits > MAX_TOTAL_ITEMS) {
    return { ...EMPTY, error: `Orders are limited to ${MAX_TOTAL_ITEMS} items. Please call us for large orders.` }
  }

  const ids = [...merged.keys()]
  const rows = await query<{
    id: string
    name: string
    price: string
    is_available: boolean
    is_active: boolean
    available_from: string | null
    available_to: string | null
  }>(
    `SELECT i.id, i.name, i.price, i.is_available, (i.is_active AND c.is_active) AS is_active,
            i.available_from::text, i.available_to::text
       FROM menu_items i
       JOIN menu_categories c ON c.id = i.category_id
      WHERE i.id = ANY($1::uuid[])`,
    [ids],
  )

  const byId = new Map(rows.map((row) => [row.id, row]))
  const lines: PricedLine[] = []
  const today = new Date().toISOString().slice(0, 10)

  for (const [id, quantity] of merged) {
    const item = byId.get(id)
    if (!item || !item.is_active) {
      return { ...EMPTY, error: 'One of the dishes in your cart is no longer available.' }
    }
    if (!item.is_available) {
      return { ...EMPTY, error: `${item.name} is currently unavailable. Please remove it to continue.` }
    }
    if (item.available_from && item.available_from > today) {
      return { ...EMPTY, error: `${item.name} is not available yet.` }
    }
    if (item.available_to && item.available_to < today) {
      return { ...EMPTY, error: `${item.name} is no longer on the seasonal menu.` }
    }

    const unitPrice = num(item.price)
    lines.push({
      menuItemId: id,
      name: item.name,
      unitPrice,
      quantity,
      lineTotal: Math.round(unitPrice * quantity),
    })
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)

  if (settings.minOrder > 0 && subtotal < settings.minOrder) {
    return { ...EMPTY, lines, subtotal, error: `Minimum order is Rs. ${settings.minOrder}.` }
  }

  // ---- coupon (validated entirely server-side) ----
  let discount = 0
  let couponId: string | null = null
  let couponCode: string | null = null

  const rawCode = (options.couponCode ?? '').trim()
  if (rawCode) {
    const result = await validateCoupon(rawCode, subtotal, options.userId ?? null)
    if (!result.ok) {
      return { ...EMPTY, lines, subtotal, error: result.error }
    }
    discount = result.discount
    couponId = result.couponId
    couponCode = result.code
  }

  // ---- loyalty points redemption ----
  let pointsRedeemed = 0
  const requestedPoints = Math.max(0, Math.floor(Number(options.redeemPoints ?? 0)) || 0)
  if (requestedPoints > 0 && options.userId) {
    const balanceRows = await query<{ points_balance: number }>(
      'SELECT points_balance FROM loyalty_accounts WHERE user_id = $1',
      [options.userId],
    )
    const balance = balanceRows[0]?.points_balance ?? 0
    const remaining = Math.max(0, subtotal - discount)
    const maxByValue = Math.floor(remaining / Math.max(1, settings.pointValue))
    pointsRedeemed = Math.min(requestedPoints, balance, maxByValue)
    discount += pointsRedeemed * settings.pointValue
  }

  discount = Math.min(discount, subtotal)

  const deliveryFee = options.orderType === 'DELIVERY' ? settings.deliveryFee : 0
  const taxable = Math.max(0, subtotal - discount)
  const tax = Math.round((taxable * settings.taxPercent) / 100)
  const total = Math.max(0, taxable + deliveryFee + tax)

  const pointsEarned = Math.floor((taxable / 100) * settings.pointsPerHundred)

  return {
    ok: true,
    lines,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    couponCode,
    couponId,
    pointsRedeemed,
    pointsEarned,
  }
}

// ------------------------------------------------------------------ coupons

export type CouponCheck =
  | { ok: true; discount: number; couponId: string; code: string; description: string | null }
  | { ok: false; error: string }

export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  userId: string | null,
): Promise<CouponCheck> {
  const code = rawCode.trim()
  if (!code) return { ok: false, error: 'Enter a coupon code.' }

  const rows = await query<{
    id: string
    code: string
    description: string | null
    discount_type: string
    discount_value: string
    min_order: string
    max_discount: string | null
    usage_limit: number | null
    per_user_limit: number
    used_count: number
    user_id: string | null
    is_active: boolean
    started: boolean
    ended: boolean
  }>(
    `SELECT id, code, description, discount_type, discount_value, min_order, max_discount,
            usage_limit, per_user_limit, used_count, user_id, is_active,
            (starts_at IS NULL OR starts_at <= now()) AS started,
            (ends_at   IS NOT NULL AND ends_at < now()) AS ended
       FROM coupons WHERE code_lower = lower($1)`,
    [code],
  )

  const coupon = rows[0]
  if (!coupon) return { ok: false, error: 'That coupon code is not valid.' }
  if (!coupon.is_active) return { ok: false, error: 'That coupon is no longer active.' }
  if (!coupon.started) return { ok: false, error: 'That coupon is not active yet.' }
  if (coupon.ended) return { ok: false, error: 'That coupon has expired.' }

  if (coupon.user_id && coupon.user_id !== userId) {
    return { ok: false, error: 'That coupon belongs to another account.' }
  }
  if (coupon.user_id && !userId) {
    return { ok: false, error: 'Sign in to use this coupon.' }
  }

  const minOrder = num(coupon.min_order)
  if (subtotal < minOrder) {
    return { ok: false, error: `This coupon needs a minimum order of Rs. ${minOrder}.` }
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { ok: false, error: 'That coupon has reached its usage limit.' }
  }

  if (userId && coupon.per_user_limit > 0) {
    const used = await query<{ count: string }>(
      'SELECT count(*)::text AS count FROM coupon_redemptions WHERE coupon_id = $1 AND user_id = $2',
      [coupon.id, userId],
    )
    if (Number(used[0]?.count ?? 0) >= coupon.per_user_limit) {
      return { ok: false, error: 'You have already used this coupon.' }
    }
  }

  const value = num(coupon.discount_value)
  let discount =
    coupon.discount_type === 'PERCENT' ? Math.round((subtotal * value) / 100) : Math.round(value)

  const cap = coupon.max_discount === null ? null : num(coupon.max_discount)
  if (cap !== null && cap > 0) discount = Math.min(discount, cap)
  discount = Math.min(discount, subtotal)

  if (discount <= 0) return { ok: false, error: 'That coupon does not apply to this order.' }

  return { ok: true, discount, couponId: coupon.id, code: coupon.code, description: coupon.description }
}

// ------------------------------------------------------------------- reads

export type OrderSummary = {
  id: string
  reference: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  orderType: string
  total: number
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  createdAt: string
  itemCount: number
  customerName: string
  customerPhone: string
  customerEmail: string | null
  userId: string | null
  pointsEarned: number
  pointsRedeemed: number
  couponCode: string | null
  specialRequests: string | null
  addressSnapshot: Record<string, unknown> | null
}

type OrderRow = {
  id: string
  reference: string
  status: OrderStatus
  payment_status: PaymentStatus
  order_type: string
  total: string
  subtotal: string
  discount: string
  delivery_fee: string
  tax: string
  created_at: string
  item_count: string | number
  customer_name: string
  customer_phone: string
  customer_email: string | null
  user_id: string | null
  points_earned: number
  points_redeemed: number
  coupon_code: string | null
  special_requests: string | null
  address_snapshot: Record<string, unknown> | null
}

export function mapOrder(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    paymentStatus: row.payment_status,
    orderType: row.order_type,
    total: num(row.total),
    subtotal: num(row.subtotal),
    discount: num(row.discount),
    deliveryFee: num(row.delivery_fee),
    tax: num(row.tax),
    createdAt: row.created_at,
    itemCount: Number(row.item_count ?? 0),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    userId: row.user_id,
    pointsEarned: row.points_earned,
    pointsRedeemed: row.points_redeemed,
    couponCode: row.coupon_code,
    specialRequests: row.special_requests,
    addressSnapshot: row.address_snapshot,
  }
}

export const ORDER_SELECT = `
  SELECT o.id, o.reference, o.status, o.payment_status, o.order_type,
         o.total, o.subtotal, o.discount, o.delivery_fee, o.tax,
         o.created_at::text, o.customer_name, o.customer_phone, o.customer_email,
         o.user_id, o.points_earned, o.points_redeemed, o.coupon_code,
         o.special_requests, o.address_snapshot,
         (SELECT COALESCE(sum(quantity),0) FROM order_items WHERE order_id = o.id) AS item_count
    FROM orders o
`

export async function getOrderItems(orderId: string) {
  const rows = await query<{
    id: string
    menu_item_id: string | null
    name: string
    unit_price: string
    quantity: number
    line_total: string
    notes: string | null
  }>(
    `SELECT id, menu_item_id, name, unit_price, quantity, line_total, notes
       FROM order_items WHERE order_id = $1 ORDER BY name`,
    [orderId],
  )
  return rows.map((row) => ({
    id: row.id,
    menuItemId: row.menu_item_id,
    name: row.name,
    unitPrice: num(row.unit_price),
    quantity: row.quantity,
    lineTotal: num(row.line_total),
    notes: row.notes,
  }))
}

export async function getOrderTimeline(orderId: string) {
  const rows = await query<{ status: string; note: string | null; created_at: string }>(
    `SELECT status, note, created_at::text FROM order_status_events
      WHERE order_id = $1 ORDER BY created_at`,
    [orderId],
  )
  return rows
}
