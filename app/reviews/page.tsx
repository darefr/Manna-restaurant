import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import ReviewsPageContent from '@/components/pages/ReviewsPageContent'
import { getPublicMenuForDisplay } from '@/lib/menu-data'

export const metadata: Metadata = {
  title: 'Reviews',
  description:
    'What guests come back to Manna Restaurant and Tandoori in Devchuli for — momo and jhol momo, charcoal tandoori, generous plates and home delivery. Read and leave reviews on Google.',
  alternates: { canonical: '/reviews' },
}

// The stat band reads live menu prices, and the shell renders the signed-in
// navbar, so this page is rendered per request.
export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  // Read the live menu so the stat band tracks admin edits.
  const menu = await getPublicMenuForDisplay()

  return (
    <PageShell>
      <ReviewsPageContent menu={menu} />
    </PageShell>
  )
}
