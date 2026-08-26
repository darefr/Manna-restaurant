import 'server-only'

import { isDatabaseConfigured, num, query, withDb } from './db'
import { menu as staticMenu, signatureDishes, type MenuCategory } from './restaurant'

export type DbMenuItem = {
  id: string
  categoryId: string
  categorySlug: string
  categoryLabel: string
  slug: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  tag: string | null
  isFeatured: boolean
  isAvailable: boolean
  isActive: boolean
  position: number
  availableFrom: string | null
  availableTo: string | null
}

export type DbMenuCategory = {
  id: string
  slug: string
  label: string
  description: string | null
  imageUrl: string | null
  position: number
  isActive: boolean
  items: DbMenuItem[]
}

type ItemRow = {
  id: string
  category_id: string
  category_slug: string
  category_label: string
  slug: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  tag: string | null
  is_featured: boolean
  is_available: boolean
  is_active: boolean
  position: number
  available_from: string | null
  available_to: string | null
}

function mapItem(row: ItemRow): DbMenuItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryLabel: row.category_label,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: num(row.price),
    imageUrl: row.image_url,
    tag: row.tag,
    isFeatured: row.is_featured,
    isAvailable: row.is_available,
    isActive: row.is_active,
    position: row.position,
    availableFrom: row.available_from,
    availableTo: row.available_to,
  }
}

/**
 * Fallback catalogue used only when DATABASE_URL is absent, so the public site
 * keeps rendering the real menu even before the database is provisioned.
 */
function staticFallback(): DbMenuCategory[] {
  return staticMenu.map((category, categoryIndex) => ({
    id: category.id,
    slug: category.id,
    label: category.label,
    description: null,
    imageUrl: category.image ?? null,
    position: categoryIndex,
    isActive: true,
    items: category.items.map((item, itemIndex) => ({
      id: `${category.id}-${itemIndex}`,
      categoryId: category.id,
      categorySlug: category.id,
      categoryLabel: category.label,
      slug: `${category.id}-${itemIndex}`,
      name: item.name,
      description: null,
      price: item.price,
      imageUrl: category.image ?? null,
      tag: item.tag ?? null,
      isFeatured: signatureDishes.some((dish) => dish.name === item.name),
      isAvailable: true,
      isActive: true,
      position: itemIndex,
      availableFrom: null,
      availableTo: null,
    })),
  }))
}

const SELECT_ITEMS = `
  SELECT i.id, i.category_id, c.slug AS category_slug, c.label AS category_label,
         i.slug, i.name, i.description, i.price, i.image_url, i.tag,
         i.is_featured, i.is_available, i.is_active, i.position,
         i.available_from::text, i.available_to::text
    FROM menu_items i
    JOIN menu_categories c ON c.id = i.category_id
`

/**
 * Public catalogue: active items only, respecting seasonal date windows.
 * Unavailable items are still returned so the UI can show "Currently
 * unavailable" rather than silently hiding a dish guests know about.
 */
export async function getPublicMenu(): Promise<DbMenuCategory[]> {
  if (!isDatabaseConfigured) return staticFallback()

  try {
    return await withDb(async () => {
      const categories = await query<{
        id: string
        slug: string
        label: string
        description: string | null
        image_url: string | null
        position: number
        is_active: boolean
      }>(
        `SELECT id, slug, label, description, image_url, position, is_active
           FROM menu_categories WHERE is_active = TRUE ORDER BY position, label`,
      )

      const items = await query<ItemRow>(
        `${SELECT_ITEMS}
          WHERE i.is_active = TRUE
            AND c.is_active = TRUE
            AND (i.available_from IS NULL OR i.available_from <= CURRENT_DATE)
            AND (i.available_to   IS NULL OR i.available_to   >= CURRENT_DATE)
          ORDER BY i.position, i.name`,
      )

      const mapped = items.map(mapItem)
      const result = categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        label: category.label,
        description: category.description,
        imageUrl: category.image_url,
        position: category.position,
        isActive: category.is_active,
        items: mapped.filter((item) => item.categoryId === category.id),
      }))

      const populated = result.filter((category) => category.items.length > 0)
      return populated.length > 0 ? populated : staticFallback()
    })
  } catch (error) {
    console.error('[manna] menu load failed, using static catalogue', error)
    return staticFallback()
  }
}

/**
 * The live menu mapped into the presentational shape used by the marketing
 * pages (`MenuCategory` from `lib/restaurant`). This lets the public menu and
 * homepage render straight from the database — so an admin price change shows
 * up on the site immediately — without altering their markup.
 *
 * Category artwork falls back to the curated static image when a row has none,
 * so the design never renders an empty tile.
 */
export async function getPublicMenuForDisplay(): Promise<MenuCategory[]> {
  const categories = await getPublicMenu()
  const fallbackImage = new Map(staticMenu.map((category) => [category.id, category.image]))

  return categories.map((category) => ({
    id: category.slug,
    label: category.label,
    image: category.imageUrl || fallbackImage.get(category.slug) || '',
    items: category.items.map((item) => ({
      name: item.name,
      price: item.price,
      desc: item.description ?? undefined,
      tag: item.tag ?? undefined,
      // Carried through so public menus can mark a dish sold out instead of
      // hiding it — guests still see everything the kitchen serves.
      soldOut: !item.isAvailable,
    })),
  }))
}

/** Admin catalogue: everything, including inactive and out-of-stock items. */
export async function getAdminMenu(): Promise<DbMenuCategory[]> {
  return withDb(async () => {
    const categories = await query<{
      id: string
      slug: string
      label: string
      description: string | null
      image_url: string | null
      position: number
      is_active: boolean
    }>(
      `SELECT id, slug, label, description, image_url, position, is_active
         FROM menu_categories ORDER BY position, label`,
    )

    const items = await query<ItemRow>(`${SELECT_ITEMS} ORDER BY i.position, i.name`)
    const mapped = items.map(mapItem)

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      label: category.label,
      description: category.description,
      imageUrl: category.image_url,
      position: category.position,
      isActive: category.is_active,
      items: mapped.filter((item) => item.categoryId === category.id),
    }))
  })
}

export async function getFeaturedItems(limit = 3): Promise<DbMenuItem[]> {
  if (!isDatabaseConfigured) {
    return staticFallback()
      .flatMap((category) => category.items)
      .filter((item) => item.isFeatured)
      .slice(0, limit)
  }

  try {
    return await withDb(async () => {
      const rows = await query<ItemRow>(
        `${SELECT_ITEMS}
          WHERE i.is_featured = TRUE AND i.is_active = TRUE AND c.is_active = TRUE
          ORDER BY i.position LIMIT $1`,
        [limit],
      )
      return rows.map(mapItem)
    })
  } catch {
    return []
  }
}

export async function getMenuItemsByIds(ids: string[]): Promise<DbMenuItem[]> {
  if (ids.length === 0) return []
  const rows = await query<ItemRow>(`${SELECT_ITEMS} WHERE i.id = ANY($1::uuid[])`, [ids])
  return rows.map(mapItem)
}

export async function getFavoriteItems(userId: string): Promise<DbMenuItem[]> {
  const rows = await query<ItemRow>(
    `${SELECT_ITEMS}
       JOIN favorites f ON f.menu_item_id = i.id
      WHERE f.user_id = $1 AND i.is_active = TRUE
      ORDER BY f.created_at DESC`,
    [userId],
  )
  return rows.map(mapItem)
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const rows = await query<{ menu_item_id: string }>(
    'SELECT menu_item_id FROM favorites WHERE user_id = $1',
    [userId],
  )
  return rows.map((row) => row.menu_item_id)
}

/**
 * Recommendations derived from the customer's own order history:
 * popular dishes from the categories they order from, excluding what they
 * already ordered. Falls back to house favourites for new customers.
 */
export async function getRecommendations(userId: string, limit = 4): Promise<DbMenuItem[]> {
  const rows = await query<ItemRow>(
    `WITH my_items AS (
       SELECT DISTINCT oi.menu_item_id
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
        WHERE o.user_id = $1 AND oi.menu_item_id IS NOT NULL
     ),
     my_categories AS (
       SELECT DISTINCT i.category_id
         FROM menu_items i
         JOIN my_items m ON m.menu_item_id = i.id
     ),
     popularity AS (
       SELECT oi.menu_item_id, count(*)::int AS orders
         FROM order_items oi
        WHERE oi.menu_item_id IS NOT NULL
        GROUP BY oi.menu_item_id
     )
     SELECT i.id, i.category_id, c.slug AS category_slug, c.label AS category_label,
            i.slug, i.name, i.description, i.price, i.image_url, i.tag,
            i.is_featured, i.is_available, i.is_active, i.position,
            i.available_from::text, i.available_to::text
       FROM menu_items i
       JOIN menu_categories c ON c.id = i.category_id
       LEFT JOIN popularity p ON p.menu_item_id = i.id
      WHERE i.is_active = TRUE
        AND i.is_available = TRUE
        AND c.is_active = TRUE
        AND i.id NOT IN (SELECT menu_item_id FROM my_items)
        AND (
          i.category_id IN (SELECT category_id FROM my_categories)
          OR i.is_featured = TRUE
        )
      ORDER BY
        (i.category_id IN (SELECT category_id FROM my_categories)) DESC,
        COALESCE(p.orders, 0) DESC,
        i.is_featured DESC,
        i.position
      LIMIT $2`,
    [userId, limit],
  )
  return rows.map(mapItem)
}
