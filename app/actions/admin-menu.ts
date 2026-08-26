'use server'

import { revalidatePath } from 'next/cache'

import { requirePermissionForAction } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { PUBLIC_MENU_PATHS } from '@/lib/public-paths'

export type MenuActionState = { status: 'idle' | 'success' | 'error'; message?: string }

const ok = (message: string): MenuActionState => ({ status: 'success', message })
const fail = (message: string): MenuActionState => ({ status: 'error', message })

function text(formData: FormData, key: string, max = 400) {
  return String(formData.get(key) ?? '')
    .trim()
    .slice(0, max)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Refreshes every surface that renders menu data. */
function revalidateMenu() {
  for (const path of PUBLIC_MENU_PATHS) revalidatePath(path)
  revalidatePath('/admin/menu')
}

// ------------------------------------------------------------------- items

export async function saveMenuItemAction(
  _prev: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  try {
    await requirePermissionForAction('menu.manage')

    const id = text(formData, 'id', 64)
    const name = text(formData, 'name', 120)
    const categoryId = text(formData, 'categoryId', 64)
    const description = text(formData, 'description', 600)
    const imageUrl = text(formData, 'imageUrl', 500)
    const tag = text(formData, 'tag', 40)
    const priceRaw = text(formData, 'price', 20)
    const isFeatured = formData.get('isFeatured') === 'on'
    const isAvailable = formData.get('isAvailable') === 'on'
    const availableFrom = text(formData, 'availableFrom', 20)
    const availableTo = text(formData, 'availableTo', 20)

    if (name.length < 2) return fail('Please enter a dish name.')
    if (!categoryId) return fail('Please choose a category.')

    const price = Number(priceRaw)
    if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
      return fail('Please enter a valid price.')
    }

    // A seasonal window must be the right way round.
    if (availableFrom && availableTo && availableFrom > availableTo) {
      return fail('The season end date must be after the start date.')
    }

    if (id) {
      await query(
        `UPDATE menu_items
            SET name = $2, category_id = $3, description = $4,
                image_url = NULLIF($5,''), tag = NULLIF($6,''), price = $7,
                is_featured = $8, is_available = $9,
                available_from = NULLIF($10,'')::date,
                available_to = NULLIF($11,'')::date,
                updated_at = now()
          WHERE id = $1`,
        [
          id,
          name,
          categoryId,
          description,
          imageUrl,
          tag,
          price,
          isFeatured,
          isAvailable,
          availableFrom,
          availableTo,
        ],
      )
      revalidateMenu()
      return ok(`${name} updated.`)
    }

    // New dishes go to the end of their category.
    const slugBase = slugify(name) || 'dish'
    const existing = await queryOne<{ count: string }>(
      `SELECT count(*)::text AS count FROM menu_items WHERE slug LIKE $1`,
      [`${slugBase}%`],
    )
    const slug = Number(existing?.count ?? 0) > 0 ? `${slugBase}-${Date.now() % 10000}` : slugBase

    await query(
      `INSERT INTO menu_items
         (category_id, slug, name, description, price, image_url, tag,
          is_featured, is_available, available_from, available_to, position)
       VALUES ($1,$2,$3,$4,$5,NULLIF($6,''),NULLIF($7,''),$8,$9,
               NULLIF($10,'')::date, NULLIF($11,'')::date,
               COALESCE((SELECT max(position)+1 FROM menu_items WHERE category_id = $1), 0))`,
      [
        categoryId,
        slug,
        name,
        description,
        price,
        imageUrl,
        tag,
        isFeatured,
        isAvailable,
        availableFrom,
        availableTo,
      ],
    )

    revalidateMenu()
    return ok(`${name} added to the menu.`)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not save the dish.')
  }
}

/** Fast inline toggle used by the out-of-stock switch on the menu table. */
export async function toggleAvailabilityAction(
  _prev: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  try {
    await requirePermissionForAction('menu.manage')

    const id = text(formData, 'id', 64)
    if (!id) return fail('Missing dish.')

    const row = await queryOne<{ name: string; is_available: boolean }>(
      `UPDATE menu_items SET is_available = NOT is_available, updated_at = now()
        WHERE id = $1 RETURNING name, is_available`,
      [id],
    )
    if (!row) return fail('Dish not found.')

    revalidateMenu()
    return ok(row.is_available ? `${row.name} is available again.` : `${row.name} marked out of stock.`)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not update availability.')
  }
}

/**
 * Soft-deletes a dish. Historic orders reference menu items, so the row is
 * deactivated rather than removed — order history must stay intact.
 */
export async function deleteMenuItemAction(
  _prev: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  try {
    await requirePermissionForAction('menu.manage')

    const id = text(formData, 'id', 64)
    if (!id) return fail('Missing dish.')

    const row = await queryOne<{ name: string }>(
      `UPDATE menu_items SET is_active = FALSE, is_available = FALSE, updated_at = now()
        WHERE id = $1 RETURNING name`,
      [id],
    )
    if (!row) return fail('Dish not found.')

    revalidateMenu()
    return ok(`${row.name} removed from the menu.`)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not remove the dish.')
  }
}

// -------------------------------------------------------------- categories

export async function saveCategoryAction(
  _prev: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  try {
    await requirePermissionForAction('menu.manage')

    const id = text(formData, 'id', 64)
    const label = text(formData, 'label', 80)
    const description = text(formData, 'description', 300)

    if (label.length < 2) return fail('Please enter a category name.')

    if (id) {
      await query(`UPDATE menu_categories SET label = $2, description = $3 WHERE id = $1`, [
        id,
        label,
        description,
      ])
      revalidateMenu()
      return ok(`${label} updated.`)
    }

    const slug = slugify(label) || `category-${Date.now() % 10000}`
    const clash = await queryOne(`SELECT 1 FROM menu_categories WHERE slug = $1`, [slug])
    if (clash) return fail('A category with that name already exists.')

    await query(
      `INSERT INTO menu_categories (slug, label, description, position)
       VALUES ($1,$2,$3, COALESCE((SELECT max(position)+1 FROM menu_categories), 0))`,
      [slug, label, description],
    )

    revalidateMenu()
    return ok(`${label} added.`)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not save the category.')
  }
}

/** Moves a category up or down in the public ordering. */
export async function reorderCategoryAction(
  _prev: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  try {
    await requirePermissionForAction('menu.manage')

    const id = text(formData, 'id', 64)
    const direction = text(formData, 'direction', 10)
    if (!id || !['up', 'down'].includes(direction)) return fail('Invalid move.')

    const current = await queryOne<{ position: number }>(
      `SELECT position FROM menu_categories WHERE id = $1`,
      [id],
    )
    if (!current) return fail('Category not found.')

    // Find the immediate neighbour in the requested direction and swap places.
    const neighbour = await queryOne<{ id: string; position: number }>(
      direction === 'up'
        ? `SELECT id, position FROM menu_categories WHERE position < $1
             ORDER BY position DESC LIMIT 1`
        : `SELECT id, position FROM menu_categories WHERE position > $1
             ORDER BY position ASC LIMIT 1`,
      [current.position],
    )
    if (!neighbour) return ok('Already at the end.')

    await query(`UPDATE menu_categories SET position = $2 WHERE id = $1`, [id, neighbour.position])
    await query(`UPDATE menu_categories SET position = $2 WHERE id = $1`, [
      neighbour.id,
      current.position,
    ])

    revalidateMenu()
    return ok('Order updated.')
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not reorder.')
  }
}

/** Categories are only removable once they hold no active dishes. */
export async function deleteCategoryAction(
  _prev: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  try {
    await requirePermissionForAction('menu.manage')

    const id = text(formData, 'id', 64)
    if (!id) return fail('Missing category.')

    const inUse = await queryOne<{ count: string }>(
      `SELECT count(*)::text AS count FROM menu_items WHERE category_id = $1 AND is_active`,
      [id],
    )
    if (Number(inUse?.count ?? 0) > 0) {
      return fail('Move or remove the dishes in this category first.')
    }

    await query(`DELETE FROM menu_categories WHERE id = $1`, [id])
    revalidateMenu()
    return ok('Category removed.')
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not remove the category.')
  }
}
