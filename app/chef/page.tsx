import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import ChefPageContent from '@/components/pages/ChefPageContent'
import { getPublicMenuForDisplay } from '@/lib/menu-data'

export const metadata: Metadata = {
  title: 'Our Chef',
  description:
    'Meet the tandoor kitchen at Manna Restaurant and Tandoori in Devchuli — hand-stretched naan, charcoal tandoori chicken, momo folded to order and our signature dishes.',
  alternates: { canonical: '/chef' },
}

// Signature dish prices come from the CMS, and the shell renders the
// signed-in navbar, so this page is rendered per request.
export const dynamic = 'force-dynamic'

export default async function ChefPage() {
  // Read the live menu so dish counts track admin edits.
  const menu = await getPublicMenuForDisplay()

  return (
    <PageShell>
      <ChefPageContent menu={menu} />
    </PageShell>
  )
}
