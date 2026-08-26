'use client'

import { useActionState } from 'react'

import { deactivateStaffAction, type ReviewActionState } from '@/app/actions/admin-reviews'

const initial: ReviewActionState = { status: 'success', message: '' }

export default function StaffAccessToggle({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const [state, action, pending] = useActionState(deactivateStaffAction, initial)

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(!isActive)} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs uppercase tracking-widest text-gold transition-colors hover:text-gold-light disabled:opacity-50"
      >
        {pending ? '…' : isActive ? 'Deactivate' : 'Activate'}
      </button>
      {state.status === 'error' && state.message ? (
        <span className="text-[11px] text-red-300">{state.message}</span>
      ) : null}
    </form>
  )
}
