import { query } from './db'
import { hashPassword } from './password'
import { images, menu, restaurant, signatureDishes } from './restaurant'

/**
 * Seeding is strictly additive.
 *
 * - Menu categories/items are inserted only if the slug does not already exist.
 *   Admin edits (price, availability, description) are therefore never
 *   overwritten by a later cold start.
 * - The SUPER_ADMIN account is created if missing, or safely promoted if the
 *   email already exists. Existing data on that row is preserved.
 */

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const featuredNames = new Set(signatureDishes.map((dish) => dish.name.toLowerCase()))

const dishImageByName: Record<string, string> = {}
for (const dish of signatureDishes) {
  dishImageByName[dish.name.toLowerCase()] = dish.image
}

async function seedMenu() {
  const [{ count }] = await query<{ count: string }>('SELECT count(*)::text AS count FROM menu_categories')
  const alreadySeeded = Number(count) > 0

  for (const [categoryIndex, category] of menu.entries()) {
    const rows = await query<{ id: string }>(
      `INSERT INTO menu_categories (slug, label, image_url, position)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [category.id, category.label, category.image, categoryIndex],
    )

    let categoryId = rows[0]?.id
    if (!categoryId) {
      const existing = await query<{ id: string }>(
        'SELECT id FROM menu_categories WHERE slug = $1',
        [category.id],
      )
      categoryId = existing[0]?.id
    }
    if (!categoryId) continue

    // Once the catalogue exists, never re-insert items that an admin may have
    // deliberately deleted.
    if (alreadySeeded) continue

    for (const [itemIndex, item] of category.items.entries()) {
      const key = item.name.toLowerCase()
      await query(
        `INSERT INTO menu_items
           (category_id, slug, name, price, tag, image_url, is_featured, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO NOTHING`,
        [
          categoryId,
          `${category.id}-${slugify(item.name)}`,
          item.name,
          item.price,
          item.tag ?? null,
          dishImageByName[key] ?? category.image ?? null,
          featuredNames.has(key),
          itemIndex,
        ],
      )
    }
  }
}

async function seedTables() {
  const [{ count }] = await query<{ count: string }>(
    'SELECT count(*)::text AS count FROM restaurant_tables',
  )
  if (Number(count) > 0) return

  const layout = [
    { name: 'T1', capacity: 2, section: 'Main Hall' },
    { name: 'T2', capacity: 2, section: 'Main Hall' },
    { name: 'T3', capacity: 4, section: 'Main Hall' },
    { name: 'T4', capacity: 4, section: 'Main Hall' },
    { name: 'T5', capacity: 4, section: 'Main Hall' },
    { name: 'T6', capacity: 6, section: 'Main Hall' },
    { name: 'G1', capacity: 4, section: 'Garden' },
    { name: 'G2', capacity: 6, section: 'Garden' },
    { name: 'F1', capacity: 8, section: 'Family Room' },
    { name: 'F2', capacity: 10, section: 'Family Room' },
  ]

  for (const table of layout) {
    await query(
      `INSERT INTO restaurant_tables (name, capacity, section)
       VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
      [table.name, table.capacity, table.section],
    )
  }
}

async function seedGallery() {
  const [{ count }] = await query<{ count: string }>(
    'SELECT count(*)::text AS count FROM gallery_images',
  )
  if (Number(count) > 0) return

  const entries: Array<{ url: string; category: string; caption: string }> = [
    { url: images.storefront, category: 'restaurant', caption: 'Manna Restaurant and Tandoori shopfront' },
    { url: images.diningRoom, category: 'restaurant', caption: 'Dining room' },
    { url: images.exteriorFlags, category: 'restaurant', caption: 'Exterior' },
    { url: images.exteriorWide, category: 'restaurant', caption: 'Exterior, wide view' },
    { url: images.chef, category: 'chef', caption: 'Our kitchen team' },
    { url: images.jholMomo, category: 'food', caption: 'Jhol Momo' },
    { url: images.kotheyMomo, category: 'food', caption: 'Kothey Momo' },
    { url: images.tandooriChicken, category: 'food', caption: 'Tandoori chicken' },
    { url: images.chickenTikka, category: 'food', caption: 'Chicken tikka' },
    { url: images.friedRice, category: 'food', caption: 'Fried rice' },
    { url: images.chickenWings, category: 'food', caption: 'Chicken wings' },
    { url: images.octopusChilli, category: 'food', caption: 'Octopus chilli' },
    { url: images.khajaPlatter, category: 'food', caption: 'Chicken Khaja Set' },
  ]

  // Remaining real photography from the asset repo.
  for (const url of images.more) {
    if (!entries.some((entry) => entry.url === url)) {
      entries.push({ url, category: 'food', caption: '' })
    }
  }

  for (const [index, entry] of entries.entries()) {
    await query(
      `INSERT INTO gallery_images (url, caption, category, is_featured, position)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (url) DO NOTHING`,
      [entry.url, entry.caption || null, entry.category, index < 6, index],
    )
  }
}

async function seedRewards() {
  const [{ count }] = await query<{ count: string }>('SELECT count(*)::text AS count FROM rewards')
  if (Number(count) > 0) return

  const rewards = [
    { name: 'Free Veg Momo', description: 'One plate of Veg Momo on the house.', points: 200 },
    { name: 'Rs. 100 Off', description: 'Rs. 100 off your next order.', points: 300 },
    { name: 'Free Jhol Momo', description: 'One plate of our house-favourite Jhol Momo.', points: 400 },
    { name: 'Rs. 250 Off', description: 'Rs. 250 off orders over Rs. 800.', points: 700 },
    { name: 'Chicken Khaja Set', description: 'A full sharing platter, free.', points: 1200 },
  ]

  for (const reward of rewards) {
    await query(
      'INSERT INTO rewards (name, description, points_cost) VALUES ($1, $2, $3)',
      [reward.name, reward.description, reward.points],
    )
  }
}

async function seedSiteContent() {
  const defaults: Array<[string, unknown]> = [
    [
      'restaurant_info',
      {
        name: restaurant.name,
        tagline: restaurant.tagline,
        subtitle: restaurant.subtitle,
        addressLine1: restaurant.address.line1,
        addressLine2: restaurant.address.line2,
        phoneReception: restaurant.phones.reception.display,
        phoneChef: restaurant.phones.chef.display,
        phoneAlt: restaurant.phones.alt.display,
        whatsapp: restaurant.whatsapp,
        email: restaurant.email ?? '',
        instagram: restaurant.instagram.url,
        mapsUrl: restaurant.maps.directionsUrl,
      },
    ],
    [
      'opening_hours',
      {
        note: restaurant.hoursNote,
        verified: restaurant.hoursVerified,
        days: [
          { day: 'Sunday', open: '', close: '', closed: false },
          { day: 'Monday', open: '', close: '', closed: false },
          { day: 'Tuesday', open: '', close: '', closed: false },
          { day: 'Wednesday', open: '', close: '', closed: false },
          { day: 'Thursday', open: '', close: '', closed: false },
          { day: 'Friday', open: '', close: '', closed: false },
          { day: 'Saturday', open: '', close: '', closed: false },
        ],
      },
    ],
    ['about_text', { heading: 'Our Story', body: '' }],
    ['ordering', { deliveryFee: 0, taxPercent: 0, pointsPerHundred: 5, pointValue: 1, minOrder: 0 }],
  ]

  for (const [key, value] of defaults) {
    await query(
      `INSERT INTO site_content (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)],
    )
  }
}

/**
 * Creates or promotes the initial SUPER_ADMIN.
 * Password comes from ADMIN_PASSWORD — it is never hardcoded. If the variable
 * is absent, the account is still created/promoted without a password so the
 * rest of the platform works; the admin simply cannot sign in until it is set.
 */
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'manna@gmail.com').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  const existing = await query<{ id: string; role: string; password_hash: string | null }>(
    'SELECT id, role, password_hash FROM users WHERE email_lower = $1',
    [email],
  )

  const passwordHash = password ? await hashPassword(password) : null

  if (existing.length === 0) {
    await query(
      `INSERT INTO users (email, name, role, email_verified, password_hash)
       VALUES ($1, $2, 'SUPER_ADMIN', TRUE, $3)
       ON CONFLICT DO NOTHING`,
      [email, 'Manna Administrator', passwordHash],
    )
    return
  }

  // Promote in place — existing orders, reviews and loyalty stay intact.
  const admin = existing[0]
  await query(
    `UPDATE users
        SET role = 'SUPER_ADMIN',
            email_verified = TRUE,
            is_active = TRUE,
            password_hash = COALESCE($2, password_hash),
            updated_at = now()
      WHERE id = $1`,
    [admin.id, passwordHash],
  )
}

export async function seedDatabase() {
  await seedMenu()
  await seedTables()
  await seedGallery()
  await seedRewards()
  await seedSiteContent()
  await seedAdmin()
}
