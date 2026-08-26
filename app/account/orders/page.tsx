import Link from 'next/link'

import ReorderButton from '@/components/account/ReorderButton'
import {
  EmptyState,
  formatDate,
  money,
  SectionHeader,
  StatusBadge,
} from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getCustomerOrders } from '@/lib/customer'
import { STATUS_LABELS } from '@/lib/orders'

export const metadata = { title: 'Order history' }

export default async function OrdersPage() {
  const user = await requireUser()
  const orders = await getCustomerOrders(user.id)

  if (orders.length === 0) {
    return (
      <>
        <SectionHeader title="Orders" />
        <EmptyState
          title="No orders yet"
          message="When you place your first order it will show up here, with one-click reordering."
          actionHref="/order"
          actionLabel="Start an order"
        />
      </>
    )
  }

  return (
    <>
      <SectionHeader title="Orders" subtitle={`${orders.length} in total`} />

      <ul className="flex flex-col gap-4">
        {orders.map((order) => (
          <li key={order.id} className="glass-card rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/account/orders/${order.reference}`}
                    className="font-serif text-lg text-beige transition-colors hover:text-gold"
                  >
                    {order.reference}
                  </Link>
                  <StatusBadge status={order.status} label={STATUS_LABELS[order.status]} />
                  <StatusBadge status={order.paymentStatus} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDate(order.createdAt)} · {order.itemCount}{' '}
                  {order.itemCount === 1 ? 'item' : 'items'} ·{' '}
                  {order.orderType.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <p className="font-serif text-xl text-gold">{money(order.total)}</p>
                <div className="flex items-center gap-3">
                  <ReorderButton orderId={order.id} />
                  <Link
                    href={`/account/orders/${order.reference}`}
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-beige"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
