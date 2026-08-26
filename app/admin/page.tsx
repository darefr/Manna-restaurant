import Link from 'next/link'

import {
  BarChart,
  Card,
  ColumnChart,
  Empty,
  formatDate,
  KpiCard,
  money,
  PageHeader,
  StatusBadge,
} from '@/components/admin/ui'
import {
  getOverview,
  getRecentReviews,
  getRevenueSeries,
  getTopDishes,
} from '@/lib/analytics'
import { requireStaff } from '@/lib/auth'
import { getReservationsInRange } from '@/lib/reservations'

export default async function AdminOverviewPage() {
  const staff = await requireStaff()

  const today = new Date().toISOString().slice(0, 10)
  const weekOut = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const [overview, series, topDishes, reviews, reservations] = await Promise.all([
    getOverview(),
    getRevenueSeries(14),
    getTopDishes(6),
    getRecentReviews(4),
    getReservationsInRange(today, weekOut),
  ])

  const upcoming = reservations.filter((r) => r.status !== 'cancelled').slice(0, 6)

  return (
    <>
      <PageHeader
        title={`Good to see you, ${staff.name.split(' ')[0]}`}
        subtitle="Live figures from the restaurant, straight out of the database."
        action={
          <Link href="/admin/orders" className="btn-gold text-xs">
            Live orders
          </Link>
        }
      />

      {/* --------------------------------------------------------------- KPIs */}
      <section aria-labelledby="today" className="mb-10">
        <h2 id="today" className="sr-only">
          Today
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Today's sales" value={money(overview.todaySales)} hint={`${overview.todayOrders} orders`} />
          <KpiCard
            label="Pending"
            value={overview.pending}
            hint="Awaiting confirmation"
            tone={overview.pending > 0 ? 'warn' : 'default'}
          />
          <KpiCard label="In the kitchen" value={overview.preparing} hint="Preparing now" />
          <KpiCard
            label="Completed today"
            value={overview.completedToday}
            hint={`${overview.cancelledToday} cancelled`}
            tone="good"
          />
        </div>
      </section>

      <section aria-labelledby="totals" className="mb-10">
        <h2 id="totals" className="sr-only">
          Revenue totals
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="This week" value={money(overview.weekSales)} />
          <KpiCard label="This month" value={money(overview.monthSales)} />
          <KpiCard label="Average order" value={money(overview.averageOrderValue)} />
          <KpiCard label="Customers" value={overview.customers} hint="Registered guests" />
        </div>
      </section>

      {/* ------------------------------------------------------------ charts */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-5 font-serif text-lg text-beige">Revenue, last 14 days</h2>
          {series.every((point) => point.revenue === 0) ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No revenue recorded in this period yet.
            </p>
          ) : (
            <>
              <ColumnChart
                label="Daily revenue for the last 14 days"
                data={series.map((point) => ({ day: formatDate(point.day), value: point.revenue }))}
                valueFormatter={money}
              />
              <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>{formatDate(series[0].day)}</span>
                <span>{formatDate(series[series.length - 1].day)}</span>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="mb-5 font-serif text-lg text-beige">Best sellers, last 30 days</h2>
          {topDishes.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No dishes sold in this period yet.
            </p>
          ) : (
            <BarChart
              label="Best selling dishes"
              data={topDishes.map((dish) => ({ label: dish.name, value: dish.quantity }))}
              valueFormatter={(value) => `${value} sold`}
            />
          )}
        </Card>
      </div>

      {/* ------------------------------------------- reservations + reviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="upcoming-res">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="upcoming-res" className="font-serif text-lg text-beige">
              Next 7 days
            </h2>
            <Link
              href="/admin/reservations"
              className="text-xs uppercase tracking-[0.18em] text-gold hover:text-gold-light"
            >
              Calendar
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <Empty message="No reservations booked for the week ahead." />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3.5"
                >
                  <div>
                    <p className="text-sm text-beige">
                      {r.name} · {r.guests} {r.guests === 1 ? 'guest' : 'guests'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(r.date)} at {r.time}
                      {r.tableName ? ` · Table ${r.tableName}` : ' · no table yet'}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-reviews">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-reviews" className="font-serif text-lg text-beige">
              Recent reviews
            </h2>
            <Link
              href="/admin/reviews"
              className="text-xs uppercase tracking-[0.18em] text-gold hover:text-gold-light"
            >
              Moderate
            </Link>
          </div>

          {reviews.length === 0 ? (
            <Empty message="No reviews submitted yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-xl border border-border bg-card/60 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-gold">
                        {'★'.repeat(review.rating)}
                        <span className="text-muted-foreground">
                          {'★'.repeat(5 - review.rating)}
                        </span>
                      </p>
                      <p className="mt-1 truncate text-sm text-beige">
                        {review.title ?? review.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.customer_name} · {formatDate(review.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={review.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
