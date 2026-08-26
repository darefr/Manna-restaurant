'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  Calendar,
  Clock,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { createReservation, type ReservationState } from '@/app/actions/reservation'
import { restaurant } from '@/lib/restaurant'

// Slots span the full serving day, not just an evening dinner service.
const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
  '8:00 PM', '9:00 PM',
]
const guestOptions = ['1', '2', '3', '4', '5', '6', '8', '10', '15', '20']

const initialState: ReservationState = { status: 'idle' }

const inputClass =
  'w-full glass-card rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground gold-border focus:outline-none focus:border-[#c9a84c]/60 focus:ring-0 transition-colors bg-transparent'
const labelClass =
  'block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-medium'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-gold px-10 py-4 rounded-full text-sm font-semibold tracking-[0.2em] uppercase shrink-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Sending
        </>
      ) : (
        'Request a Table'
      )}
    </button>
  )
}

export default function Reservation() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })
  const [state, formAction] = useActionState(createReservation, initialState)

  const errors = state.fieldErrors ?? {}

  return (
    <section id="reservation" className="py-32 md:py-44 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.03] blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Book Your Visit
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6">Reserve a Table</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed text-pretty">
            Send us your details and we will call you back to confirm your table. For same-day
            bookings and large groups, calling us directly is fastest.
          </p>
        </motion.div>

        {state.status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto glass-card gold-border rounded-2xl p-8 sm:p-12 text-center"
          >
            <CheckCircle size={48} className="text-[#c9a84c] mx-auto mb-6" />
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">Request Received</h3>
            <p className="text-muted-foreground leading-relaxed mb-6 text-pretty">
              Thank you. We have your booking request and a member of our team will call you shortly
              to confirm the table.
            </p>
            {state.reference && (
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
                Reference{' '}
                <span className="text-[#c9a84c] font-semibold">{state.reference}</span>
              </p>
            )}
            <div className="section-divider mx-auto mb-6" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your table is not confirmed until we speak with you. To confirm right away, call{' '}
              <a
                href={`tel:${restaurant.phones.reception.number}`}
                className="text-[#c9a84c] hover:underline"
              >
                {restaurant.phones.reception.display}
              </a>
              .
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form action={formAction} className="glass-card gold-border rounded-2xl p-6 sm:p-8 md:p-12">
              {state.status === 'error' && state.message && (
                <div className="mb-8 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200 leading-relaxed">{state.message}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Date */}
                <div>
                  <label htmlFor="date" className={labelClass}>
                    <Calendar size={10} className="inline mr-1.5" />
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    aria-invalid={Boolean(errors.date)}
                    className={inputClass}
                    style={{ colorScheme: 'dark' }}
                  />
                  <FieldError message={errors.date} />
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className={labelClass}>
                    <Clock size={10} className="inline mr-1.5" />
                    Time
                  </label>
                  <select
                    id="time"
                    name="time"
                    required
                    defaultValue=""
                    aria-invalid={Boolean(errors.time)}
                    className={inputClass}
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <FieldError message={errors.time} />
                </div>

                {/* Guests */}
                <div>
                  <label htmlFor="guests" className={labelClass}>
                    <Users size={10} className="inline mr-1.5" />
                    Number of Guests
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    required
                    defaultValue=""
                    aria-invalid={Boolean(errors.guests)}
                    className={inputClass}
                  >
                    <option value="">Select guests</option>
                    {guestOptions.map((g) => (
                      <option key={g} value={g}>
                        {g} {Number.parseInt(g, 10) === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.guests} />
                </div>

                {/* Occasion */}
                <div>
                  <label htmlFor="occasion" className={labelClass}>
                    Occasion (Optional)
                  </label>
                  <select id="occasion" name="occasion" defaultValue="" className={inputClass}>
                    <option value="">Select occasion</option>
                    <option>Family meal</option>
                    <option>Birthday</option>
                    <option>Anniversary</option>
                    <option>Party / Group booking</option>
                    <option>Business meeting</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    <User size={10} className="inline mr-1.5" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Your full name"
                    aria-invalid={Boolean(errors.name)}
                    className={inputClass}
                  />
                  <FieldError message={errors.name} />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    <Phone size={10} className="inline mr-1.5" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    placeholder="98XXXXXXXX"
                    aria-invalid={Boolean(errors.phone)}
                    className={inputClass}
                  />
                  <FieldError message={errors.phone} />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label htmlFor="email" className={labelClass}>
                    <Mail size={10} className="inline mr-1.5" />
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    aria-invalid={Boolean(errors.email)}
                    className={inputClass}
                  />
                  <FieldError message={errors.email} />
                </div>

                {/* Special requests */}
                <div className="md:col-span-2">
                  <label htmlFor="requests" className={labelClass}>
                    <MessageSquare size={10} className="inline mr-1.5" />
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="requests"
                    name="requests"
                    rows={3}
                    placeholder="Veg only, less spicy, seating preference, delivery order..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-xs text-muted-foreground max-w-sm text-center sm:text-left leading-relaxed">
                  This sends a booking request. We will call you on the number above to confirm your
                  table.
                </p>
                <SubmitButton />
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </section>
  )
}
