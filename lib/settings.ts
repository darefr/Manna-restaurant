import { isDatabaseConfigured, query, withDb } from './db'
import { restaurant } from './restaurant'

/** CMS-backed site content with safe fallbacks to the verified static data. */

export type RestaurantInfo = {
  name: string
  tagline: string
  subtitle: string
  addressLine1: string
  addressLine2: string
  phoneReception: string
  phoneChef: string
  phoneAlt: string
  whatsapp: string
  email: string
  instagram: string
  mapsUrl: string
}

export type OpeningHoursDay = {
  day: string
  open: string
  close: string
  closed: boolean
}

export type OpeningHours = {
  note: string
  verified: boolean
  days: OpeningHoursDay[]
}

export type OrderingSettings = {
  deliveryFee: number
  taxPercent: number
  pointsPerHundred: number
  pointValue: number
  minOrder: number
}

const DEFAULT_INFO: RestaurantInfo = {
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
}

const DEFAULT_HOURS: OpeningHours = {
  note: restaurant.hoursNote,
  verified: restaurant.hoursVerified,
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
    (day) => ({ day, open: '', close: '', closed: false }),
  ),
}

export const DEFAULT_ORDERING: OrderingSettings = {
  deliveryFee: 0,
  taxPercent: 0,
  pointsPerHundred: 5,
  pointValue: 1,
  minOrder: 0,
}

async function readContent<T>(key: string, fallback: T): Promise<T> {
  if (!isDatabaseConfigured) return fallback
  try {
    return await withDb(async () => {
      const rows = await query<{ value: T }>('SELECT value FROM site_content WHERE key = $1', [key])
      if (!rows[0]) return fallback
      return { ...fallback, ...(rows[0].value as object) } as T
    })
  } catch {
    return fallback
  }
}

export function getRestaurantInfo() {
  return readContent<RestaurantInfo>('restaurant_info', DEFAULT_INFO)
}

export function getOpeningHours() {
  return readContent<OpeningHours>('opening_hours', DEFAULT_HOURS)
}

export function getOrderingSettings() {
  return readContent<OrderingSettings>('ordering', DEFAULT_ORDERING)
}

export function getAboutContent() {
  return readContent<{ heading: string; body: string }>('about_text', { heading: 'Our Story', body: '' })
}

export async function saveContent(key: string, value: unknown, userId: string) {
  await query(
    `INSERT INTO site_content (key, value, updated_by, updated_at)
     VALUES ($1, $2::jsonb, $3, now())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [key, JSON.stringify(value), userId],
  )
}

/** WhatsApp number for order handoff — configurable via CMS or env. */
export async function getWhatsappNumber() {
  const info = await getRestaurantInfo()
  const digits = (info.whatsapp || '').replace(/\D/g, '')
  if (digits) return digits
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || restaurant.whatsapp).replace(/\D/g, '')
}
