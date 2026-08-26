import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PremiumFeatures from '@/components/PremiumFeatures'
import { getCurrentUser } from '@/lib/auth'
import { getRestaurantInfo } from '@/lib/settings'

/**
 * Shared chrome for every dedicated route page (menu, gallery, about, chef,
 * reviews, contact). Keeps the navbar, floating actions and footer identical
 * to the homepage so the design language never diverges between pages.
 */
export default async function PageShell({ children }: { children: ReactNode }) {
  // The footer shows CMS-managed contact details, so read them here once.
  const [user, info] = await Promise.all([getCurrentUser(), getRestaurantInfo()])

  return (
    <>
      <PremiumFeatures />
      <Navbar user={user} />
      <main>{children}</main>
      <Footer info={info} />
    </>
  )
}
