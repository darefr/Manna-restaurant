import { PageHeader, Card, Th, Td, StatusBadge } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getAdminTables } from '@/lib/admin-data'

export default async function AdminTablesPage() {
  await requirePermission('tables.manage')
  const tables = await getAdminTables()
  return <main className="space-y-6"><PageHeader title="Tables" subtitle="Manage seating capacity and sections used by reservations." /><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[620px]"><thead><tr><Th>Table</Th><Th>Section</Th><Th align="right">Capacity</Th><Th>Status</Th></tr></thead><tbody>{tables.map((t) => <tr key={t.id} className="border-t border-border/70"><Td className="font-medium text-beige">{t.name}</Td><Td>{t.section}</Td><Td align="right">{t.capacity} guests</Td><Td><StatusBadge label={t.is_active ? 'Active' : 'Inactive'} tone={t.is_active ? 'green' : 'red'} /></Td></tr>)}</tbody></table></div>{tables.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No tables configured.</p>}</Card></main>
}
