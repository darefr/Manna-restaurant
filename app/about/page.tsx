import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import AboutPageContent from '@/components/pages/AboutPageContent'
import { getPublicMenuForDisplay } from '@/lib/menu-data'
import { getAboutContent, getOpeningHours, getRestaurantInfo } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The story of Manna Restaurant and Tandoori — a highway kitchen at Devchuli-13, Daldale, Nawalpur serving authentic Indian and Nepali food, with dine-in, takeaway and home delivery.',
  alternates: { canonical: '/about' },
}

// Story copy, hours and contact details come from the CMS, and the shell
// renders the signed-in navbar, so this page is rendered per request.
export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  // Read live CMS content so admin edits appear on the public about page.
  const [menu, info, hours, about] = await Promise.all([
    getPublicMenuForDisplay(),
    getRestaurantInfo(),
    getOpeningHours(),
    getAboutContent(),
  ])

  return (
    <PageShell>
      <AboutPageContent menu={menu} info={info} hours={hours} about={about} />
    </PageShell>
  )
}
