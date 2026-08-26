'use client'

import CheckoutPanel, { type SavedAddress } from './CheckoutPanel'
import DishPicker, { type PickerCategory } from './DishPicker'

/**
 * Two-column ordering experience: browse on the left, live order summary on
 * the right. Both halves share one cart context. On mobile the summary stacks
 * below the menu so the flow reads top to bottom.
 */
export default function OrderExperience({
  categories,
  favorites,
  signedIn,
  customer,
  addresses,
  pointsBalance,
}: {
  categories: PickerCategory[]
  favorites: string[]
  signedIn: boolean
  customer: { name: string; email: string; phone: string | null } | null
  addresses: SavedAddress[]
  pointsBalance: number
}) {
  // The cart provider lives in the root layout, so a reorder started from the
  // account pages is still in the cart when the guest lands here.
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-10 lg:py-20">
      <div>
        <DishPicker categories={categories} initialFavorites={favorites} signedIn={signedIn} />
      </div>

      <aside className="lg:sticky lg:top-24">
        <CheckoutPanel
          signedIn={signedIn}
          customer={customer}
          addresses={addresses}
          pointsBalance={pointsBalance}
        />
      </aside>
    </div>
  )
}
