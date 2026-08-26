'use server'

import { revalidatePath } from 'next/cache'

import { requirePermissionForAction } from '@/lib/auth'
import { logDatabaseError, query } from '@/lib/db'

export type ReviewActionState = { status: 'success' | 'error'; message: string }

function fail(context: string, error: unknown): ReviewActionState {
  if (error instanceof Error && error.name === 'AuthError') {
    return { status: 'error', message: error.message }
  }
  logDatabaseError(context, error)
  return { status: 'error', message: 'Unable to complete this action right now. Please try again.' }
}

const REVIEW_STATUSES = ['APPROVED', 'HIDDEN', 'PENDING'] as const

export async function moderateReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  try {
    await requirePermissionForAction('reviews.moderate')

    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? '')
    if (!id) return { status: 'error', message: 'Missing review.' }
    if (!REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number])) {
      return { status: 'error', message: 'Invalid review status.' }
    }

    await query(`UPDATE reviews SET status = $2, updated_at = now() WHERE id = $1`, [id, status])

    revalidatePath('/admin/reviews')
    revalidatePath('/reviews')
    revalidatePath('/')
    return { status: 'success', message: `Review ${status.toLowerCase()}.` }
  } catch (error) {
    return fail('moderateReviewAction failed', error)
  }
}

export async function deactivateStaffAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  try {
    await requirePermissionForAction('staff.manage')

    const id = String(formData.get('id') ?? '')
    if (!id) return { status: 'error', message: 'Missing staff member.' }
    const active = String(formData.get('active') ?? '') === 'true'

    const rows = await query<{ id: string }>(
      `UPDATE users SET is_active = $2, updated_at = now()
        WHERE id = $1 AND role <> 'SUPER_ADMIN' RETURNING id`,
      [id, active],
    )
    if (rows.length === 0) {
      return { status: 'error', message: 'That account cannot be changed.' }
    }

    revalidatePath('/admin/staff')
    return { status: 'success', message: active ? 'Account activated.' : 'Account deactivated.' }
  } catch (error) {
    return fail('deactivateStaffAction failed', error)
  }
}
