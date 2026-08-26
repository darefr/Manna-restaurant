import CouponManager from '@/components/admin/CouponManager'
import { PageHeader } from '@/components/admin/ui'
import { getAdminCoupons } from '@/lib/admin-data'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  await requirePermission('coupons.manage')
  const coupons = await getAdminCoupons()

  return (
    <main className="space-y-6">
      <PageHeader
        title="Coupons"
        subtitle="Create offers, set limits and track redemption performance."
      />
      <CouponManager coupons={coupons} />
    </main>
  )
}
