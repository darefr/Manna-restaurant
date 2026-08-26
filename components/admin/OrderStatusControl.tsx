'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import { updateOrderStatusAction, type AdminActionState } from '@/app/actions/admin-orders'
import { STATUS_FLOW, STATUS_LABELS, type OrderStatus } from '@/lib/order-constants'

const initial: AdminActionState = { status: 'idle' }

/** Statuses we always want a second confirmation for. */
const DESTRUCTIVE: OrderStatus[] = ['CANCELLED']

export default function OrderStatusControl({
  orderId,
  status,
  compact = false,
}: {
  orderId: string
  status: OrderStatus
  compact?: boolean
}) {
  const [state, action, pending] = useActionState(updateOrderStatusAction, initial)
  const [confirming, setConfirming] = useState<OrderStatus | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const nextRef = useRef<HTMLInputElement>(null)

  // Close the confirmation prompt once the server has responded.
  useEffect(() => {
    if (state.status !== 'idle') setConfirming(null)
  }, [state])

  const options = STATUS_FLOW[status] ?? []

  function submit(next: OrderStatus) {
    if (DESTRUCTIVE.includes(next) && confirming !== next) {
      setConfirming(next)
      return
    }
    if (nextRef.current) nextRef.current.value = next
    formRef.current?.requestSubmit()
  }

  if (options.length === 0) {
    return <p className="text-xs text-muted-foreground">No further updates for this order.</p>
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="status" ref={nextRef} defaultValue="" />

      <div className="flex flex-wrap gap-2">
        {options.map((next) => {
          const danger = DESTRUCTIVE.includes(next)
          return (
            <button
              key={next}
              type="button"
              disabled={pending}
              onClick={() => submit(next)}
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
                compact ? 'text-[11px]' : '',
                danger
                  ? 'border-red-500/40 text-red-300 hover:bg-red-500/10'
                  : 'border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10',
              ].join(' ')}
            >
              {confirming === next ? 'Tap to confirm' : STATUS_LABELS[next]}
            </button>
          )
        })}
      </div>

      {confirming ? (
        <p className="text-[11px] text-red-300">
          Cancelling restores any redeemed points and coupon usage. Tap the button again to confirm.
        </p>
      ) : null}

      {state.status === 'error' ? (
        <p className="text-[11px] text-red-300">{state.message}</p>
      ) : null}
      {state.status === 'success' ? (
        <p className="text-[11px] text-emerald-300">{state.message}</p>
      ) : null}
    </form>
  )
}
