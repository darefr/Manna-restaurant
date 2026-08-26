import 'server-only'

import { query } from './db'
import { mapOrder, ORDER_SELECT, type OrderSummary } from './orders'

/* ------------------------------------------------------------------ tiers */

export type Tier = { name: string; min: number; perks: string }

/**
 * Loyalty tiers, based on lifetime points earned. These live in code rather
 * than the database because they are business rules, not editable content.
 */
export const TIERS: Tier[] = [
  { name: 'Guest', min: 0, perks: 'Earn 1 point for every Rs. 100 spent.' },
  { name: 'Silver', min: 500, perks: 'Priority booking on weekends.' },
  { name: 'Gold', min: 1500, perks: 'Complimentary starter on every third visit.' },
  { name: 'Platinum', min: 4000, perks: "Chef's table access and a dedicated host." },
]

export function tierFor(lifetimePoints: number) {
  let current = TIERS[0]
  for (const tier of TIERS) if (lifetimePoints >= tier.min) current = tier
  const next = TIERS.find((t) => t.min > lifetimePoints) ?? null
  const span = next ? next.min - current.min : 0
  const progress = next
    ? Math.min(100, Math.max(0, Math.round(((lifetimePoints - current.min) / span) * 100)))
    : 100
  return { current, next, progress, toNext: next ? next.min - lifetimePoints : 0 }
}

/* ---------------------------------------------------------------- loyalty */

export type LoyaltyAccount = { points: number; lifetimePoints: number }

export async function getLoyalty(userId: string): Promise<LoyaltyAccount> {
  const rows = await query<{ points_balance: number; lifetime_points: number }>(
    'SELECT points_balance, lifetime_points FROM loyalty_accounts WHERE user_id = $1',
    [userId],
  )
  return {
    points: rows[0]?.points_balance ?? 0,
    lifetimePoints: rows[0]?.lifetime_points ?? 0,
  }
}

export type LoyaltyEntry = {
  id: string
  points: number
  type: string
  description: string | null
  created_at: string
  order_reference: string | null
}

export async function getLoyaltyHistory(userId: string, limit = 30) {
  return query<LoyaltyEntry>(
    `SELECT t.id, t.points, t.type, t.description, t.created_at::text,
            o.reference AS order_reference
       FROM loyalty_transactions t
       LEFT JOIN orders o ON o.id = t.order_id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2`,
    [userId, limit],
  )
}

export async function getRewards() {
  return query<{
    id: string
    name: string
    description: string | null
    points_cost: number
  }>(
    `SELECT id, name, description, points_cost
       FROM rewards WHERE is_active = TRUE ORDER BY points_cost`,
  )
}

export async function getRedemptions(userId: string) {
  return query<{
    id: string
    code: string
    status: string
    created_at: string
    reward_name: string
    points_spent: number
  }>(
    `SELECT rd.id, rd.code, rd.status, rd.created_at::text,
            r.name AS reward_name, rd.points_spent
       FROM reward_redemptions rd
       JOIN rewards r ON r.id = rd.reward_id
      WHERE rd.user_id = $1
      ORDER BY rd.created_at DESC`,
    [userId],
  )
}

/* -------------------------------------------------------------- addresses */

export type Address = {
  id: string
  label: string
  recipientName: string | null
  phone: string | null
  line1: string
  line2: string | null
  landmark: string | null
  city: string | null
  notes: string | null
  isDefault: boolean
}

type AddressRow = {
  id: string
  label: string
  recipient_name: string | null
  phone: string | null
  line1: string
  line2: string | null
  landmark: string | null
  city: string | null
  notes: string | null
  is_default: boolean
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const rows = await query<AddressRow>(
    `SELECT id, label, recipient_name, phone, line1, line2, landmark, city, notes, is_default
       FROM addresses WHERE user_id = $1
      ORDER BY is_default DESC, label`,
    [userId],
  )
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    recipientName: r.recipient_name,
    phone: r.phone,
    line1: r.line1,
    line2: r.line2,
    landmark: r.landmark,
    city: r.city,
    notes: r.notes,
    isDefault: r.is_default,
  }))
}

/* ----------------------------------------------------------------- orders */

export async function getCustomerOrders(userId: string, limit = 50): Promise<OrderSummary[]> {
  const rows = await query(
    `${ORDER_SELECT} WHERE o.user_id = $1 ORDER BY o.created_at DESC LIMIT $2`,
    [userId, limit],
  )
  return (rows as Parameters<typeof mapOrder>[0][]).map(mapOrder)
}

/**
 * Loads one order for a guest. The `user_id` predicate *is* the authorisation
 * check — a guest can never read another guest's order through this path.
 */
export async function getCustomerOrder(userId: string, reference: string) {
  const rows = await query(`${ORDER_SELECT} WHERE o.user_id = $1 AND o.reference = $2`, [
    userId,
    reference,
  ])
  const list = (rows as Parameters<typeof mapOrder>[0][]).map(mapOrder)
  return list[0] ?? null
}

export async function getActiveOrder(userId: string) {
  const rows = await query(
    `${ORDER_SELECT}
      WHERE o.user_id = $1
        AND o.status NOT IN ('DELIVERED','COMPLETED','CANCELLED')
      ORDER BY o.created_at DESC LIMIT 1`,
    [userId],
  )
  const list = (rows as Parameters<typeof mapOrder>[0][]).map(mapOrder)
  return list[0] ?? null
}

export type CustomerStats = { orderCount: number; totalSpent: number }

/** Lifetime totals, counting only orders that were not cancelled. */
export async function getCustomerStats(userId: string): Promise<CustomerStats> {
  const rows = await query<{ order_count: string; total_spent: string }>(
    `SELECT count(*)::text AS order_count,
            COALESCE(sum(total),0)::text AS total_spent
       FROM orders
      WHERE user_id = $1 AND status <> 'CANCELLED'`,
    [userId],
  )
  return {
    orderCount: Number(rows[0]?.order_count ?? 0),
    totalSpent: Number(rows[0]?.total_spent ?? 0),
  }
}

/* ---------------------------------------------------------------- reviews */

export async function getCustomerReviews(userId: string) {
  return query<{
    id: string
    rating: number
    title: string | null
    body: string
    status: string
    created_at: string
    order_reference: string | null
    response: string | null
  }>(
    `SELECT r.id, r.rating, r.title, r.body, r.status, r.created_at::text,
            o.reference AS order_reference,
            (SELECT body FROM review_responses
              WHERE review_id = r.id ORDER BY created_at DESC LIMIT 1) AS response
       FROM reviews r
       LEFT JOIN orders o ON o.id = r.order_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC`,
    [userId],
  )
}

/** Completed orders the guest has not reviewed yet. */
export async function getReviewableOrders(userId: string) {
  return query<{ id: string; reference: string; created_at: string }>(
    `SELECT o.id, o.reference, o.created_at::text
       FROM orders o
      WHERE o.user_id = $1
        AND o.status IN ('DELIVERED','COMPLETED')
        AND NOT EXISTS (SELECT 1 FROM reviews rv WHERE rv.order_id = o.id)
      ORDER BY o.created_at DESC`,
    [userId],
  )
}

/* ----------------------------------------------------------------- offers */

export type Offer = {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: string
  min_order: string
  max_discount: string | null
  ends_at: string | null
  is_personal: boolean
}

/**
 * Coupons the guest can use right now: public campaigns plus any coupon
 * reserved for this specific guest, excluding ones they have used up.
 */
export async function getAvailableOffers(userId: string) {
  return query<Offer>(
    `SELECT c.id, c.code, c.description, c.discount_type, c.discount_value,
            c.min_order, c.max_discount, c.ends_at::text,
            (c.user_id IS NOT NULL) AS is_personal
       FROM coupons c
      WHERE c.is_active = TRUE
        AND (c.starts_at IS NULL OR c.starts_at <= now())
        AND (c.ends_at   IS NULL OR c.ends_at   >= now())
        AND (c.user_id   IS NULL OR c.user_id = $1)
        AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)
        AND (
          SELECT count(*) FROM coupon_redemptions cr
           WHERE cr.coupon_id = c.id AND cr.user_id = $1
        ) < c.per_user_limit
      ORDER BY c.ends_at NULLS LAST, c.code`,
    [userId],
  )
}

/* -------------------------------------------------------------- referrals */

export async function getReferralSummary(userId: string) {
  const codeRows = await query<{ code: string }>(
    'SELECT code FROM referral_codes WHERE user_id = $1',
    [userId],
  )

  const stats = await query<{ total: string; rewarded: string }>(
    `SELECT count(*)::text AS total,
            count(*) FILTER (WHERE status = 'REWARDED')::text AS rewarded
       FROM referrals WHERE referrer_user_id = $1`,
    [userId],
  )

  const invited = await query<{ name: string; status: string; created_at: string }>(
    `SELECT u.name, r.status, r.created_at::text
       FROM referrals r
       JOIN users u ON u.id = r.referred_user_id
      WHERE r.referrer_user_id = $1
      ORDER BY r.created_at DESC LIMIT 20`,
    [userId],
  )

  return {
    code: codeRows[0]?.code ?? null,
    total: Number(stats[0]?.total ?? 0),
    rewarded: Number(stats[0]?.rewarded ?? 0),
    invited,
  }
}

/* ------------------------------------------------------------- preferences */

export type Preferences = {
  email: boolean
  sms: boolean
  whatsapp: boolean
  marketing: boolean
}

export async function getPreferences(userId: string): Promise<Preferences> {
  const rows = await query<Preferences>(
    'SELECT email, sms, whatsapp, marketing FROM notification_preferences WHERE user_id = $1',
    [userId],
  )
  return rows[0] ?? { email: true, sms: false, whatsapp: false, marketing: false }
}

export type Profile = {
  name: string
  email: string
  phone: string | null
  imageUrl: string | null
  birthday: string | null
  anniversary: string | null
  emailVerified: boolean
  createdAt: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const rows = await query<{
    name: string
    email: string
    phone: string | null
    image_url: string | null
    birthday: string | null
    anniversary: string | null
    email_verified: boolean
    created_at: string
  }>(
    `SELECT name, email, phone, image_url, birthday::text, anniversary::text,
            email_verified, created_at::text
       FROM users WHERE id = $1`,
    [userId],
  )
  const r = rows[0]
  if (!r) return null
  return {
    name: r.name,
    email: r.email,
    phone: r.phone,
    imageUrl: r.image_url,
    birthday: r.birthday,
    anniversary: r.anniversary,
    emailVerified: r.email_verified,
    createdAt: r.created_at,
  }
}
