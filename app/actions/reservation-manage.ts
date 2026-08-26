'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser, requirePermissionForAction } from '@/lib/auth'
import { ensureSchema, query } from '@/lib/db'
import { reservationConfirmationEmail } from '@/lib/email-templates'
import { sendEmail } from '@/lib/mailer'
import { assignTable, RESERVATION_STATUSES } from '@/lib/reservations'

export type ActionResult = { ok: boolean; message: string }

/* ------------------------------------------------------------------ guest */

/**
 * Cancels a booking. A guest may only cancel their own reservation — the
 * `user_id` check in the WHERE clause is what enforces that, not the UI.
 */
export async function cancelMyReservation(id: number): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, message: 'Please sign in.' }

  await ensureSchema()

  const rows = await query<{ name: string; email: string | null; reference: string | null; date: string; time: string; guests: number }>(
    `UPDATE reservations
        SET status = 'cancelled', table_id = NULL, updated_at = now()
      WHERE id = $1 AND user_id = $2 AND status <> 'cancelled'
      RETURNING name, email, reference, reserved_date::text AS date, reserved_time AS time, guests`,
    [id, user.id],
  )

  if (rows.length === 0) return { ok: false, message: 'That reservation could not be cancelled.' }

  const r = rows[0]
  if (r.email) {
    await sendEmail({
      to: r.email,
      type: 'RESERVATION_CANCELLED',
      userId: user.id,
      content: reservationConfirmationEmail(
        r.name,
        r.reference ?? `MN-${id}`,
        r.date,
        r.time,
        r.guests,
        'cancelled',
      ),
    })
  }

  revalidatePath('/account/reservations')
  revalidatePath('/admin/reservations')
  return { ok: true, message: 'Reservation cancelled.' }
}

/** Moves a guest's own booking to a new slot, re-checking availability. */
export async function rescheduleMyReservation(
  id: number,
  date: string,
  time: string,
  guests: number,
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, message: 'Please sign in.' }
  if (!date || !time) return { ok: false, message: 'Choose a date and a time.' }
  if (!Number.isInteger(guests) || guests < 1 || guests > 40) {
    return { ok: false, message: 'Enter a valid number of guests.' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (new Date(`${date}T00:00:00`) < today) {
    return { ok: false, message: 'Please choose today or a future date.' }
  }

  await ensureSchema()

  const owned = await query<{ id: number }>(
    `SELECT id FROM reservations WHERE id = $1 AND user_id = $2 AND status <> 'cancelled'`,
    [id, user.id],
  )
  if (owned.length === 0) return { ok: false, message: 'That reservation could not be changed.' }

  const assignment = await assignTable(date, time, guests, id)
  if (!assignment.ok && assignment.reason === 'SLOT_FULL') {
    return { ok: false, message: 'That time is fully booked. Please pick another slot.' }
  }
  if (!assignment.ok && assignment.reason === 'NO_CAPACITY') {
    return { ok: false, message: 'No single table seats that many guests. Please call us.' }
  }

  try {
    await query(
      `UPDATE reservations
          SET reserved_date = $1::date, reserved_time = $2, guests = $3,
              table_id = $4, status = 'pending', updated_at = now()
        WHERE id = $5 AND user_id = $6`,
      [date, time, guests, assignment.ok ? assignment.tableId : null, id, user.id],
    )
  } catch (error) {
    if (String((error as { code?: string }).code) === '23505') {
      return { ok: false, message: 'That table was just taken. Please pick another slot.' }
    }
    throw error
  }

  revalidatePath('/account/reservations')
  revalidatePath('/admin/reservations')
  return { ok: true, message: 'Reservation updated.' }
}

/* ------------------------------------------------------------------ admin */

export async function adminSetReservationStatus(
  id: number,
  status: string,
): Promise<ActionResult> {
  await requirePermissionForAction('reservations.manage')
  if (!RESERVATION_STATUSES.includes(status as (typeof RESERVATION_STATUSES)[number])) {
    return { ok: false, message: 'Unknown status.' }
  }

  await ensureSchema()

  const rows = await query<{
    name: string
    email: string | null
    reference: string | null
    date: string
    time: string
    guests: number
    user_id: string | null
  }>(
    `UPDATE reservations
        SET status = $1,
            table_id = CASE WHEN $1 = 'cancelled' THEN NULL ELSE table_id END,
            updated_at = now()
      WHERE id = $2
      RETURNING name, email, reference, reserved_date::text AS date,
                reserved_time AS time, guests, user_id`,
    [status, id],
  )

  if (rows.length === 0) return { ok: false, message: 'Reservation not found.' }

  const r = rows[0]
  if (r.email && (status === 'confirmed' || status === 'cancelled')) {
    await sendEmail({
      to: r.email,
      type: status === 'cancelled' ? 'RESERVATION_CANCELLED' : 'RESERVATION_CONFIRMATION',
      userId: r.user_id,
      content: reservationConfirmationEmail(
        r.name,
        r.reference ?? `MN-${id}`,
        r.date,
        r.time,
        r.guests,
        status,
      ),
    })
  }

  revalidatePath('/admin/reservations')
  revalidatePath('/account/reservations')
  return { ok: true, message: `Reservation marked ${status}.` }
}

/** Manually pins a booking to a specific table (for walk-ins and phone calls). */
export async function adminAssignTable(id: number, tableId: string | null): Promise<ActionResult> {
  await requirePermissionForAction('reservations.manage')
  await ensureSchema()

  try {
    await query('UPDATE reservations SET table_id = $1, updated_at = now() WHERE id = $2', [
      tableId || null,
      id,
    ])
  } catch (error) {
    if (String((error as { code?: string }).code) === '23505') {
      return { ok: false, message: 'That table is already booked for this slot.' }
    }
    throw error
  }

  revalidatePath('/admin/reservations')
  return { ok: true, message: tableId ? 'Table assigned.' : 'Table cleared.' }
}

/** Reservation taken over the phone by a member of staff. */
export async function adminCreateReservation(formData: FormData): Promise<ActionResult> {
  const staff = await requirePermissionForAction('reservations.manage')
  await ensureSchema()

  const str = (k: string, max: number) => String(formData.get(k) ?? '').trim().slice(0, max)
  const name = str('name', 120)
  const phone = str('phone', 40)
  const email = str('email', 160)
  const date = str('date', 20)
  const time = str('time', 20)
  const requests = str('requests', 600)
  const guests = Number.parseInt(str('guests', 10), 10)
  const requestedTable = str('tableId', 60)

  if (name.length < 2) return { ok: false, message: 'Enter the guest name.' }
  if (phone.replace(/\D/g, '').length < 7) return { ok: false, message: 'Enter a phone number.' }
  if (!date || !time) return { ok: false, message: 'Choose a date and time.' }
  if (!Number.isInteger(guests) || guests < 1 || guests > 40) {
    return { ok: false, message: 'Enter a valid party size.' }
  }

  let tableId: string | null = requestedTable || null
  if (!tableId) {
    const assignment = await assignTable(date, time, guests)
    if (!assignment.ok && assignment.reason === 'SLOT_FULL') {
      return { ok: false, message: 'No free table at that time. Assign one manually.' }
    }
    tableId = assignment.ok ? assignment.tableId : null
  }

  let id: number
  try {
    const rows = await query<{ id: number }>(
      `INSERT INTO reservations
         (name, phone, email, reserved_date, reserved_time, guests, requests,
          table_id, status, created_by)
       VALUES ($1,$2,$3,$4::date,$5,$6,$7,$8,'confirmed',$9)
       RETURNING id`,
      [name, phone, email || null, date, time, guests, requests || null, tableId, staff.id],
    )
    id = rows[0].id
  } catch (error) {
    if (String((error as { code?: string }).code) === '23505') {
      return { ok: false, message: 'That table is already booked for this slot.' }
    }
    throw error
  }

  const reference = `MN-${String(id).padStart(4, '0')}`
  await query('UPDATE reservations SET reference = $1 WHERE id = $2', [reference, id])

  if (email) {
    await sendEmail({
      to: email,
      type: 'RESERVATION_CONFIRMATION',
      content: reservationConfirmationEmail(name, reference, date, time, guests, 'confirmed'),
    })
  }

  revalidatePath('/admin/reservations')
  return { ok: true, message: `Reservation ${reference} created.` }
}

/* ------------------------------------------------------------- table CRUD */

export async function saveTable(formData: FormData): Promise<ActionResult> {
  await requirePermissionForAction('tables.manage')
  await ensureSchema()

  const id = String(formData.get('id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim().slice(0, 60)
  const section = String(formData.get('section') ?? '').trim().slice(0, 60) || 'Main'
  const capacity = Number.parseInt(String(formData.get('capacity') ?? ''), 10)
  const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true'

  if (name.length < 1) return { ok: false, message: 'Give the table a name.' }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 40) {
    return { ok: false, message: 'Capacity must be between 1 and 40.' }
  }

  try {
    if (id) {
      await query(
        `UPDATE restaurant_tables
            SET name = $1, section = $2, capacity = $3, is_active = $4
          WHERE id = $5::uuid`,
        [name, section, capacity, isActive, id],
      )
    } else {
      await query(
        `INSERT INTO restaurant_tables (name, section, capacity, is_active)
         VALUES ($1, $2, $3, $4)`,
        [name, section, capacity, isActive],
      )
    }
  } catch (error) {
    if (String((error as { code?: string }).code) === '23505') {
      return { ok: false, message: 'A table with that name already exists.' }
    }
    throw error
  }

  revalidatePath('/admin/tables')
  revalidatePath('/admin/reservations')
  return { ok: true, message: 'Table saved.' }
}

/**
 * Tables are deactivated rather than deleted so historic reservations keep
 * pointing at a real table.
 */
export async function setTableActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requirePermissionForAction('tables.manage')
  await ensureSchema()
  await query('UPDATE restaurant_tables SET is_active = $1 WHERE id = $2::uuid', [isActive, id])
  revalidatePath('/admin/tables')
  return { ok: true, message: isActive ? 'Table activated.' : 'Table deactivated.' }
}
