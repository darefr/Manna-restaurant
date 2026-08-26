import 'server-only'

import { query } from './db'

const num = (value: unknown) => Number(value ?? 0)

/**
 * Every figure below is computed from the orders table. Cancelled orders are
 * excluded from revenue but still counted in the status breakdown.
 */

export type Overview = {
  todaySales: number
  todayOrders: number
  weekSales: number
  monthSales: number
  pending: number
  preparing: number
  completedToday: number
  cancelledToday: number
  customers: number
  averageOrderValue: number
  upcomingReservations: number
}

export async function getOverview(): Promise<Overview> {
  const rows = await query<Record<string, string>>(`
    SELECT
      COALESCE(sum(total) FILTER (WHERE created_at::date = CURRENT_DATE AND status <> 'CANCELLED'),0)::text AS today_sales,
      count(*) FILTER (WHERE created_at::date = CURRENT_DATE)::text AS today_orders,
      COALESCE(sum(total) FILTER (WHERE created_at >= date_trunc('week', now()) AND status <> 'CANCELLED'),0)::text AS week_sales,
      COALESCE(sum(total) FILTER (WHERE created_at >= date_trunc('month', now()) AND status <> 'CANCELLED'),0)::text AS month_sales,
      count(*) FILTER (WHERE status = 'PENDING')::text AS pending,
      count(*) FILTER (WHERE status = 'PREPARING')::text AS preparing,
      count(*) FILTER (WHERE created_at::date = CURRENT_DATE AND status IN ('COMPLETED','DELIVERED'))::text AS completed_today,
      count(*) FILTER (WHERE created_at::date = CURRENT_DATE AND status = 'CANCELLED')::text AS cancelled_today,
      COALESCE(avg(total) FILTER (WHERE status <> 'CANCELLED'),0)::text AS aov
    FROM orders
  `)

  const customers = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM users WHERE role = 'CUSTOMER'`,
  )

  const reservations = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM reservations
      WHERE reserved_date >= CURRENT_DATE AND status <> 'cancelled'`,
  )

  const r = rows[0] ?? {}
  return {
    todaySales: num(r.today_sales),
    todayOrders: num(r.today_orders),
    weekSales: num(r.week_sales),
    monthSales: num(r.month_sales),
    pending: num(r.pending),
    preparing: num(r.preparing),
    completedToday: num(r.completed_today),
    cancelledToday: num(r.cancelled_today),
    averageOrderValue: num(r.aov),
    customers: num(customers[0]?.count),
    upcomingReservations: num(reservations[0]?.count),
  }
}

/** Daily revenue for the last `days` days, zero-filled so charts have no gaps. */
export async function getRevenueSeries(days = 30) {
  const rows = await query<{ day: string; revenue: string; orders: string }>(
    `SELECT d::date::text AS day,
            COALESCE(sum(o.total),0)::text AS revenue,
            count(o.id)::text AS orders
       FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, interval '1 day') d
       LEFT JOIN orders o
         ON o.created_at::date = d::date AND o.status <> 'CANCELLED'
      GROUP BY d
      ORDER BY d`,
    [days],
  )
  return rows.map((row) => ({
    day: row.day,
    revenue: num(row.revenue),
    orders: num(row.orders),
  }))
}

export async function getTopDishes(limit = 8, days = 30) {
  const rows = await query<{ name: string; quantity: string; revenue: string }>(
    `SELECT oi.name,
            sum(oi.quantity)::text AS quantity,
            sum(oi.line_total)::text AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
      WHERE o.status <> 'CANCELLED'
        AND o.created_at >= CURRENT_DATE - ($2::int)
      GROUP BY oi.name
      ORDER BY sum(oi.quantity) DESC
      LIMIT $1`,
    [limit, days],
  )
  return rows.map((row) => ({
    name: row.name,
    quantity: num(row.quantity),
    revenue: num(row.revenue),
  }))
}

export async function getCategoryPerformance(days = 30) {
  const rows = await query<{ label: string; revenue: string; quantity: string }>(
    `SELECT c.label,
            COALESCE(sum(oi.line_total),0)::text AS revenue,
            COALESCE(sum(oi.quantity),0)::text AS quantity
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN menu_items i ON i.id = oi.menu_item_id
       JOIN menu_categories c ON c.id = i.category_id
      WHERE o.status <> 'CANCELLED'
        AND o.created_at >= CURRENT_DATE - ($1::int)
      GROUP BY c.label
      ORDER BY sum(oi.line_total) DESC`,
    [days],
  )
  return rows.map((row) => ({
    label: row.label,
    revenue: num(row.revenue),
    quantity: num(row.quantity),
  }))
}

/** Order volume by hour of day — tells the kitchen when to staff up. */
export async function getPeakHours(days = 30) {
  const rows = await query<{ hour: string; orders: string; revenue: string }>(
    `SELECT to_char(created_at, 'HH24') AS hour,
            count(*)::text AS orders,
            COALESCE(sum(total),0)::text AS revenue
       FROM orders
      WHERE status <> 'CANCELLED' AND created_at >= CURRENT_DATE - ($1::int)
      GROUP BY 1
      ORDER BY 1`,
    [days],
  )
  return rows.map((row) => ({
    hour: `${row.hour}:00`,
    orders: num(row.orders),
    revenue: num(row.revenue),
  }))
}

export async function getCustomerGrowth(days = 30) {
  const rows = await query<{ day: string; signups: string }>(
    `SELECT d::date::text AS day, count(u.id)::text AS signups
       FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, interval '1 day') d
       LEFT JOIN users u ON u.created_at::date = d::date AND u.role = 'CUSTOMER'
      GROUP BY d ORDER BY d`,
    [days],
  )
  return rows.map((row) => ({ day: row.day, signups: num(row.signups) }))
}

/** Share of customers who have ordered more than once. */
export async function getRepeatRate() {
  const rows = await query<{ total: string; repeat: string }>(
    `WITH per_customer AS (
       SELECT user_id, count(*) AS orders
         FROM orders
        WHERE user_id IS NOT NULL AND status <> 'CANCELLED'
        GROUP BY user_id
     )
     SELECT count(*)::text AS total,
            count(*) FILTER (WHERE orders > 1)::text AS repeat
       FROM per_customer`,
  )
  const total = num(rows[0]?.total)
  const repeat = num(rows[0]?.repeat)
  return { total, repeat, rate: total > 0 ? Math.round((repeat / total) * 100) : 0 }
}

export async function getRecentReviews(limit = 5) {
  return query<{
    id: string
    rating: number
    title: string | null
    body: string
    status: string
    created_at: string
    customer_name: string
  }>(
    `SELECT r.id, r.rating, r.title, r.body, r.status, r.created_at::text,
            u.name AS customer_name
       FROM reviews r JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC LIMIT $1`,
    [limit],
  )
}

/* --------------------------------------------------------------- reporting */

export type ReportRange = { from: string; to: string }

export async function getSalesReport({ from, to }: ReportRange) {
  const rows = await query<{
    day: string
    orders: string
    gross: string
    discount: string
    delivery: string
    tax: string
    net: string
  }>(
    `SELECT created_at::date::text AS day,
            count(*)::text AS orders,
            COALESCE(sum(subtotal),0)::text AS gross,
            COALESCE(sum(discount),0)::text AS discount,
            COALESCE(sum(delivery_fee),0)::text AS delivery,
            COALESCE(sum(tax),0)::text AS tax,
            COALESCE(sum(total),0)::text AS net
       FROM orders
      WHERE status <> 'CANCELLED'
        AND created_at::date BETWEEN $1::date AND $2::date
      GROUP BY 1 ORDER BY 1`,
    [from, to],
  )
  return rows.map((row) => ({
    day: row.day,
    orders: num(row.orders),
    gross: num(row.gross),
    discount: num(row.discount),
    delivery: num(row.delivery),
    tax: num(row.tax),
    net: num(row.net),
  }))
}

export async function getCustomerReport({ from, to }: ReportRange) {
  const rows = await query<{
    name: string
    email: string
    phone: string | null
    orders: string
    spent: string
    last_order: string | null
  }>(
    // Dates are bound as parameters — never interpolated into the SQL string.
    `SELECT u.name, u.email, u.phone,
            count(o.id)::text AS orders,
            COALESCE(sum(o.total),0)::text AS spent,
            max(o.created_at)::text AS last_order
       FROM users u
       LEFT JOIN orders o
         ON o.user_id = u.id
        AND o.status <> 'CANCELLED'
        AND o.created_at::date BETWEEN $1::date AND $2::date
      WHERE u.role = 'CUSTOMER'
      GROUP BY u.id, u.name, u.email, u.phone
      ORDER BY sum(o.total) DESC NULLS LAST`,
    [from, to],
  )
  return rows.map((row) => ({
    name: row.name,
    email: row.email,
    phone: row.phone,
    orders: num(row.orders),
    spent: num(row.spent),
    lastOrder: row.last_order,
  }))
}
