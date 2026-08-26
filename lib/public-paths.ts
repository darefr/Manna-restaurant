/**
 * Public routes that render CMS-managed data.
 *
 * Kept in one place so a new page that consumes live data only has to be
 * listed here for every admin action to revalidate it correctly.
 */

/** Routes that render menu items, prices, categories or dish counts. */
export const PUBLIC_MENU_PATHS = [
  '/', // homepage menu section + WhatsApp order form
  '/menu',
  '/order',
  '/about', // dish/section counts in the hero and story
  '/chef', // signature dish prices
  '/reviews', // "at a glance" price band
] as const

/** Routes that render gallery photographs. */
export const PUBLIC_GALLERY_PATHS = [
  '/', // homepage gallery teaser
  '/gallery',
] as const

/** Routes that render the about story copy. */
export const PUBLIC_ABOUT_PATHS = ['/', '/about'] as const
