'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth'
import { ensureSchema, isDatabaseConfigured, query, sql } from '@/lib/db'
import { reservationConfirmationEmail } from '@/lib/email-templates'
import { sendEmail } from '@/lib/mailer'
import { assignTable } from '@/lib/reservations'

export type ReservationState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  reference?: string
  fieldErrors?: Record<string, string>
}

const MAX_GUESTS = 40

function clean(value: FormDataEntryValue | null, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function createReservation(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const name = clean(formData.get('name'), 120)
  const phone = clean(formData.get('phone'), 40)
  const email = clean(formData.get('email'), 160)
  const date = clean(formData.get('date'), 20)
  const time = clean(formData.get('time'), 20)
  const guestsRaw = clean(formData.get('guests'), 10)
  const occasion = clean(formData.get('occasion'), 60)
  const requests = clean(formData.get('requests'), 600)

  const fieldErrors: Record<string, string> = {}

  if (name.length < 2) fieldErrors.name = 'Please enter your full name.'

  // Accepts Nepali mobile/landline formats, with or without +977.
  const digits = phone.replace(/[^\d]/g, '')
  if (digits.length < 7) fieldErrors.phone = 'Please enter a valid phone number.'

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Please enter a valid email address, or leave it blank.'
  }

  if (!date) {
    fieldErrors.date = 'Please choose a date.'
  } else {
    const chosen = new Date(`${date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (Number.isNaN(chosen.getTime())) {
      fieldErrors.date = 'Please choose a valid date.'
    } else if (chosen < today) {
      fieldErrors.date = 'Please choose today or a future date.'
    }
  }

  if (!time) fieldErrors.time = 'Please choose a time.'

  const guests = Number.parseInt(guestsRaw, 10)
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    fieldErrors.guests = `Please enter between 1 and ${MAX_GUESTS} guests.`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors }
  }

  if (!isDatabaseConfigured || !sql) {
    return {
      status: 'error',
      message:
        'Online booking is temporarily unavailable. Please call us on 984-4786004 to book your table.',
    }
  }

  try {
    await ensureSchema()

    // Link the booking to the signed-in guest so it shows up in their account.
    const user = await getCurrentUser()

    // Ask the database for a free table that fits the party. If no tables have
    // been configured yet the booking is still accepted as a request, exactly
    // as it behaved before table management existed.
    const assignment = await assignTable(date, time, guests)

    if (!assignment.ok && assignment.reason === 'SLOT_FULL') {
      return {
        status: 'error',
        message:
          'That time is fully booked. Please choose another time, or call us on 984-4786004 and we will do our best to fit you in.',
        fieldErrors: { time: 'This slot is fully booked.' },
      }
    }

    if (!assignment.ok && assignment.reason === 'NO_CAPACITY') {
      return {
        status: 'error',
        message:
          'We do not have a single table that seats that many guests. Please call us on 984-4786004 so we can arrange a group setting.',
        fieldErrors: { guests: 'Too large for a single table.' },
      }
    }

    const tableId = assignment.ok ? assignment.tableId : null

    let rows: { id: number }[]
    try {
      rows = (await query<{ id: number }>(
        `INSERT INTO reservations
           (name, phone, email, reserved_date, reserved_time, guests, occasion, requests,
            user_id, table_id, status)
         VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, 'pending')
         RETURNING id`,
        [
          name,
          phone,
          email || null,
          date,
          time,
          guests,
          occasion || null,
          requests || null,
          user?.id ?? null,
          tableId,
        ],
      )) as { id: number }[]
    } catch (error) {
      // The unique index on (table_id, date, time) is the last line of defence
      // against two guests racing for the same table.
      if (String((error as { code?: string }).code) === '23505') {
        return {
          status: 'error',
          message: 'That table was just taken. Please choose another time.',
          fieldErrors: { time: 'This slot was just booked.' },
        }
      }
      throw error
    }

    const id = rows[0]?.id
    const reference = `MN-${String(id).padStart(4, '0')}`
    await query('UPDATE reservations SET reference = $1 WHERE id = $2', [reference, id])

    if (email) {
      await sendEmail({
        to: email,
        type: 'RESERVATION_CONFIRMATION',
        userId: user?.id ?? null,
        content: reservationConfirmationEmail(name, reference, date, time, guests, 'pending'),
      })
    }

    revalidatePath('/account/reservations')
    revalidatePath('/admin/reservations')

    return {
      status: 'success',
      reference,
      message: 'We have received your request.',
    }
  } catch (error) {
    console.error('[manna] failed to save reservation:', error)
    return {
      status: 'error',
      message:
        'We could not save your request just now. Please call us on 984-4786004 and we will book your table.',
    }
  }
}
