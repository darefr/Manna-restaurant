import OrderingSettingsForm from '@/components/admin/OrderingSettingsForm'
import { Card, PageHeader } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getOrderingSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const staff = await requirePermission('settings.manage')
  const ordering = await getOrderingSettings()

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Operational configuration and access context for this Manna workspace."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Ordering" className="lg:col-span-2">
          <OrderingSettingsForm settings={ordering} />
        </Card>

        <Card title="Workspace">
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Signed in as</dt>
              <dd className="text-right text-beige">{staff.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-right text-beige">{staff.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-right uppercase tracking-widest text-gold">{staff.role}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Data and security">
          <p className="text-sm leading-6 text-muted-foreground">
            Menu, orders, reservations, customer accounts and staff access are stored in the
            connected Postgres database. Sensitive passwords are hashed and payment card data is
            never stored.
          </p>
        </Card>
      </div>
    </>
  )
}
