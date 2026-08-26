'use client'

import { useActionState } from 'react'

import { moderateReviewAction, type ReviewActionState } from '@/app/actions/admin-reviews'

const initial: ReviewActionState = { status: 'success', message: '' }

const STATUSES = ['APPROVED', 'PENDING', 'HIDDEN'] as const

/** Moderation controls with inline feedback, so failures are never silent. */
export default function ReviewModeration({ id }: { id: string }) {
  const [state, action, pending] = useActionState(moderateReviewAction, initial)

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
      {STATUSES.map((status) => (
        <form key={status} action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
          >
            {status}
          </button>
        </form>
      ))}

      {state.message ? (
        <span
          className={`text-xs ${
            state.status === 'error' ? 'text-red-300' : 'text-emerald-300'
          }`}
        >
          {state.message}
        </span>
      ) : null}
    </div>
  )
}
