import Link from 'next/link'
import { notFound } from 'next/navigation'

import OrderStatusControl from '@/components/admin/OrderStatusControl'
import PaymentControl from '@/components/admin/PaymentControl'
import PrintReceiptButton from '@/components/account/PrintReceiptButton'
import { Card, PageHeader } from '@/components/admin/ui'
import { queryOne } from '@/lib/db'
import { getOrderItems, getOrderTimeline, STATUS_LABELS, type OrderStatus } from '@/lib/orders'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const money = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`

/** Renders the JSONB delivery address snapshot as a single readable line. */
function formatAddress(snapshot: Record<string, unknown> | null): string | null {
  if (!snapshot || typeof snapshot !== 'object') return null
  const parts = ['line1', 'line2', 'landmark', 'city']
    .map((key) => snapshot[key])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim())
  return parts.length > 0 ? parts.join(', ') : null
}

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  await requirePermission('orders.view')
  const { reference } = await params

  const order = await queryOne<{
    id: string
    reference: string
    user_id: string | null
    customer_name: string
    customer_email: string | null
    customer_phone: string
    order_type: string
    status: OrderStatus
    payment_status: string
    payment_provider: string | null
    subtotal: string
    discount: string
    delivery_fee: string
    tax: string
    total: string
    address_snapshot: Record<string, unknown> | null
    special_requests: string | null
    coupon_code: string | null
    points_redeemed: number | null
    created_at: string
  }>(
    `SELECT id, reference, user_id, customer_name, customer_email, customer_phone,
            order_type, status, payment_status, payment_provider,
            subtotal::text, discount::text, delivery_fee::text, tax::text, total::text,
            address_snapshot, special_requests, coupon_code, points_redeemed, created_at::text
       FROM orders WHERE reference = $1`,
    [reference],
  )
  if (!order) notFound()

  const addressLine = formatAddress(order.address_snapshot)

  const [items, timeline] = await Promise.all([
    getOrderItems(order.id),
    getOrderTimeline(order.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Order ${order.reference}`}
        subtitle={new Date(order.created_at).toLocaleString('en-GB', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
        action={
          <div className="flex gap-2">
            <PrintReceiptButton />
            <Link
              href="/admin/orders"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-muted-foreground"
            >
              Back
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <Card title="Items">
            <ul className="flex flex-col divide-y divide-white/5">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {money(Number(item.unitPrice))} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">× {item.quantity}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {money(Number(item.lineTotal))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-4 flex flex-col gap-1.5 border-t border-white/10 pt-4 text-sm">
              <Row label="Subtotal" value={money(Number(order.subtotal))} />
              {Number(order.discount) > 0 ? (
                <Row
                  label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`}
                  value={`− ${money(Number(order.discount))}`}
                />
              ) : null}
              {Number(order.delivery_fee) > 0 ? (
                <Row label="Delivery" value={money(Number(order.delivery_fee))} />
              ) : null}
              {Number(order.tax) > 0 ? <Row label="Tax" value={money(Number(order.tax))} /> : null}
              <div className="mt-1.5 flex items-center justify-between border-t border-white/10 pt-2.5">
                <dt className="text-sm font-semibold text-foreground">Total</dt>
                <dd className="text-base font-semibold text-[#c9a84c]">
                  {money(Number(order.total))}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Timeline">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {timeline.map((event, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c9a84c]" />
                    <div>
                      <p className="text-sm text-foreground">
                        {STATUS_LABELS[event.status as OrderStatus] ?? event.status}
                      </p>
                      {event.note ? (
                        <p className="text-[11px] text-muted-foreground">{event.note}</p>
                      ) : null}
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(event.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Guest">
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Name" value={order.customer_name} />
              <Row label="Phone" value={order.customer_phone} />
              {order.customer_email ? <Row label="Email" value={order.customer_email} /> : null}
              <Row label="Order type" value={order.order_type.replace('_', ' ')} />
              {addressLine ? <Row label="Address" value={addressLine} /> : null}
              {order.special_requests ? (
                <Row label="Requests" value={order.special_requests} />
              ) : null}
            </dl>
            {order.user_id ? (
              <Link
                href={`/admin/customers/${order.user_id}`}
                className="mt-3 inline-block text-xs text-[#c9a84c] hover:underline"
              >
                View CRM profile
              </Link>
            ) : (
              <p className="mt-3 text-[11px] text-muted-foreground">Guest checkout (no account).</p>
            )}
          </Card>

          <Card title="Status">
            <p className="mb-3 text-sm text-foreground">
              Currently {STATUS_LABELS[order.status]}
            </p>
            <OrderStatusControl orderId={order.id} status={order.status} />
          </Card>

          <Card title="Payment">
            <p className="mb-3 text-sm text-foreground">
              {order.payment_status}
              {order.payment_provider ? ` · ${order.payment_provider}` : ''}
            </p>
            <PaymentControl orderId={order.id} current={order.payment_status} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  )
}
