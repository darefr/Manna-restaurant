'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { reorderAction } from '@/app/actions/order'
import { useCart } from '@/components/cart/CartProvider'

/**
 * One-click reorder. The server resolves the previous order's items against
 * the *current* menu (skipping anything unavailable) and returns the lines,
 * which are then loaded into the cart.
 */
export default function ReorderButton({
  orderId,
  className = '',
}: {
  orderId: string
  className?: string
}) {
  const router = useRouter()
  const { replace } = useCart()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await reorderAction(orderId)
      if (!result.ok) {
        setError(result.error ?? 'Could not rebuild that order.')
        return
      }
      replace(result.lines)
      router.push('/order')
    })
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`btn-outline-gold text-xs disabled:opacity-50 ${className}`}
      >
        {pending ? 'Rebuilding…' : 'Reorder'}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-red-300">
          {error}
        </span>
      ) : null}
    </span>
  )
}
