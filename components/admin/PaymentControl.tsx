'use client'

import { useActionState } from 'react'

import { updatePaymentStatusAction, type AdminActionState } from '@/app/actions/admin-orders'
import { PAYMENT_STATUSES } from '@/lib/order-constants'

const initial: AdminActionState = { status: 'idle' }

export default function PaymentControl({
  orderId,
  current,
}: {
  orderId: string
  current: string
}) {
  const [state, action, pending] = useActionState(updatePaymentStatusAction, initial)

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="flex gap-2">
        <select
          name="paymentStatus"
          defaultValue={current}
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-[#c9a84c]"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {pending ? 'Saving' : 'Save'}
        </button>
      </div>

      {state.status === 'error' ? (
        <p className="text-[11px] text-red-300">{state.message}</p>
      ) : null}
      {state.status === 'success' ? (
        <p className="text-[11px] text-emerald-300">{state.message}</p>
      ) : null}
    </form>
  )
}
