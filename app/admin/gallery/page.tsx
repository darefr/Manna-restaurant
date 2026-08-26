import GalleryManager from '@/components/admin/GalleryManager'
import { PageHeader } from '@/components/admin/ui'
import { getGalleryImages } from '@/lib/admin-data'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  await requirePermission('cms.manage')
  const images = await getGalleryImages()

  return (
    <main className="space-y-6">
      <PageHeader
        title="Gallery"
        subtitle="Manage the visual library used across Manna’s public pages."
      />
      <GalleryManager images={images} />
    </main>
  )
}
