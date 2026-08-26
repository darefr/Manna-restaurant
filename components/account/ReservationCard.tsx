'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { cancelMyReservation, rescheduleMyReservation } from '@/app/actions/reservation-manage'
import { formatDate, StatusBadge } from '@/components/account/ui'

export type ReservationView = {
  id: number
  reference: string | null
  date: string
  time: string
  guests: number
  status: string
  tableName: string | null
  occasion: string | null
  requests: string | null
}

export default function ReservationCard({
  reservation,
  slots,
  editable,
}: {
  reservation: ReservationView
  slots: readonly string[]
  editable: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [date, setDate] = useState(reservation.date)
  const [time, setTime] = useState(reservation.time)
  const [guests, setGuests] = useState(reservation.guests)

  function handleCancel() {
    if (!window.confirm('Cancel this reservation? This cannot be undone.')) return
    setMessage(null)
    startTransition(async () => {
      const result = await cancelMyReservation(reservation.id)
      setMessage(result.message)
      if (result.ok) router.refresh()
    })
  }

  function handleSave() {
    setMessage(null)
    startTransition(async () => {
      const result = await rescheduleMyReservation(reservation.id, date, time, guests)
      setMessage(result.message)
      if (result.ok) {
        setEditing(false)
        router.refresh()
      }
    })
  }

  return (
    <li className="glass-card rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-serif text-lg text-beige">
            {formatDate(reservation.date)} · {reservation.time}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
            {reservation.tableName ? ` · Table ${reservation.tableName}` : ''}
            {reservation.reference ? ` · ${reservation.reference}` : ''}
          </p>
          {reservation.occasion ? (
            <p className="mt-1 text-sm text-muted-foreground">Occasion: {reservation.occasion}</p>
          ) : null}
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      {editing ? (
        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-border bg-black/30 px-3 py-2.5 text-sm text-beige outline-none focus:border-gold/50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Time</span>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border border-border bg-black/30 px-3 py-2.5 text-sm text-beige outline-none focus:border-gold/50"
            >
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Guests</span>
            <input
              type="number"
              min={1}
              max={40}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="rounded-lg border border-border bg-black/30 px-3 py-2.5 text-sm text-beige outline-none focus:border-gold/50"
            />
          </label>

          <div className="flex gap-3 sm:col-span-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="btn-gold text-xs disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-beige"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : editable ? (
        <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn-outline-gold text-xs"
          >
            Change
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            className="text-xs uppercase tracking-[0.2em] text-red-300 transition-colors hover:text-red-200 disabled:opacity-50"
          >
            {pending ? 'Working…' : 'Cancel booking'}
          </button>
        </div>
      ) : null}

      {message ? (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </li>
  )
}
