import { BarChart, Card, ColumnChart, KpiCard, PageHeader, money } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getOverview, getRevenueSeries, getCategoryPerformance, getPeakHours, getRepeatRate } from '@/lib/analytics'

export default async function AdminAnalyticsPage() {
  await requirePermission('analytics.view')
  const [overview, revenue, categories, peaks, repeat] = await Promise.all([getOverview(), getRevenueSeries(30), getCategoryPerformance(30), getPeakHours(30), getRepeatRate()])
  return <><PageHeader title="Analytics" subtitle="Understand demand, revenue and guest behaviour over the last 30 days." /><div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"><KpiCard label="Month sales" value={money(overview.monthSales)} /><KpiCard label="Average order" value={money(overview.averageOrderValue)} /><KpiCard label="Repeat customers" value={`${repeat.rate}%`} hint={`${repeat.repeat} of ${repeat.total}`} /><KpiCard label="Upcoming bookings" value={overview.upcomingReservations} /></div><div className="grid gap-6 lg:grid-cols-2"><Card title="Daily revenue"><ColumnChart label="Daily revenue" data={revenue.map((r) => ({ day: r.day.slice(5), value: r.revenue }))} valueFormatter={money} /></Card><Card title="Category performance"><BarChart label="Revenue by category" data={categories.map((c) => ({ label: c.label, value: c.revenue }))} valueFormatter={money} /></Card><Card title="Peak service hours"><BarChart label="Orders by hour" data={peaks.map((p) => ({ label: p.hour, value: p.orders }))} valueFormatter={(v) => `${v} orders`} /></Card></div></>
}
