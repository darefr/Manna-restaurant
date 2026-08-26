'use client'

import Image from 'next/image'
import { useActionState, useMemo, useState } from 'react'

import {
  deleteMenuItemAction,
  saveMenuItemAction,
  toggleAvailabilityAction,
  type MenuActionState,
} from '@/app/actions/admin-menu'

const initial: MenuActionState = { status: 'idle' }

export type AdminMenuItem = {
  id: string
  categoryId: string
  categorySlug: string
  categoryLabel: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  tag: string | null
  isFeatured: boolean
  isAvailable: boolean
  availableFrom: string | null
  availableTo: string | null
}

export type AdminCategory = { id: string; label: string; slug: string }

const money = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[#c9a84c]'

export default function MenuManager({
  items,
  categories,
}: {
  items: AdminMenuItem[]
  categories: AdminCategory[]
}) {
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editing, setEditing] = useState<AdminMenuItem | null>(null)
  const [creating, setCreating] = useState(false)

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase()
    return items.filter((item) => {
      if (categoryFilter && item.categoryId !== categoryFilter) return false
      if (!term) return true
      return (
        item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)
      )
    })
  }, [items, filter, categoryFilter])

  const outOfStock = items.filter((i) => !i.isAvailable).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card/60 p-5">
        <label className="flex min-w-48 flex-1 flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Search</span>
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search dishes"
            className={inputClass}
          />
        </label>

        <label className="flex min-w-44 flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Category
          </span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setCreating(true)
          }}
          className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-black"
        >
          Add dish
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {items.length} dishes on the menu
        {outOfStock > 0 ? ` · ${outOfStock} currently out of stock` : ''}
      </p>

      {creating || editing ? (
        <DishForm
          key={editing?.id ?? 'new'}
          item={editing}
          categories={categories}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <DishCard key={item.id} item={item} onEdit={() => setEditing(item)} />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
          No dishes match this filter.
        </p>
      ) : null}
    </div>
  )
}

function DishCard({ item, onEdit }: { item: AdminMenuItem; onEdit: () => void }) {
  const [toggleState, toggle, toggling] = useActionState(toggleAvailabilityAction, initial)
  const [deleteState, remove, removing] = useActionState(deleteMenuItemAction, initial)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/60">
      <div className="relative aspect-[16/10] bg-black/40">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className={`object-cover ${item.isAvailable ? '' : 'opacity-40 grayscale'}`}
          />
        ) : null}
        {!item.isAvailable ? (
          <span className="absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red-300">
            Out of stock
          </span>
        ) : null}
        {item.isFeatured ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#c9a84c] px-2.5 py-1 text-[10px] uppercase tracking-wider text-black">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {item.categoryLabel}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-[#c9a84c]">{money(item.price)}</p>
        </div>

        {item.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        ) : null}

        {item.availableFrom || item.availableTo ? (
          <p className="text-[11px] text-[#c9a84c]">
            Seasonal: {item.availableFrom ?? '—'} to {item.availableTo ?? '—'}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-[#c9a84c]"
          >
            Edit
          </button>

          <form action={toggle}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={toggling}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                item.isAvailable
                  ? 'border-white/15 text-muted-foreground hover:border-red-400/50 hover:text-red-300'
                  : 'border-emerald-400/40 text-emerald-300'
              }`}
            >
              {toggling ? '…' : item.isAvailable ? 'Mark out of stock' : 'Mark available'}
            </button>
          </form>

          <form
            action={remove}
            onSubmit={(event) => {
              if (!confirmingDelete) {
                event.preventDefault()
                setConfirmingDelete(true)
              }
            }}
          >
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={removing}
              className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {confirmingDelete ? 'Confirm remove' : 'Remove'}
            </button>
          </form>
        </div>

        {toggleState.status === 'error' ? (
          <p className="text-[11px] text-red-300">{toggleState.message}</p>
        ) : null}
        {deleteState.status === 'error' ? (
          <p className="text-[11px] text-red-300">{deleteState.message}</p>
        ) : null}
      </div>
    </article>
  )
}

function DishForm({
  item,
  categories,
  onClose,
}: {
  item: AdminMenuItem | null
  categories: AdminCategory[]
  onClose: () => void
}) {
  const [state, action, pending] = useActionState(saveMenuItemAction, initial)

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl border border-[#c9a84c]/30 bg-card/80 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-beige">{item ? `Edit ${item.name}` : 'New dish'}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Name</span>
          <input name="name" defaultValue={item?.name ?? ''} required className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Category
          </span>
          <select
            name="categoryId"
            defaultValue={item?.categoryId ?? categories[0]?.id ?? ''}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Price (Rs.)
          </span>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue={item?.price ?? ''}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Tag (optional)
          </span>
          <input
            name="tag"
            defaultValue={item?.tag ?? ''}
            placeholder="Chef's Special"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Description
          </span>
          <textarea
            name="description"
            rows={3}
            defaultValue={item?.description ?? ''}
            className={`${inputClass} resize-none`}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Image path
          </span>
          <input
            name="imageUrl"
            defaultValue={item?.imageUrl ?? ''}
            placeholder="/assets/food/momo.jpg"
            className={inputClass}
          />
          <span className="text-[11px] text-muted-foreground">
            Use a path from the restaurant photo library, e.g. /assets/food/...
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Season starts (optional)
          </span>
          <input
            type="date"
            name="availableFrom"
            defaultValue={item?.availableFrom ?? ''}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Season ends (optional)
          </span>
          <input
            type="date"
            name="availableTo"
            defaultValue={item?.availableTo ?? ''}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isAvailable"
            defaultChecked={item ? item.isAvailable : true}
            className="h-4 w-4 accent-[#c9a84c]"
          />
          Available to order
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={item?.isFeatured ?? false}
            className="h-4 w-4 accent-[#c9a84c]"
          />
          Featured on the homepage
        </label>
      </div>

      {state.status === 'error' ? (
        <p className="text-sm text-red-300">{state.message}</p>
      ) : null}
      {state.status === 'success' ? (
        <p className="text-sm text-emerald-300">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#c9a84c] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {pending ? 'Saving…' : item ? 'Save changes' : 'Add dish'}
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
