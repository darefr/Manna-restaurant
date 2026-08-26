'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { redeemRewardAction } from '@/app/actions/account'

export default function RedeemButton({
  rewardId,
  disabled,
}: {
  rewardId: string
  disabled: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  function handleClick() {
    setFeedback(null)
    startTransition(async () => {
      const result = await redeemRewardAction(rewardId)
      setFeedback({ ok: result.ok, text: result.ok ? (result.message ?? 'Redeemed.') : (result.error ?? 'Could not redeem.') })
      if (result.ok) router.refresh()
    })
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        className="btn-outline-gold text-xs disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? 'Redeeming…' : 'Redeem'}
      </button>
      {feedback ? (
        <span
          role="status"
          className={`text-xs ${feedback.ok ? 'text-emerald-300' : 'text-red-300'}`}
        >
          {feedback.text}
        </span>
      ) : null}
    </span>
  )
}
