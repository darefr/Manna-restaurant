'use client'

import { useActionState } from 'react'

import { saveOrderingSettingsAction, type CmsActionState } from '@/app/actions/admin-cms'
import type { OrderingSettings } from '@/lib/settings'

const initial: CmsActionState = { status: 'idle' }

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[#c9a84c]'

export default function OrderingSettingsForm({ settings }: { settings: OrderingSettings }) {
  const [state, action, pending] = useActionState(saveOrderingSettingsAction, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Delivery fee (Rs.)
          </span>
          <input
            name="deliveryFee"
            type="number"
            min="0"
            step="1"
            defaultValue={settings.deliveryFee}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Tax (%)
          </span>
          <input
            name="taxPercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            defaultValue={settings.taxPercent}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Minimum order (Rs.)
          </span>
          <input
            name="minOrder"
            type="number"
            min="0"
            step="1"
            defaultValue={settings.minOrder}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Points per Rs. 100
          </span>
          <input
            name="pointsPerHundred"
            type="number"
            min="0"
            step="1"
            defaultValue={settings.pointsPerHundred}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Value of one point (Rs.)
          </span>
          <input
            name="pointValue"
            type="number"
            min="0"
            step="0.1"
            defaultValue={settings.pointValue}
            className={inputClass}
          />
        </label>
      </div>

      {state.status === 'error' ? <p className="text-sm text-red-300">{state.message}</p> : null}
      {state.status === 'success' ? (
        <p className="text-sm text-emerald-300">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-[#c9a84c] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  )
}
