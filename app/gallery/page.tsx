import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import GalleryPageContent from '@/components/pages/GalleryPageContent'
import { getPublicGallery } from '@/lib/gallery-data'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photographs of Manna Restaurant and Tandoori in Devchuli-13, Daldale — our shopfront, dining room, tandoor kitchen and the momo, tandoori and khaja sets we serve.',
  alternates: { canonical: '/gallery' },
}

// Photographs come from the CMS, and the shell renders the signed-in navbar,
// so this page is rendered per request.
export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  // Read the live gallery so CMS additions and removals appear at once.
  const shots = await getPublicGallery()

  return (
    <PageShell>
      <GalleryPageContent shots={shots} />
    </PageShell>
  )
}
