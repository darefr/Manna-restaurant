import 'server-only'

import { query } from './db'

/**
 * Bookable time slots. The restaurant does not publish hours online, so these
 * mirror the slots already offered by the public booking form.
 */
export const RESERVATION_SLOTS = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
] as const

export const RESERVATION_STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export type TableAssignment =
  | { ok: true; tableId: string; tableName: string }
  | { ok: false; reason: 'NO_CAPACITY' | 'SLOT_FULL' | 'NO_TABLES' }

/**
 * Picks the smallest free table that fits the party at the requested slot.
 *
 * Availability is decided by the database, and the unique index
 * `reservations_table_slot_uidx` is the final guarantee: even if two requests
 * race, only one can hold a given table at a given date and time.
 */
export async function assignTable(
  date: string,
  time: string,
  guests: number,
  excludeReservationId?: number,
): Promise<TableAssignment> {
  const anyTable = await query<{ count: string }>(
    'SELECT count(*)::text AS count FROM restaurant_tables WHERE is_active = TRUE',
  )
  if (Number(anyTable[0]?.count ?? 0) === 0) return { ok: false, reason: 'NO_TABLES' }

  const bigEnough = await query<{ count: string }>(
    'SELECT count(*)::text AS count FROM restaurant_tables WHERE is_active = TRUE AND capacity >= $1',
    [guests],
  )
  if (Number(bigEnough[0]?.count ?? 0) === 0) return { ok: false, reason: 'NO_CAPACITY' }

  const free = await query<{ id: string; name: string }>(
    `SELECT t.id, t.name
       FROM restaurant_tables t
      WHERE t.is_active = TRUE
        AND t.capacity >= $3
        AND NOT EXISTS (
          SELECT 1 FROM reservations r
           WHERE r.table_id = t.id
             AND r.reserved_date = $1::date
             AND r.reserved_time = $2
             AND r.status <> 'cancelled'
             AND ($4::int IS NULL OR r.id <> $4::int)
        )
      ORDER BY t.capacity, t.name
      LIMIT 1`,
    [date, time, guests, excludeReservationId ?? null],
  )

  if (free.length === 0) return { ok: false, reason: 'SLOT_FULL' }
  return { ok: true, tableId: free[0].id, tableName: free[0].name }
}

export type ReservationRecord = {
  id: number
  reference: string | null
  name: string
  phone: string
  email: string | null
  date: string
  time: string
  guests: number
  occasion: string | null
  requests: string | null
  status: string
  tableId: string | null
  tableName: string | null
  userId: string | null
  createdAt: string
}

const SELECT_RESERVATIONS = `
  SELECT r.id, r.reference, r.name, r.phone, r.email,
         r.reserved_date::text AS date, r.reserved_time AS time,
         r.guests, r.occasion, r.requests, r.status,
         r.table_id, t.name AS table_name, r.user_id, r.created_at::text
    FROM reservations r
    LEFT JOIN restaurant_tables t ON t.id = r.table_id
`

type Row = {
  id: number
  reference: string | null
  name: string
  phone: string
  email: string | null
  date: string
  time: string
  guests: number
  occasion: string | null
  requests: string | null
  status: string
  table_id: string | null
  table_name: string | null
  user_id: string | null
  created_at: string
}

function map(row: Row): ReservationRecord {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    phone: row.phone,
    email: row.email,
    date: row.date,
    time: row.time,
    guests: row.guests,
    occasion: row.occasion,
    requests: row.requests,
    status: row.status,
    tableId: row.table_id,
    tableName: row.table_name,
    userId: row.user_id,
    createdAt: row.created_at,
  }
}

export async function getCustomerReservations(userId: string) {
  const rows = await query<Row>(
    `${SELECT_RESERVATIONS} WHERE r.user_id = $1 ORDER BY r.reserved_date DESC, r.reserved_time DESC`,
    [userId],
  )
  return rows.map(map)
}

export async function getReservationsForDate(date: string) {
  const rows = await query<Row>(
    `${SELECT_RESERVATIONS} WHERE r.reserved_date = $1::date ORDER BY r.reserved_time, t.name`,
    [date],
  )
  return rows.map(map)
}

export async function getReservationsInRange(from: string, to: string) {
  const rows = await query<Row>(
    `${SELECT_RESERVATIONS}
      WHERE r.reserved_date BETWEEN $1::date AND $2::date
      ORDER BY r.reserved_date, r.reserved_time`,
    [from, to],
  )
  return rows.map(map)
}

export async function getUpcomingReservation(userId: string) {
  const rows = await query<Row>(
    `${SELECT_RESERVATIONS}
      WHERE r.user_id = $1 AND r.status <> 'cancelled' AND r.reserved_date >= CURRENT_DATE
      ORDER BY r.reserved_date, r.reserved_time LIMIT 1`,
    [userId],
  )
  return rows[0] ? map(rows[0]) : null
}

export async function getTables() {
  return query<{
    id: string
    name: string
    capacity: number
    section: string
    is_active: boolean
  }>('SELECT id, name, capacity, section, is_active FROM restaurant_tables ORDER BY section, name')
}
