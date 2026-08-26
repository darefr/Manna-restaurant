import Link from 'next/link'

import ReservationCard from '@/components/account/ReservationCard'
import { EmptyState, SectionHeader } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getCustomerReservations, RESERVATION_SLOTS } from '@/lib/reservations'

export const metadata = { title: 'Reservations' }

export default async function ReservationsPage() {
  const user = await requireUser()
  const all = await getCustomerReservations(user.id)

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = all.filter((r) => r.date >= today && r.status !== 'cancelled')
  const past = all.filter((r) => r.date < today || r.status === 'cancelled')

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionHeader
          title="Upcoming"
          action={
            <Link href="/reservations" className="btn-outline-gold text-xs">
              Book a table
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming reservations"
            message="Book a table and you will be able to change or cancel it from here."
            actionHref="/reservations"
            actionLabel="Book a table"
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {upcoming.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                slots={RESERVATION_SLOTS}
                editable
              />
            ))}
          </ul>
        )}
      </div>

      {past.length > 0 ? (
        <div>
          <SectionHeader title="Past & cancelled" />
          <ul className="flex flex-col gap-4">
            {past.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                slots={RESERVATION_SLOTS}
                editable={false}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
