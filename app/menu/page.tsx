import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import MenuPageContent from '@/components/pages/MenuPageContent'
import { getPublicMenuForDisplay } from '@/lib/menu-data'

export const metadata: Metadata = {
  title: 'Menu & Prices',
  description:
    'The full menu at Manna Restaurant and Tandoori in Devchuli-13, Daldale. Momo, tandoori chicken, fried rice, chow mein, thukpa, sadeko, khaja sets and sea food, with prices in Nepalese Rupees.',
  alternates: { canonical: '/menu' },
}

// Prices and availability come from the CMS, and the shell renders the
// signed-in navbar, so this page is rendered per request.
export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  // Read the live menu so admin price and availability edits appear at once.
  const menu = await getPublicMenuForDisplay()

  return (
    <PageShell>
      <MenuPageContent menu={menu} />
    </PageShell>
  )
}
