'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, useTransition } from 'react'

import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
  type AddressState,
} from '@/app/actions/account'
import { EmptyState } from '@/components/account/ui'
import type { Address } from '@/lib/customer'

const EMPTY: AddressState = { status: 'idle' }

export default function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Address | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [state, formAction, saving] = useActionState(saveAddressAction, EMPTY)
  const [pending, startTransition] = useTransition()

  // Close the form and refresh the list once a save succeeds.
  useEffect(() => {
    if (state.status === 'success') {
      setShowForm(false)
      setEditing(null)
      router.refresh()
    }
  }, [state, router])

  function handleDelete(id: string) {
    if (!window.confirm('Delete this address?')) return
    startTransition(async () => {
      await deleteAddressAction(id)
      router.refresh()
    })
  }

  function handleDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddressAction(id)
      router.refresh()
    })
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-black/30 px-3.5 py-2.5 text-sm text-beige placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-gold/50'

  return (
    <div className="flex flex-col gap-6">
      {addresses.length === 0 && !showForm ? (
        <EmptyState
          title="No saved addresses"
          message="Save an address to make delivery checkout faster next time."
        />
      ) : null}

      {addresses.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="glass-card flex flex-col rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-serif text-base text-beige">{address.label}</p>
                {address.isDefault ? (
                  <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-gold">
                    Default
                  </span>
                ) : null}
              </div>

              <address className="mt-2 not-italic text-sm leading-relaxed text-muted-foreground">
                {address.recipientName ? (
                  <span className="block text-beige">{address.recipientName}</span>
                ) : null}
                {address.line1}
                {address.line2 ? <>, {address.line2}</> : null}
                {address.landmark ? <>, near {address.landmark}</> : null}
                {address.city ? <>, {address.city}</> : null}
                {address.phone ? <span className="block">{address.phone}</span> : null}
              </address>

              <div className="mt-auto flex flex-wrap items-center gap-4 pt-5 text-xs uppercase tracking-[0.18em]">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(address)
                    setShowForm(true)
                  }}
                  className="text-gold transition-colors hover:text-gold-light"
                >
                  Edit
                </button>
                {!address.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleDefault(address.id)}
                    disabled={pending}
                    className="text-muted-foreground transition-colors hover:text-beige disabled:opacity-50"
                  >
                    Set default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  disabled={pending}
                  className="text-muted-foreground transition-colors hover:text-red-300 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {showForm ? (
        <form action={formAction} className="glass-card flex flex-col gap-4 rounded-xl p-6">
          <input type="hidden" name="id" value={editing?.id ?? ''} />

          <h3 className="font-serif text-lg text-beige">
            {editing ? 'Edit address' : 'New address'}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Label</span>
              <input
                name="label"
                required
                defaultValue={editing?.label ?? 'Home'}
                placeholder="Home"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Recipient
              </span>
              <input
                name="recipientName"
                defaultValue={editing?.recipientName ?? ''}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Address line 1
              </span>
              <input name="line1" required defaultValue={editing?.line1 ?? ''} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Address line 2
              </span>
              <input name="line2" defaultValue={editing?.line2 ?? ''} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Landmark
              </span>
              <input name="landmark" defaultValue={editing?.landmark ?? ''} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">City</span>
              <input name="city" defaultValue={editing?.city ?? ''} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</span>
              <input name="phone" defaultValue={editing?.phone ?? ''} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Delivery notes
              </span>
              <input name="notes" defaultValue={editing?.notes ?? ''} className={inputClass} />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={editing?.isDefault ?? addresses.length === 0}
              className="h-4 w-4 accent-[#c9a84c]"
            />
            Use this as my default address
          </label>

          {state.status === 'error' && state.message ? (
            <p role="alert" className="text-sm text-red-300">
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-gold text-xs disabled:opacity-50">
              {saving ? 'Saving…' : 'Save address'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-beige"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="btn-gold text-xs"
          >
            Add an address
          </button>
        </div>
      )}
    </div>
  )
}
