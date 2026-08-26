import Link from 'next/link'
import { getAdminCustomers } from '@/lib/admin-data'
import { requirePermission } from '@/lib/auth'
import { Card, PageHeader, Th, Td, StatusBadge } from '@/components/admin/ui'

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePermission('customers.view')
  const q = (await searchParams).q ?? ''
  const customers = await getAdminCustomers(q)
  return (
    <main className="space-y-6">
      <PageHeader title="Customers" subtitle="A live view of guests, orders, loyalty and retention." />
      <form className="flex gap-3" method="get">
        <input name="q" defaultValue={q} placeholder="Search name, email or phone" className="w-full max-w-md rounded-lg border border-border bg-card px-4 py-3 text-sm text-beige outline-none focus:border-gold" />
        <button className="btn-gold rounded-lg px-5 text-xs font-semibold uppercase tracking-widest">Search</button>
      </form>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr><Th>Guest</Th><Th>Status</Th><Th align="right">Orders</Th><Th align="right">Spent</Th><Th align="right">Points</Th><Th>Last order</Th></tr></thead><tbody>
          {customers.map((c) => <tr key={c.id} className="border-t border-border/70 hover:bg-white/[.02]"><Td><Link href={`/admin/customers/${c.id}`} className="font-medium text-beige hover:text-gold">{c.name}</Link><div className="mt-1 text-xs text-muted-foreground">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div></Td><Td><StatusBadge label={c.emailVerified ? 'Verified' : 'Unverified'} tone={c.emailVerified ? 'green' : 'yellow'} /></Td><Td align="right">{c.orderCount}</Td><Td align="right">Rs. {c.spent.toLocaleString('en-IN')}</Td><Td align="right">{c.points.toLocaleString()}</Td><Td>{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-IN') : '—'}</Td></tr>)}
        </tbody></table></div>
        {customers.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No customers found.</p>}
      </Card>
    </main>
  )
}
