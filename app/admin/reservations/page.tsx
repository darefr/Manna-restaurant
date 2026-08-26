import { PageHeader, Card, Th, Td, StatusBadge } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getAdminReservations } from '@/lib/admin-data'

export default async function AdminReservationsPage() {
  await requirePermission('reservations.view')
  const reservations = await getAdminReservations()
  return (
    <main className="space-y-6">
      <PageHeader title="Reservations" subtitle="Upcoming bookings and table assignments." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs uppercase tracking-widest text-muted-foreground">Upcoming</p><p className="mt-2 font-serif text-3xl text-gold">{reservations.filter((r) => r.status.toLowerCase() !== 'cancelled').length}</p></Card>
        <Card><p className="text-xs uppercase tracking-widest text-muted-foreground">Guests booked</p><p className="mt-2 font-serif text-3xl text-beige">{reservations.reduce((n, r) => n + r.guests, 0)}</p></Card>
        <Card><p className="text-xs uppercase tracking-widest text-muted-foreground">Pending</p><p className="mt-2 font-serif text-3xl text-amber-300">{reservations.filter((r) => r.status.toLowerCase() === 'pending').length}</p></Card>
      </div>
      <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead><tr><Th>Guest</Th><Th>Date & time</Th><Th>Party</Th><Th>Table</Th><Th>Status</Th><Th>Requests</Th></tr></thead><tbody>{reservations.map((r) => <tr key={r.id} className="border-t border-border/70"><Td><p className="text-beige">{r.name}</p><p className="text-xs text-muted-foreground">{r.phone}{r.email ? ` · ${r.email}` : ''}</p></Td><Td>{new Date(`${r.reserved_date}T${r.reserved_time}`).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</Td><Td>{r.guests}</Td><Td>{r.table_name ? `${r.table_name} · ${r.section}` : 'Unassigned'}</Td><Td><StatusBadge label={r.status} /></Td><Td className="max-w-[220px] text-xs text-muted-foreground">{r.requests || '—'}</Td></tr>)}</tbody></table></div>{reservations.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No upcoming reservations.</p>}</Card>
    </main>
  )
}
