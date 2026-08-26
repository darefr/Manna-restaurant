'use client'

import { useActionState, useState } from 'react'

import {
  deleteCouponAction,
  saveCouponAction,
  toggleCouponAction,
  type CmsActionState,
} from '@/app/actions/admin-cms'

const initial: CmsActionState = { status: 'idle' }

export type AdminCoupon = {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: string
  min_order: string
  starts_at: string | null
  ends_at: string | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[#c9a84c]'

const money = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`

export default function CouponManager({ coupons }: { coupons: AdminCoupon[] }) {
  const [editing, setEditing] = useState<AdminCoupon | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-5">
        <p className="text-xs text-muted-foreground">
          {coupons.length} coupons · {coupons.filter((c) => c.is_active).length} active
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setCreating(true)
          }}
          className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-black"
        >
          Create coupon
        </button>
      </div>

      {creating || editing ? (
        <CouponForm
          key={editing?.id ?? 'new'}
          coupon={editing}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} onEdit={() => setEditing(coupon)} />
        ))}
      </div>

      {coupons.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
          No coupons configured yet.
        </p>
      ) : null}
    </div>
  )
}

function CouponCard({ coupon, onEdit }: { coupon: AdminCoupon; onEdit: () => void }) {
  const [toggleState, toggle, toggling] = useActionState(toggleCouponAction, initial)
  const [deleteState, remove, removing] = useActionState(deleteCouponAction, initial)
  const [confirming, setConfirming] = useState(false)

  const offer =
    coupon.discount_type === 'PERCENT'
      ? `${Number(coupon.discount_value)}% off`
      : `${money(Number(coupon.discount_value))} off`

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-gold">{coupon.code}</p>
          <p className="text-xs text-muted-foreground">{coupon.description || 'No description'}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
            coupon.is_active
              ? 'bg-emerald-500/12 text-emerald-300'
              : 'bg-red-500/12 text-red-300'
          }`}
        >
          {coupon.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <dl className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <dt>Offer</dt>
        <dd className="text-right text-beige">{offer}</dd>
        <dt>Minimum</dt>
        <dd className="text-right text-beige">{money(Number(coupon.min_order))}</dd>
        <dt>Used</dt>
        <dd className="text-right text-beige">
          {coupon.used_count}
          {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
        </dd>
        {coupon.ends_at ? (
          <>
            <dt>Expires</dt>
            <dd className="text-right text-beige">
              {new Date(coupon.ends_at).toLocaleDateString('en-GB')}
            </dd>
          </>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-[#c9a84c]"
        >
          Edit
        </button>

        <form action={toggle}>
          <input type="hidden" name="id" value={coupon.id} />
          <button
            type="submit"
            disabled={toggling}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted-foreground disabled:opacity-50"
          >
            {toggling ? '…' : coupon.is_active ? 'Disable' : 'Enable'}
          </button>
        </form>

        <form
          action={remove}
          onSubmit={(event) => {
            if (!confirming) {
              event.preventDefault()
              setConfirming(true)
            }
          }}
        >
          <input type="hidden" name="id" value={coupon.id} />
          <button
            type="submit"
            disabled={removing}
            className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            {confirming ? 'Confirm delete' : 'Delete'}
          </button>
        </form>
      </div>

      {toggleState.status === 'error' ? (
        <p className="text-[11px] text-red-300">{toggleState.message}</p>
      ) : null}
      {deleteState.message ? (
        <p
          className={`text-[11px] ${
            deleteState.status === 'error' ? 'text-red-300' : 'text-emerald-300'
          }`}
        >
          {deleteState.message}
        </p>
      ) : null}
    </article>
  )
}

function CouponForm({ coupon, onClose }: { coupon: AdminCoupon | null; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveCouponAction, initial)

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl border border-[#c9a84c]/30 bg-card/80 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-beige">
          {coupon ? `Edit ${coupon.code}` : 'New coupon'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {coupon ? <input type="hidden" name="id" value={coupon.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Code</span>
          <input
            name="code"
            defaultValue={coupon?.code ?? ''}
            required
            placeholder="WELCOME10"
            className={`${inputClass} font-mono uppercase`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Discount type
          </span>
          <select
            name="discountType"
            defaultValue={coupon?.discount_type ?? 'PERCENT'}
            className={inputClass}
          >
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed amount (Rs.)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Discount value
          </span>
          <input
            name="discountValue"
            type="number"
            min="1"
            step="1"
            defaultValue={coupon ? Number(coupon.discount_value) : ''}
            required
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
            defaultValue={coupon ? Number(coupon.min_order) : 0}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Total usage limit
          </span>
          <input
            name="usageLimit"
            type="number"
            min="1"
            step="1"
            defaultValue={coupon?.usage_limit ?? ''}
            placeholder="Unlimited"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Per-guest limit
          </span>
          <input
            name="perUserLimit"
            type="number"
            min="1"
            step="1"
            defaultValue={1}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Expires (optional)
          </span>
          <input
            name="endsAt"
            type="date"
            defaultValue={coupon?.ends_at ? coupon.ends_at.slice(0, 10) : ''}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Description
          </span>
          <input
            name="description"
            defaultValue={coupon?.description ?? ''}
            placeholder="10% off your first order"
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={coupon ? coupon.is_active : true}
          className="h-4 w-4 accent-[#c9a84c]"
        />
        Active
      </label>

      {state.status === 'error' ? <p className="text-sm text-red-300">{state.message}</p> : null}
      {state.status === 'success' ? (
        <p className="text-sm text-emerald-300">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#c9a84c] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {pending ? 'Saving…' : coupon ? 'Save changes' : 'Create coupon'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
