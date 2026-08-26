import 'server-only'

import { query } from './db'

export type AdminCustomer = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  emailVerified: boolean
  orderCount: number
  spent: number
  lastOrder: string | null
  points: number
}

export async function getAdminCustomers(search = '') {
  const term = `%${search.trim()}%`
  return query<AdminCustomer & { order_count: string; spent: string; points: string }>(
    `SELECT u.id, u.name, u.email, u.phone, u.role,
            u.email_verified AS "emailVerified",
            count(o.id)::text AS order_count,
            COALESCE(sum(o.total),0)::text AS spent,
            max(o.created_at)::text AS last_order,
            COALESCE(la.points_balance,0)::text AS points
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id AND o.status <> 'CANCELLED'
       LEFT JOIN loyalty_accounts la ON la.user_id = u.id
      WHERE u.role = 'CUSTOMER'
        AND ($1 = '%%' OR u.name ILIKE $1 OR u.email ILIKE $1 OR COALESCE(u.phone,'') ILIKE $1)
      GROUP BY u.id, la.points_balance
      ORDER BY max(o.created_at) DESC NULLS LAST, u.name`,
    [term],
  ).then((rows) => rows.map((r) => ({ ...r, orderCount: Number(r.order_count), spent: Number(r.spent), points: Number(r.points) })))
}

export async function getAdminReviews() {
  return query<{ id: string; rating: number; title: string | null; body: string; status: string; created_at: string; customer_name: string; customer_email: string; order_reference: string | null }>(
    `SELECT r.id, r.rating, r.title, r.body, r.status, r.created_at::text,
            u.name AS customer_name, u.email AS customer_email, o.reference AS order_reference
       FROM reviews r JOIN users u ON u.id = r.user_id
       LEFT JOIN orders o ON o.id = r.order_id
      ORDER BY r.created_at DESC`,
  )
}

export async function getAdminReservations() {
  return query<{ id: number; reference: string | null; name: string; phone: string; email: string | null; reserved_date: string; reserved_time: string; guests: number; status: string; table_name: string | null; section: string | null; requests: string | null }>(
    `SELECT r.id, r.reference, r.name, r.phone, r.email, r.reserved_date::text,
            r.reserved_time, r.guests, r.status, t.name AS table_name, t.section, r.requests
       FROM reservations r LEFT JOIN restaurant_tables t ON t.id = r.table_id
      WHERE r.reserved_date >= CURRENT_DATE - 1
      ORDER BY r.reserved_date, r.reserved_time`,
  )
}

export async function getAdminTables() {
  return query<{ id: string; name: string; capacity: number; section: string; is_active: boolean }>(
    `SELECT id, name, capacity, section, is_active FROM restaurant_tables ORDER BY section, name`,
  )
}

export async function getAdminStaff() {
  return query<{ id: string; name: string; email: string; role: string; is_active: boolean; last_login_at: string | null; created_at: string }>(
    `SELECT id, name, email, role, is_active, last_login_at::text, created_at::text
       FROM users WHERE role <> 'CUSTOMER' ORDER BY name`,
  )
}

export async function getAdminCoupons() {
  return query<{ id: string; code: string; description: string | null; discount_type: string; discount_value: string; min_order: string; starts_at: string | null; ends_at: string | null; usage_limit: number | null; used_count: number; is_active: boolean }>(
    `SELECT id, code, description, discount_type, discount_value::text, min_order::text,
            starts_at::text, ends_at::text, usage_limit, used_count, is_active
       FROM coupons ORDER BY created_at DESC`,
  )
}

export async function getGalleryImages() {
  return query<{ id: string; url: string; caption: string | null; category: string; is_featured: boolean; is_active: boolean; position: number }>(
    `SELECT id, url, caption, category, is_featured, is_active, position FROM gallery_images ORDER BY position, created_at DESC`,
  )
}

export async function getSiteContent() {
  return query<{ key: string; value: unknown; updated_at: string }>(
    `SELECT key, value, updated_at::text FROM site_content ORDER BY key`,
  )
}

export async function getCampaigns() {
  return query<{ id: string; name: string; subject: string; audience: string; status: string; recipients: number; sent_count: number; created_at: string }>(
    `SELECT id, name, subject, audience, status, recipients, sent_count, created_at::text FROM campaigns ORDER BY created_at DESC`,
  )
}
