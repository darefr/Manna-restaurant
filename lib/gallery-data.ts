import 'server-only'

import { isDatabaseConfigured, query, withDb } from './db'
import { images as assets, restaurant } from './restaurant'

/**
 * Public gallery photograph, already shaped for the presentational grids used
 * by the homepage and the gallery page.
 */
export type GalleryShot = {
  id: string
  src: string
  alt: string
  caption: string | null
  /** Grouping used by the gallery page tabs. */
  group: GalleryGroup
  isFeatured: boolean
}

export type GalleryGroup = 'restaurant' | 'food' | 'chef' | 'events'

export const GALLERY_GROUPS: GalleryGroup[] = ['restaurant', 'food', 'chef', 'events']

function isGroup(value: string): value is GalleryGroup {
  return (GALLERY_GROUPS as string[]).includes(value)
}

/**
 * Alt text for the curated photography. Rows added through the CMS supply
 * their own caption; these keep the seeded assets described accurately for
 * screen readers even when an admin leaves the caption blank.
 */
const ALT_BY_SRC: Record<string, string> = {
  [assets.storefront]: `${restaurant.name} shopfront on the Rampur Highway`,
  [assets.diningRoom]: 'Indoor dining area with table seating',
  [assets.exteriorFlags]: 'Restaurant exterior decorated with festival bunting',
  [assets.exteriorWide]: 'Street view of the restaurant in Daldale, Devchuli',
  [assets.chef]: 'Chef stretching fresh naan dough at the tandoor',
  [assets.logo]: `${restaurant.name} logo artwork`,
  [assets.jholMomo]: 'Bowls of jhol momo ready to serve',
  [assets.kotheyMomo]: 'Pan-fried kothey momo with chilli chutney',
  [assets.tandooriChicken]: 'Charcoal tandoori chicken',
  [assets.chickenTikka]: 'Chicken tikka with capsicum and onion',
  [assets.friedRice]: 'Fried rice topped with boiled egg',
  [assets.chickenWings]: 'Chicken hot wings in chilli sauce',
  [assets.khajaPlatter]: 'Chicken khaja set sharing platter',
  [assets.khajaPlatterClose]: 'Close view of the chicken khaja set platter',
  [assets.octopusChilli]: 'Octopus chilli from the sea food menu',
  [assets.curry]: 'Curry served at the restaurant',
}

function altFor(src: string, caption: string | null): string {
  if (caption && caption.trim()) return caption.trim()
  return ALT_BY_SRC[src] ?? `Photograph taken at ${restaurant.name}`
}

/**
 * Curated fallback used only when DATABASE_URL is absent or the gallery table
 * is empty, so the public site never renders an empty grid.
 */
function staticFallback(): GalleryShot[] {
  const restaurantShots: Array<[string, GalleryGroup]> = [
    [assets.storefront, 'restaurant'],
    [assets.diningRoom, 'restaurant'],
    [assets.exteriorFlags, 'restaurant'],
    [assets.exteriorWide, 'restaurant'],
    [assets.chef, 'chef'],
    [assets.logo, 'restaurant'],
  ]

  const foodShots: Array<[string, GalleryGroup]> = [
    [assets.jholMomo, 'food'],
    [assets.kotheyMomo, 'food'],
    [assets.tandooriChicken, 'food'],
    [assets.chickenTikka, 'food'],
    [assets.friedRice, 'food'],
    [assets.chickenWings, 'food'],
    [assets.khajaPlatter, 'food'],
    [assets.khajaPlatterClose, 'food'],
    [assets.octopusChilli, 'food'],
    [assets.curry, 'food'],
    ...assets.more.map((src) => [src, 'food'] as [string, GalleryGroup]),
  ]

  return [...restaurantShots, ...foodShots].map(([src, group], index) => ({
    id: `static-${index}`,
    src,
    alt: altFor(src, null),
    caption: null,
    group,
    isFeatured: index < 6,
  }))
}

type GalleryRow = {
  id: string
  url: string
  caption: string | null
  category: string
  is_featured: boolean
}

/**
 * Live gallery from the CMS: active photographs only, in admin-defined order.
 * Falls back to the curated set when the database is unavailable so the public
 * site keeps rendering rather than crashing.
 */
export async function getPublicGallery(): Promise<GalleryShot[]> {
  if (!isDatabaseConfigured) return staticFallback()

  try {
    const shots = await withDb(async () => {
      const rows = await query<GalleryRow>(
        `SELECT id, url, caption, category, is_featured
           FROM gallery_images
          WHERE is_active = TRUE
          ORDER BY position, created_at DESC`,
      )

      return rows.map((row) => ({
        id: row.id,
        src: row.url,
        alt: altFor(row.url, row.caption),
        caption: row.caption,
        group: isGroup(row.category) ? row.category : ('restaurant' as GalleryGroup),
        isFeatured: row.is_featured,
      }))
    })

    return shots.length > 0 ? shots : staticFallback()
  } catch (error) {
    console.error('[manna] gallery load failed, using curated photographs', error)
    return staticFallback()
  }
}

/**
 * A shorter selection for the homepage teaser grid. Featured photographs come
 * first so admins control what greets a visitor, then the rest in CMS order.
 */
export async function getHomepageGallery(limit = 12): Promise<GalleryShot[]> {
  const shots = await getPublicGallery()
  const featured = shots.filter((shot) => shot.isFeatured)
  const rest = shots.filter((shot) => !shot.isFeatured)
  return [...featured, ...rest].slice(0, limit)
}
