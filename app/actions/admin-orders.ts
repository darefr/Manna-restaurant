'use server'

import { revalidatePath } from 'next/cache'

import { requirePermissionForAction } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { sendEmail, siteUrl } from '@/lib/mailer'
import { orderStatusEmail } from '@/lib/email-templates'
import {
  ORDER_STATUSES,
  STATUS_FLOW,
  STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/orders'

export type AdminActionState = { status: 'idle' | 'success' | 'error'; message?: string }

/**
 * Moves an order to a new status.
 *
 * The transition is validated against STATUS_FLOW on the server so a crafted
 * request cannot jump an order straight from PENDING to DELIVERED.
 */
export async function updateOrderStatusAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const orderId = String(formData.get('orderId') ?? '')
    const next = String(formData.get('status') ?? '') as OrderStatus

    if (!orderId) return { status: 'error', message: 'Missing order.' }
    if (!ORDER_STATUSES.includes(next)) {
      return { status: 'error', message: 'Unknown status.' }
    }

    // Cancelling is a separate, more restricted capability than a normal
    // forward status update, so it is authorised against its own permission.
    const staff = await requirePermissionForAction(next === 'CANCELLED' ? 'orders.cancel' : 'orders.update')

    const order = await queryOne<{
      id: string
      reference: string
      status: OrderStatus
      customer_name: string
      customer_email: string | null
      user_id: string | null
    }>(
      `SELECT id, reference, status, customer_name, customer_email, user_id
         FROM orders WHERE id = $1`,
      [orderId],
    )
    if (!order) return { status: 'error', message: 'Order not found.' }

    const allowed = STATUS_FLOW[order.status] ?? []
    if (!allowed.includes(next)) {
      return {
        status: 'error',
        message: `Cannot move an order from ${STATUS_LABELS[order.status]} to ${STATUS_LABELS[next]}.`,
      }
    }

    await query(`UPDATE orders SET status = $2, updated_at = now() WHERE id = $1`, [orderId, next])

    await query(
      `INSERT INTO order_status_events (order_id, status, note, actor_id)
       VALUES ($1,$2,$3,$4)`,
      [orderId, next, `Updated by ${staff.name || staff.email}`, staff.id],
    )

    // Notify the guest, honouring their email notification preference.
    if (order.customer_email) {
      const prefs = order.user_id
        ? await queryOne<{ email: boolean }>(
            `SELECT email FROM notification_preferences WHERE user_id = $1`,
            [order.user_id],
          )
        : null

      if (!prefs || prefs.email) {
        await sendEmail({
          to: order.customer_email,
          content: orderStatusEmail(order.customer_name, order.reference, next, siteUrl()),
          type: 'ORDER_STATUS',
          userId: order.user_id,
        })
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.reference}`)
    revalidatePath('/account/orders')
    revalidatePath(`/account/orders/${order.reference}`)

    return { status: 'success', message: `Order marked ${STATUS_LABELS[next]}.` }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Could not update the order.',
    }
  }
}

/** Records a payment status change (marking cash orders paid, refunds, etc.). */
export async function updatePaymentStatusAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const orderId = String(formData.get('orderId') ?? '')
    const next = String(formData.get('paymentStatus') ?? '') as PaymentStatus

    if (!['UNPAID', 'PAID', 'REFUNDED', 'FAILED'].includes(next)) {
      return { status: 'error', message: 'Unknown payment status.' }
    }

    // Refunds are gated behind their own permission.
    const staff = await requirePermissionForAction(next === 'REFUNDED' ? 'orders.refund' : 'orders.update')

    const order = await queryOne<{
      id: string
      status: string
      reference: string
      payment_provider: string | null
    }>(`SELECT id, status, reference, payment_provider FROM orders WHERE id = $1`, [orderId])
    if (!order) return { status: 'error', message: 'Order not found.' }

    // A real refund must go through the payment provider. Until one is
    // configured we refuse to silently mark provider-backed orders refunded.
    if (next === 'REFUNDED' && order.payment_provider && order.payment_provider !== 'CASH') {
      return {
        status: 'error',
        message:
          'Online refunds require the payment provider to be configured. Refund from the provider dashboard, then record it here.',
      }
    }

    await query(`UPDATE orders SET payment_status = $2, updated_at = now() WHERE id = $1`, [
      orderId,
      next,
    ])
    await query(
      `INSERT INTO order_status_events (order_id, status, note, actor_id)
       VALUES ($1,$2,$3,$4)`,
      [orderId, order.status, `Payment marked ${next}`, staff.id],
    )

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.reference}`)
    return { status: 'success', message: `Payment marked ${next.toLowerCase()}.` }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Could not update payment.',
    }
  }
}
