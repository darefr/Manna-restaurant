import Link from 'next/link'
import { notFound } from 'next/navigation'

import OrderTracker from '@/components/account/OrderTracker'
import PrintReceiptButton from '@/components/account/PrintReceiptButton'
import ReorderButton from '@/components/account/ReorderButton'
import { formatDateTime, money, Panel, StatusBadge } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getCustomerOrder } from '@/lib/customer'
import { getOrderItems, getOrderTimeline, STATUS_LABELS } from '@/lib/orders'
import { restaurant } from '@/lib/restaurant'

export const metadata = { title: 'Order details' }

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params
  const user = await requireUser()

  // Scoped to this user — another guest's reference simply 404s.
  const order = await getCustomerOrder(user.id, decodeURIComponent(reference))
  if (!order) notFound()

  const [items, timeline] = await Promise.all([
    getOrderItems(order.id),
    getOrderTimeline(order.id),
  ])

  const address = order.addressSnapshot as
    | { label?: string; line1?: string; line2?: string; city?: string; landmark?: string }
    | null

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/account/orders"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-beige"
          >
            ← All orders
          </Link>
          <h2 className="mt-3 font-serif text-2xl text-beige">{order.reference}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ReorderButton orderId={order.id} />
          <PrintReceiptButton />
        </div>
      </div>

      {/* ---------------------------------------------------------- tracking */}
      <section aria-labelledby="tracking" className="print:hidden">
        <h3 id="tracking" className="mb-5 font-serif text-lg text-beige">
          Progress
        </h3>
        <Panel>
          <OrderTracker status={order.status} orderType={order.orderType} />
        </Panel>
      </section>

      {/* ----------------------------------------------------------- receipt */}
      <section
        aria-labelledby="receipt"
        className="glass-card rounded-xl p-6 sm:p-8 print:border-0 print:bg-white print:p-0 print:text-black"
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6 print:border-black/20">
          <div>
            <h3 id="receipt" className="font-serif text-xl text-beige print:text-black">
              {restaurant.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground print:text-black/60">
              {restaurant.address.line1}, {restaurant.address.city}
            </p>
            <p className="text-xs text-muted-foreground print:text-black/60">
              {restaurant.phones.reception.display}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-gold print:text-black">{order.reference}</p>
            <p className="mt-1 text-xs text-muted-foreground print:text-black/60">
              {formatDateTime(order.createdAt)}
            </p>
            <div className="mt-2 flex justify-end gap-2 print:hidden">
              <StatusBadge status={order.status} label={STATUS_LABELS[order.status]} />
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </header>

        {/* Items */}
        <table className="mt-6 w-full text-sm">
          <caption className="sr-only">Items in order {order.reference}</caption>
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground print:text-black/60">
              <th scope="col" className="pb-3 font-normal">
                Item
              </th>
              <th scope="col" className="pb-3 text-center font-normal">
                Qty
              </th>
              <th scope="col" className="pb-3 text-right font-normal">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="align-top">
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border print:border-black/10">
                <td className="py-3 pr-3 text-beige print:text-black">
                  {item.name}
                  <span className="block text-xs text-muted-foreground print:text-black/60">
                    {money(item.unitPrice)} each
                  </span>
                </td>
                <td className="py-3 text-center text-beige print:text-black">{item.quantity}</td>
                <td className="py-3 text-right text-beige print:text-black">
                  {money(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-sm print:border-black/20">
          <div className="flex justify-between">
            <dt className="text-muted-foreground print:text-black/60">Subtotal</dt>
            <dd className="text-beige print:text-black">{money(order.subtotal)}</dd>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground print:text-black/60">
                Discount{order.couponCode ? ` (${order.couponCode})` : ''}
              </dt>
              <dd className="text-emerald-300 print:text-black">-{money(order.discount)}</dd>
            </div>
          ) : null}
          {order.deliveryFee > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground print:text-black/60">Delivery</dt>
              <dd className="text-beige print:text-black">{money(order.deliveryFee)}</dd>
            </div>
          ) : null}
          {order.tax > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground print:text-black/60">Tax</dt>
              <dd className="text-beige print:text-black">{money(order.tax)}</dd>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between border-t border-border pt-3 print:border-black/20">
            <dt className="font-serif text-base text-beige print:text-black">Total</dt>
            <dd className="font-serif text-base text-gold print:text-black">{money(order.total)}</dd>
          </div>
          {order.pointsEarned > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground print:text-black/60">Points earned</dt>
              <dd className="text-gold print:text-black">+{order.pointsEarned}</dd>
            </div>
          ) : null}
        </dl>

        {/* Fulfilment */}
        <div className="mt-6 grid gap-5 border-t border-border pt-5 text-sm sm:grid-cols-2 print:border-black/20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground print:text-black/60">
              {order.orderType.replace(/_/g, ' ').toLowerCase()}
            </p>
            {address ? (
              <address className="mt-2 not-italic text-beige print:text-black">
                {address.line1}
                {address.line2 ? <>, {address.line2}</> : null}
                {address.landmark ? <>, near {address.landmark}</> : null}
                {address.city ? <>, {address.city}</> : null}
              </address>
            ) : (
              <p className="mt-2 text-beige print:text-black">At the restaurant</p>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground print:text-black/60">
              Contact
            </p>
            <p className="mt-2 text-beige print:text-black">{order.customerName}</p>
            <p className="text-beige print:text-black">{order.customerPhone}</p>
          </div>
        </div>

        {order.specialRequests ? (
          <div className="mt-5 border-t border-border pt-5 print:border-black/20">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground print:text-black/60">
              Special requests
            </p>
            <p className="mt-2 text-sm text-beige print:text-black">{order.specialRequests}</p>
          </div>
        ) : null}
      </section>

      {/* ---------------------------------------------------------- timeline */}
      {timeline.length > 0 ? (
        <section aria-labelledby="timeline" className="print:hidden">
          <h3 id="timeline" className="mb-5 font-serif text-lg text-beige">
            History
          </h3>
          <Panel>
            <ol className="flex flex-col gap-4">
              {timeline.map((event, index) => (
                <li key={`${event.status}-${index}`} className="flex items-start gap-4">
                  <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold/60" />
                  <div>
                    <p className="text-sm text-beige">
                      {STATUS_LABELS[event.status as keyof typeof STATUS_LABELS] ?? event.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(event.created_at)}
                      {event.note ? ` · ${event.note}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </section>
      ) : null}
    </div>
  )
}
