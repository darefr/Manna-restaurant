'use client'

import { useActionState, useState } from 'react'

import { submitReviewAction, type ReviewState } from '@/app/actions/account'

const EMPTY: ReviewState = { status: 'idle' }

export type ReviewableOrder = { id: string; reference: string }

export default function ReviewForm({ orders }: { orders: ReviewableOrder[] }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, EMPTY)
  const [rating, setRating] = useState(5)

  const inputClass =
    'w-full rounded-lg border border-border bg-black/30 px-3.5 py-2.5 text-sm text-beige placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-gold/50'

  return (
    <form action={formAction} className="glass-card flex flex-col gap-5 rounded-xl p-6">
      <h3 className="font-serif text-lg text-beige">Write a review</h3>

      {orders.length > 0 ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Order</span>
          <select name="orderId" className={inputClass} defaultValue={orders[0].id}>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.reference}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="orderId" value="" />
      )}

      {/* Rating */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rating</legend>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              aria-pressed={rating === value}
              className={[
                'h-11 w-11 rounded-lg border text-lg transition-colors',
                value <= rating
                  ? 'border-gold/40 bg-gold/12 text-gold'
                  : 'border-border text-muted-foreground hover:border-gold/25',
              ].join(' ')}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Title</span>
        <input name="title" placeholder="Best momo in Devchuli" className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Your review
        </span>
        <textarea
          name="body"
          rows={5}
          required
          minLength={10}
          placeholder="Tell us about the food and the service."
          className={`${inputClass} resize-y`}
        />
      </label>

      {state.status !== 'idle' && state.message ? (
        <p
          role={state.status === 'error' ? 'alert' : 'status'}
          className={`text-sm ${state.status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <button type="submit" disabled={pending} className="btn-gold text-xs disabled:opacity-50">
          {pending ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </form>
  )
}
