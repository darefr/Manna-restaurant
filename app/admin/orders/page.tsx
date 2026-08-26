import Link from 'next/link'

import OrderStatusControl from '@/components/admin/OrderStatusControl'
import { Card, Empty, PageHeader, Td, Th, TableWrap } from '@/components/admin/ui'
import { query } from '@/lib/db'
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from '@/lib/orders'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  reference: string
  customer_name: string
  customer_phone: string
  order_type: string
  status: OrderStatus
  payment_status: string
  total: string
  created_at: string
  item_count: string
}

const money = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>
}) {
  await requirePermission('orders.view')
  const sp = await searchParams

  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? sp.status : ''
  const q = (sp.q ?? '').trim()
  const from = sp.from ?? ''
  const to = sp.to ?? ''

  // Every filter is bound as a parameter; nothing is interpolated into SQL.
  const rows = await query<Row>(
    `SELECT o.id, o.reference, o.customer_name, o.customer_phone, o.order_type,
            o.status, o.payment_status, o.total::text, o.created_at::text,
            (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id)::text AS item_count
       FROM orders o
      WHERE ($1 = '' OR o.status = $1)
        AND ($2 = '' OR o.reference ILIKE '%'||$2||'%'
                     OR o.customer_name ILIKE '%'||$2||'%'
                     OR o.customer_phone ILIKE '%'||$2||'%')
        AND ($3 = '' OR o.created_at::date >= $3::date)
        AND ($4 = '' OR o.created_at::date <= $4::date)
      ORDER BY o.created_at DESC
      LIMIT 200`,
    [status, q, from, to],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        subtitle="Live tickets and full order history, straight from the database."
      />

      <Card>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Search
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Reference, name or phone"
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-[#c9a84c]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <select
              name="status"
              defaultValue={status}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-[#c9a84c]"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">From</span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-[#c9a84c]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">To</span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-[#c9a84c]"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-black"
            >
              Filter
            </button>
            <Link
              href="/admin/orders"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-muted-foreground"
            >
              Reset
            </Link>
          </div>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Empty message="No orders match these filters yet." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <TableWrap>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Guest</Th>
                  <Th>Type</Th>
                  <Th align="right">Total</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                  <Th>Update</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/5 align-top">
                    <Td>
                      <Link
                        href={`/admin/orders/${row.reference}`}
                        className="font-mono text-xs text-[#c9a84c] hover:underline"
                      >
                        {row.reference}
                      </Link>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(row.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · '}
                        {row.item_count} items
                      </p>
                    </Td>
                    <Td>
                      <p className="text-sm text-foreground">{row.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{row.customer_phone}</p>
                    </Td>
                    <Td>{row.order_type.replace('_', ' ')}</Td>
                    <Td align="right">{money(Number(row.total))}</Td>
                    <Td>{row.payment_status}</Td>
                    <Td>{STATUS_LABELS[row.status]}</Td>
                    <Td>
                      <OrderStatusControl orderId={row.id} status={row.status} compact />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {rows.map((row) => (
              <Card key={row.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/orders/${row.reference}`}
                      className="font-mono text-xs text-[#c9a84c]"
                    >
                      {row.reference}
                    </Link>
                    <p className="mt-1 text-sm text-foreground">{row.customer_name}</p>
                    <p className="text-[11px] text-muted-foreground">{row.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {money(Number(row.total))}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {STATUS_LABELS[row.status]}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t border-white/5 pt-3">
                  <OrderStatusControl orderId={row.id} status={row.status} compact />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
