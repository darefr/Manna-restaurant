'use server'

import { revalidatePath } from 'next/cache'

import { requirePermissionForAction } from '@/lib/auth'
import { logDatabaseError, query } from '@/lib/db'

export type AdminActionState = { status: 'success' | 'error'; message: string }

const ok = (message: string): AdminActionState => ({ status: 'success', message })

/**
 * Converts any thrown error into a safe, user-facing message. The real error is
 * logged server-side (without credentials) so the cause stays diagnosable.
 */
function fail(context: string, error: unknown): AdminActionState {
  if (error instanceof Error && error.name === 'AuthError') {
    return { status: 'error', message: error.message }
  }
  logDatabaseError(context, error)
  return { status: 'error', message: 'Unable to complete this action right now. Please try again.' }
}

const REVIEW_STATUSES = ['APPROVED', 'HIDDEN', 'PENDING'] as const

export async function updateReviewStatus(formData: FormData): Promise<AdminActionState> {
  try {
    const staff = await requirePermissionForAction('reviews.moderate')

    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? '')
    if (!id) return { status: 'error', message: 'Missing review.' }
    if (!REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number])) {
      return { status: 'error', message: 'Invalid review status.' }
    }

    await query('UPDATE reviews SET status = $1, updated_at = now() WHERE id = $2', [status, id])

    // Audit trail. Never allow a logging failure to fail the action itself.
    await query(
      `INSERT INTO notifications (user_id, channel, type, subject, status, sent_at)
       VALUES ($1, 'SYSTEM', $2, $3, 'SENT', now())`,
      [staff.id, 'ADMIN_ACTION', `Review moved to ${status}.`],
    ).catch(() => undefined)

    revalidatePath('/admin/reviews')
    revalidatePath('/reviews')
    revalidatePath('/')
    return ok(`Review ${status.toLowerCase()}.`)
  } catch (error) {
    return fail('updateReviewStatus failed', error)
  }
}

export async function toggleStaffStatus(formData: FormData): Promise<AdminActionState> {
  try {
    await requirePermissionForAction('staff.manage')

    const id = String(formData.get('id') ?? '')
    if (!id) return { status: 'error', message: 'Missing staff member.' }

    // SUPER_ADMIN accounts are protected so the owner cannot be locked out.
    const rows = await query<{ is_active: boolean }>(
      `UPDATE users SET is_active = NOT is_active, updated_at = now()
        WHERE id = $1 AND role <> 'CUSTOMER' AND role <> 'SUPER_ADMIN'
        RETURNING is_active`,
      [id],
    )
    if (rows.length === 0) {
      return { status: 'error', message: 'That account cannot be changed.' }
    }

    revalidatePath('/admin/staff')
    return ok(rows[0].is_active ? 'Staff member reactivated.' : 'Staff member deactivated.')
  } catch (error) {
    return fail('toggleStaffStatus failed', error)
  }
}

export async function updateTableStatus(formData: FormData): Promise<AdminActionState> {
  try {
    await requirePermissionForAction('tables.manage')

    const id = String(formData.get('id') ?? '')
    if (!id) return { status: 'error', message: 'Missing table.' }
    const active = String(formData.get('active') ?? '') === 'true'

    await query('UPDATE restaurant_tables SET is_active = $1 WHERE id = $2', [active, id])

    revalidatePath('/admin/tables')
    return ok(active ? 'Table enabled.' : 'Table disabled.')
  } catch (error) {
    return fail('updateTableStatus failed', error)
  }
}
