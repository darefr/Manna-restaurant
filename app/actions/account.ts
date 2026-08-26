'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth'
import { ensureSchema, query } from '@/lib/db'
import { loyaltyRewardEmail } from '@/lib/email-templates'
import { sendEmail } from '@/lib/mailer'

export type ActionResult = { ok: boolean; message?: string; error?: string }

async function currentUserOrFail() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Please sign in to continue.')
  await ensureSchema()
  return user
}

// ------------------------------------------------------------------ favorites

export async function toggleFavoriteAction(menuItemId: string): Promise<ActionResult & { favorite?: boolean }> {
  try {
    const user = await currentUserOrFail()

    const existing = await query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND menu_item_id = $2',
      [user.id, menuItemId],
    )

    if (existing.length > 0) {
      await query('DELETE FROM favorites WHERE user_id = $1 AND menu_item_id = $2', [
        user.id,
        menuItemId,
      ])
      revalidatePath('/account/favorites')
      return { ok: true, favorite: false }
    }

    await query(
      'INSERT INTO favorites (user_id, menu_item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user.id, menuItemId],
    )
    revalidatePath('/account/favorites')
    return { ok: true, favorite: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not update favourites.' }
  }
}

// ------------------------------------------------------------------ addresses

export type AddressState = { status: 'idle' | 'success' | 'error'; message?: string }

function text(formData: FormData, name: string, max: number) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function saveAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  try {
    const user = await currentUserOrFail()

    const id = text(formData, 'id', 40)
    const label = text(formData, 'label', 40) || 'Home'
    const recipient = text(formData, 'recipientName', 120)
    const phone = text(formData, 'phone', 40)
    const line1 = text(formData, 'line1', 200)
    const line2 = text(formData, 'line2', 200)
    const city = text(formData, 'city', 80)
    const landmark = text(formData, 'landmark', 160)
    const notes = text(formData, 'notes', 300)
    const isDefault = formData.get('isDefault') === 'on'

    if (line1.length < 4) {
      return { status: 'error', message: 'Please enter the street address.' }
    }

    if (id) {
      // Scoped to the owner so one customer cannot edit another's address.
      const updated = await query(
        `UPDATE addresses
            SET label=$3, recipient_name=$4, phone=$5, line1=$6, line2=$7,
                city=$8, landmark=$9, notes=$10
          WHERE id=$1 AND user_id=$2 RETURNING id`,
        [id, user.id, label, recipient || null, phone || null, line1, line2 || null, city || null, landmark || null, notes || null],
      )
      if (updated.length === 0) return { status: 'error', message: 'Address not found.' }
    } else {
      const count = await query<{ count: string }>(
        'SELECT count(*)::text AS count FROM addresses WHERE user_id = $1',
        [user.id],
      )
      if (Number(count[0]?.count ?? 0) >= 12) {
        return { status: 'error', message: 'You can save up to 12 addresses.' }
      }

      const inserted = await query<{ id: string }>(
        `INSERT INTO addresses (user_id, label, recipient_name, phone, line1, line2, city, landmark, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [user.id, label, recipient || null, phone || null, line1, line2 || null, city || null, landmark || null, notes || null],
      )

      // First address becomes the default automatically.
      if (isDefault || Number(count[0]?.count ?? 0) === 0) {
        await query('UPDATE addresses SET is_default = (id = $2) WHERE user_id = $1', [
          user.id,
          inserted[0].id,
        ])
      }
      revalidatePath('/account/addresses')
      return { status: 'success', message: 'Address saved.' }
    }

    if (isDefault) {
      await query('UPDATE addresses SET is_default = (id = $2) WHERE user_id = $1', [user.id, id])
    }

    revalidatePath('/account/addresses')
    return { status: 'success', message: 'Address updated.' }
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not save address.' }
  }
}

export async function deleteAddressAction(id: string): Promise<ActionResult> {
  try {
    const user = await currentUserOrFail()
    await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, user.id])

    // Promote another address if the default was removed.
    const remaining = await query<{ id: string; is_default: boolean }>(
      'SELECT id, is_default FROM addresses WHERE user_id = $1 ORDER BY created_at',
      [user.id],
    )
    if (remaining.length > 0 && !remaining.some((row) => row.is_default)) {
      await query('UPDATE addresses SET is_default = TRUE WHERE id = $1', [remaining[0].id])
    }

    revalidatePath('/account/addresses')
    return { ok: true, message: 'Address removed.' }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not remove address.' }
  }
}

export async function setDefaultAddressAction(id: string): Promise<ActionResult> {
  try {
    const user = await currentUserOrFail()
    const owned = await query('SELECT 1 FROM addresses WHERE id = $1 AND user_id = $2', [id, user.id])
    if (owned.length === 0) return { ok: false, error: 'Address not found.' }

    await query('UPDATE addresses SET is_default = (id = $2) WHERE user_id = $1', [user.id, id])
    revalidatePath('/account/addresses')
    return { ok: true, message: 'Default address updated.' }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not update address.' }
  }
}

// ------------------------------------------------------- notification prefs

export async function saveNotificationPrefsAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  try {
    const user = await currentUserOrFail()

    await query(
      `INSERT INTO notification_preferences (user_id, email, sms, whatsapp, marketing, updated_at)
       VALUES ($1,$2,$3,$4,$5, now())
       ON CONFLICT (user_id) DO UPDATE
         SET email = EXCLUDED.email, sms = EXCLUDED.sms,
             whatsapp = EXCLUDED.whatsapp, marketing = EXCLUDED.marketing,
             updated_at = now()`,
      [
        user.id,
        formData.get('email') === 'on',
        formData.get('sms') === 'on',
        formData.get('whatsapp') === 'on',
        formData.get('marketing') === 'on',
      ],
    )

    revalidatePath('/account/settings')
    return { status: 'success', message: 'Notification preferences saved.' }
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not save preferences.' }
  }
}

// -------------------------------------------------------------------- loyalty

export async function redeemRewardAction(rewardId: string): Promise<ActionResult & { code?: string }> {
  try {
    const user = await currentUserOrFail()

    const rewards = await query<{ id: string; name: string; points_cost: number; is_active: boolean }>(
      'SELECT id, name, points_cost, is_active FROM rewards WHERE id = $1',
      [rewardId],
    )
    const reward = rewards[0]
    if (!reward || !reward.is_active) return { ok: false, error: 'That reward is not available.' }

    // Conditional update: only succeeds if the balance is genuinely sufficient,
    // which also prevents a double-click from redeeming twice.
    const debited = await query<{ points_balance: number }>(
      `UPDATE loyalty_accounts
          SET points_balance = points_balance - $2, updated_at = now()
        WHERE user_id = $1 AND points_balance >= $2
        RETURNING points_balance`,
      [user.id, reward.points_cost],
    )

    if (debited.length === 0) {
      return { ok: false, error: 'You do not have enough points for this reward yet.' }
    }

    const code = `RW-${randomBytes(3).toString('hex').toUpperCase()}`

    await query(
      `INSERT INTO reward_redemptions (user_id, reward_id, points_spent, code)
       VALUES ($1,$2,$3,$4)`,
      [user.id, reward.id, reward.points_cost, code],
    )
    await query(
      `INSERT INTO loyalty_transactions (user_id, points, type, description)
       VALUES ($1, $2, 'REDEEM', $3)`,
      [user.id, -reward.points_cost, `Redeemed ${reward.name}`],
    )

    await sendEmail({
      to: user.email,
      content: loyaltyRewardEmail(user.name, reward.name, code),
      type: 'LOYALTY_REWARD',
      userId: user.id,
    })

    revalidatePath('/account/loyalty')
    return { ok: true, message: `Reward unlocked. Your code is ${code}.`, code }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not redeem reward.' }
  }
}

// -------------------------------------------------------------------- reviews

export type ReviewState = { status: 'idle' | 'success' | 'error'; message?: string }

export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  try {
    const user = await currentUserOrFail()

    const orderId = text(formData, 'orderId', 40)
    const rating = Number(formData.get('rating'))
    const title = text(formData, 'title', 120)
    const body = text(formData, 'body', 2000)

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { status: 'error', message: 'Please choose a rating from 1 to 5.' }
    }
    if (body.length < 10) {
      return { status: 'error', message: 'Please write at least a sentence about your experience.' }
    }

    // Only the customer who placed a finished order may review it.
    if (orderId) {
      const orders = await query<{ id: string }>(
        `SELECT id FROM orders
          WHERE id = $1 AND user_id = $2 AND status IN ('DELIVERED','COMPLETED')`,
        [orderId, user.id],
      )
      if (orders.length === 0) {
        return { status: 'error', message: 'You can only review your own completed orders.' }
      }

      const existing = await query('SELECT 1 FROM reviews WHERE order_id = $1', [orderId])
      if (existing.length > 0) {
        return { status: 'error', message: 'You have already reviewed this order.' }
      }
    } else {
      // General review: one per customer per week keeps spam down.
      const recent = await query(
        `SELECT 1 FROM reviews
          WHERE user_id = $1 AND order_id IS NULL AND created_at > now() - interval '7 days'`,
        [user.id],
      )
      if (recent.length > 0) {
        return { status: 'error', message: 'Thanks — you have already left a review recently.' }
      }
    }

    await query(
      `INSERT INTO reviews (user_id, order_id, rating, title, body, status)
       VALUES ($1, NULLIF($2,'')::uuid, $3, $4, $5, 'PENDING')`,
      [user.id, orderId, rating, title || null, body],
    )

    revalidatePath('/account/reviews')
    revalidatePath('/reviews')
    return { status: 'success', message: 'Thank you. Your review will appear once approved.' }
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not submit review.' }
  }
}
