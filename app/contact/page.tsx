import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import ContactPageContent from '@/components/pages/ContactPageContent'
import { getOpeningHours, getRestaurantInfo } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Contact & Location',
  description:
    'Contact Manna Restaurant and Tandoori at Devchuli-13, Daldale, Nawalpur on the Rampur Highway. Phone numbers, map, directions, WhatsApp ordering, home delivery and home packing.',
  alternates: { canonical: '/contact' },
}

// Phone numbers, address and hours come from the CMS, and the shell renders
// the signed-in navbar, so this page is rendered per request.
export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  // Read live CMS details so admin edits appear on the public contact page.
  const [info, hours] = await Promise.all([getRestaurantInfo(), getOpeningHours()])

  return (
    <PageShell>
      <ContactPageContent info={info} hours={hours} />
    </PageShell>
  )
}
