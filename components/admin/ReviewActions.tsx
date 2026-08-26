'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { updateReviewStatus } from '@/app/actions/admin'

type ActionResult = { ok: boolean; message?: string } | null

function Submit({ status }: { status: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      disabled={pending}
      className="rounded-md border border-border px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-gold hover:text-gold disabled:opacity-50"
    >
      {pending ? 'Saving' : status}
    </button>
  )
}

export function ReviewActions({ id, current }: { id: string; current: string }) {
  const [state, action] = useActionState<ActionResult, FormData>(async (_prev, fd) => {
    const result = await updateReviewStatus(fd)
    return result?.status === 'error'
      ? { ok: false, message: result.message }
      : { ok: true }
  }, null)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="APPROVED" />
        <Submit status={current === 'APPROVED' ? 'Approved' : 'Approve'} />
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="HIDDEN" />
        <Submit status="Hide" />
      </form>
      {state?.ok ? <span className="text-xs text-emerald-300">Saved</span> : null}
      {state && !state.ok ? (
        <span className="text-xs text-red-300">{state.message ?? 'Could not update.'}</span>
      ) : null}
    </div>
  )
}
