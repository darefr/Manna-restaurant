'use server'

import { revalidatePath } from 'next/cache'

import { requirePermissionForAction } from '@/lib/auth'
import { logDatabaseError, query, queryOne } from '@/lib/db'
import { PUBLIC_ABOUT_PATHS, PUBLIC_GALLERY_PATHS } from '@/lib/public-paths'
import { saveContent } from '@/lib/settings'

export type CmsActionState = { status: 'idle' | 'success' | 'error'; message?: string }

const ok = (message: string): CmsActionState => ({ status: 'success', message })
const bad = (message: string): CmsActionState => ({ status: 'error', message })

/** Safe error funnel: real cause goes to the server log, never to the guest. */
function fail(context: string, error: unknown): CmsActionState {
  if (error instanceof Error && error.name === 'AuthError') return bad(error.message)
  logDatabaseError(context, error)
  return bad('Unable to complete this action right now. Please try again.')
}

function text(formData: FormData, key: string, max = 400) {
  return String(formData.get(key) ?? '')
    .trim()
    .slice(0, max)
}

/** Public surfaces that render CMS-managed content. */
function revalidateGallery() {
  for (const path of PUBLIC_GALLERY_PATHS) revalidatePath(path)
  revalidatePath('/admin/gallery')
}

function revalidateSite() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/content')
  revalidatePath('/admin/settings')
}

// ------------------------------------------------------------------ gallery

const GALLERY_CATEGORIES = ['restaurant', 'food', 'chef', 'events'] as const

export async function saveGalleryImageAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    await requirePermissionForAction('cms.manage')

    const id = text(formData, 'id', 64)
    const url = text(formData, 'url', 500)
    const caption = text(formData, 'caption', 300)
    const category = text(formData, 'category', 40) || 'restaurant'
    const isFeatured = formData.get('isFeatured') === 'on'
    const isActive = formData.get('isActive') === 'on'

    if (!url) return bad('Please provide an image path.')
    // Only same-origin asset paths or https URLs are accepted.
    if (!url.startsWith('/') && !url.startsWith('https://')) {
      return bad('Use a path starting with / or a secure https:// URL.')
    }
    if (!GALLERY_CATEGORIES.includes(category as (typeof GALLERY_CATEGORIES)[number])) {
      return bad('Choose a valid category.')
    }

    if (id) {
      const row = await queryOne<{ id: string }>(
        `UPDATE gallery_images
            SET url = $2, caption = NULLIF($3,''), category = $4,
                is_featured = $5, is_active = $6
          WHERE id = $1 RETURNING id`,
        [id, url, caption, category, isFeatured, isActive],
      )
      if (!row) return bad('Image not found.')
      revalidateGallery()
      return ok('Image updated.')
    }

    const clash = await queryOne('SELECT 1 FROM gallery_images WHERE url = $1', [url])
    if (clash) return bad('That image is already in the gallery.')

    await query(
      `INSERT INTO gallery_images (url, caption, category, is_featured, is_active, position)
       VALUES ($1, NULLIF($2,''), $3, $4, $5,
               COALESCE((SELECT max(position)+1 FROM gallery_images), 0))`,
      [url, caption, category, isFeatured, isActive],
    )

    revalidateGallery()
    return ok('Image added to the gallery.')
  } catch (error) {
    return fail('saveGalleryImageAction failed', error)
  }
}

export async function deleteGalleryImageAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    await requirePermissionForAction('cms.manage')

    const id = text(formData, 'id', 64)
    if (!id) return bad('Missing image.')

    const row = await queryOne<{ id: string }>(
      'DELETE FROM gallery_images WHERE id = $1 RETURNING id',
      [id],
    )
    if (!row) return bad('Image not found.')

    revalidateGallery()
    return ok('Image removed.')
  } catch (error) {
    return fail('deleteGalleryImageAction failed', error)
  }
}

export async function reorderGalleryImageAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    await requirePermissionForAction('cms.manage')

    const id = text(formData, 'id', 64)
    const direction = text(formData, 'direction', 10)
    if (!id || !['up', 'down'].includes(direction)) return bad('Invalid move.')

    const current = await queryOne<{ position: number }>(
      'SELECT position FROM gallery_images WHERE id = $1',
      [id],
    )
    if (!current) return bad('Image not found.')

    const neighbour = await queryOne<{ id: string; position: number }>(
      direction === 'up'
        ? `SELECT id, position FROM gallery_images WHERE position < $1
             ORDER BY position DESC LIMIT 1`
        : `SELECT id, position FROM gallery_images WHERE position > $1
             ORDER BY position ASC LIMIT 1`,
      [current.position],
    )
    if (!neighbour) return ok('Already at the end.')

    await query('UPDATE gallery_images SET position = $2 WHERE id = $1', [id, neighbour.position])
    await query('UPDATE gallery_images SET position = $2 WHERE id = $1', [
      neighbour.id,
      current.position,
    ])

    revalidateGallery()
    return ok('Order updated.')
  } catch (error) {
    return fail('reorderGalleryImageAction failed', error)
  }
}

// ------------------------------------------------------- restaurant content

export async function saveRestaurantInfoAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    const staff = await requirePermissionForAction('cms.manage')

    const name = text(formData, 'name', 120)
    if (name.length < 2) return bad('Please enter the restaurant name.')

    const email = text(formData, 'email', 160)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return bad('Enter a valid contact email address.')
    }

    await saveContent(
      'restaurant_info',
      {
        name,
        tagline: text(formData, 'tagline', 200),
        subtitle: text(formData, 'subtitle', 300),
        addressLine1: text(formData, 'addressLine1', 200),
        addressLine2: text(formData, 'addressLine2', 200),
        phoneReception: text(formData, 'phoneReception', 40),
        phoneChef: text(formData, 'phoneChef', 40),
        phoneAlt: text(formData, 'phoneAlt', 40),
        whatsapp: text(formData, 'whatsapp', 40),
        email,
        instagram: text(formData, 'instagram', 300),
        mapsUrl: text(formData, 'mapsUrl', 500),
      },
      staff.id,
    )

    revalidateSite()
    return ok('Restaurant details saved.')
  } catch (error) {
    return fail('saveRestaurantInfoAction failed', error)
  }
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function saveOpeningHoursAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    const staff = await requirePermissionForAction('cms.manage')

    const days = DAYS.map((day) => ({
      day,
      open: text(formData, `${day}-open`, 10),
      close: text(formData, `${day}-close`, 10),
      closed: formData.get(`${day}-closed`) === 'on',
    }))

    for (const entry of days) {
      if (entry.closed) continue
      if ((entry.open && !entry.close) || (!entry.open && entry.close)) {
        return bad(`Set both opening and closing times for ${entry.day}.`)
      }
    }

    await saveContent(
      'opening_hours',
      { note: text(formData, 'note', 300), verified: true, days },
      staff.id,
    )

    revalidateSite()
    return ok('Opening hours saved.')
  } catch (error) {
    return fail('saveOpeningHoursAction failed', error)
  }
}

export async function saveAboutContentAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    const staff = await requirePermissionForAction('cms.manage')

    const heading = text(formData, 'heading', 160)
    if (heading.length < 2) return bad('Please enter a heading.')

    await saveContent('about_text', { heading, body: text(formData, 'body', 4000) }, staff.id)

    for (const path of PUBLIC_ABOUT_PATHS) revalidatePath(path)
    revalidatePath('/admin/content')
    return ok('About content saved.')
  } catch (error) {
    return fail('saveAboutContentAction failed', error)
  }
}

export async function saveOrderingSettingsAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    const staff = await requirePermissionForAction('settings.manage')

    const numeric = (key: string, label: string, max: number) => {
      const value = Number(text(formData, key, 20) || '0')
      if (!Number.isFinite(value) || value < 0 || value > max) {
        throw new RangeError(`Enter a valid ${label}.`)
      }
      return value
    }

    const settings = {
      deliveryFee: numeric('deliveryFee', 'delivery fee', 100_000),
      taxPercent: numeric('taxPercent', 'tax percentage', 100),
      pointsPerHundred: numeric('pointsPerHundred', 'points rate', 1000),
      pointValue: numeric('pointValue', 'point value', 1000),
      minOrder: numeric('minOrder', 'minimum order', 1_000_000),
    }

    await saveContent('ordering', settings, staff.id)

    revalidatePath('/order')
    revalidatePath('/admin/settings')
    return ok('Ordering settings saved.')
  } catch (error) {
    if (error instanceof RangeError) return bad(error.message)
    return fail('saveOrderingSettingsAction failed', error)
  }
}

// ------------------------------------------------------------------ coupons

export async function saveCouponAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    await requirePermissionForAction('coupons.manage')

    const id = text(formData, 'id', 64)
    const code = text(formData, 'code', 40).toUpperCase().replace(/\s+/g, '')
    const description = text(formData, 'description', 300)
    const discountType = text(formData, 'discountType', 20) === 'FIXED' ? 'FIXED' : 'PERCENT'
    const discountValue = Number(text(formData, 'discountValue', 20) || '0')
    const minOrder = Number(text(formData, 'minOrder', 20) || '0')
    const usageLimitRaw = text(formData, 'usageLimit', 20)
    const perUserLimit = Number(text(formData, 'perUserLimit', 20) || '1')
    const endsAt = text(formData, 'endsAt', 30)
    const isActive = formData.get('isActive') === 'on'

    if (!/^[A-Z0-9-]{3,40}$/.test(code)) {
      return bad('Codes may use letters, numbers and dashes (3–40 characters).')
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return bad('Enter a discount greater than zero.')
    }
    if (discountType === 'PERCENT' && discountValue > 100) {
      return bad('A percentage discount cannot exceed 100%.')
    }
    if (!Number.isFinite(minOrder) || minOrder < 0) return bad('Enter a valid minimum order.')
    if (!Number.isFinite(perUserLimit) || perUserLimit < 1) {
      return bad('Per-guest limit must be at least 1.')
    }

    const usageLimit = usageLimitRaw ? Number(usageLimitRaw) : null
    if (usageLimit !== null && (!Number.isFinite(usageLimit) || usageLimit < 1)) {
      return bad('Enter a valid total usage limit, or leave it blank for unlimited.')
    }

    if (id) {
      const row = await queryOne<{ id: string }>(
        `UPDATE coupons
            SET code = $2, description = NULLIF($3,''), discount_type = $4,
                discount_value = $5, min_order = $6, usage_limit = $7,
                per_user_limit = $8, ends_at = NULLIF($9,'')::timestamptz,
                is_active = $10
          WHERE id = $1 RETURNING id`,
        [
          id,
          code,
          description,
          discountType,
          discountValue,
          minOrder,
          usageLimit,
          perUserLimit,
          endsAt,
          isActive,
        ],
      )
      if (!row) return bad('Coupon not found.')
      revalidatePath('/admin/coupons')
      return ok(`${code} updated.`)
    }

    const clash = await queryOne('SELECT 1 FROM coupons WHERE lower(code) = lower($1)', [code])
    if (clash) return bad('A coupon with that code already exists.')

    await query(
      `INSERT INTO coupons
         (code, description, discount_type, discount_value, min_order,
          usage_limit, per_user_limit, ends_at, is_active)
       VALUES ($1, NULLIF($2,''), $3, $4, $5, $6, $7, NULLIF($8,'')::timestamptz, $9)`,
      [
        code,
        description,
        discountType,
        discountValue,
        minOrder,
        usageLimit,
        perUserLimit,
        endsAt,
        isActive,
      ],
    )

    revalidatePath('/admin/coupons')
    return ok(`${code} created.`)
  } catch (error) {
    return fail('saveCouponAction failed', error)
  }
}

export async function toggleCouponAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    await requirePermissionForAction('coupons.manage')

    const id = text(formData, 'id', 64)
    if (!id) return bad('Missing coupon.')

    const row = await queryOne<{ code: string; is_active: boolean }>(
      `UPDATE coupons SET is_active = NOT is_active WHERE id = $1 RETURNING code, is_active`,
      [id],
    )
    if (!row) return bad('Coupon not found.')

    revalidatePath('/admin/coupons')
    return ok(row.is_active ? `${row.code} enabled.` : `${row.code} disabled.`)
  } catch (error) {
    return fail('toggleCouponAction failed', error)
  }
}

/**
 * Coupons are only deleted when never redeemed; otherwise they are disabled so
 * historic order records keep referring to a real offer.
 */
export async function deleteCouponAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    await requirePermissionForAction('coupons.manage')

    const id = text(formData, 'id', 64)
    if (!id) return bad('Missing coupon.')

    const used = await queryOne<{ count: string }>(
      'SELECT count(*)::text AS count FROM coupon_redemptions WHERE coupon_id = $1',
      [id],
    )

    if (Number(used?.count ?? 0) > 0) {
      await query('UPDATE coupons SET is_active = FALSE WHERE id = $1', [id])
      revalidatePath('/admin/coupons')
      return ok('Coupon has been used before, so it was disabled instead of deleted.')
    }

    await query('DELETE FROM coupons WHERE id = $1', [id])
    revalidatePath('/admin/coupons')
    return ok('Coupon deleted.')
  } catch (error) {
    return fail('deleteCouponAction failed', error)
  }
}
