import ContentManager from '@/components/admin/ContentManager'
import { PageHeader } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getAboutContent, getOpeningHours, getRestaurantInfo } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  await requirePermission('cms.manage')

  const [info, hours, about] = await Promise.all([
    getRestaurantInfo(),
    getOpeningHours(),
    getAboutContent(),
  ])

  return (
    <main className="space-y-6">
      <PageHeader
        title="Content"
        subtitle="Edit the restaurant details, opening hours and story shown across the public site."
      />
      <ContentManager info={info} hours={hours} about={about} />
    </main>
  )
}
