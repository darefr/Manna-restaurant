'use client'

import { useActionState, useState } from 'react'

import {
  deleteCategoryAction,
  reorderCategoryAction,
  saveCategoryAction,
  type MenuActionState,
} from '@/app/actions/admin-menu'

const initial: MenuActionState = { status: 'idle' }

export type AdminCategoryRow = {
  id: string
  label: string
  description: string
  itemCount: number
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[#c9a84c]'

export default function CategoryManager({ categories }: { categories: AdminCategoryRow[] }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(saveCategoryAction, initial)

  return (
    <section className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Categories
        </h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-xs text-[#c9a84c] hover:underline"
        >
          {open ? 'Hide' : 'Add category'}
        </button>
      </div>

      {open ? (
        <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Name</span>
            <input name="label" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Description
            </span>
            <input name="description" className={inputClass} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Add'}
          </button>

          {state.status !== 'idle' ? (
            <p
              className={`sm:col-span-3 text-xs ${
                state.status === 'error' ? 'text-red-300' : 'text-emerald-300'
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </form>
      ) : null}

      <ul className="mt-4 flex flex-col divide-y divide-white/5">
        {categories.map((category, index) => (
          <CategoryRow
            key={category.id}
            category={category}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}
      </ul>
    </section>
  )
}

function CategoryRow({
  category,
  isFirst,
  isLast,
}: {
  category: AdminCategoryRow
  isFirst: boolean
  isLast: boolean
}) {
  const [, reorder, reordering] = useActionState(reorderCategoryAction, initial)
  const [deleteState, remove, removing] = useActionState(deleteCategoryAction, initial)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm text-foreground">{category.label}</p>
        <p className="text-[11px] text-muted-foreground">
          {category.itemCount} {category.itemCount === 1 ? 'dish' : 'dishes'}
          {category.description ? ` · ${category.description}` : ''}
        </p>
        {deleteState.status === 'error' ? (
          <p className="mt-1 text-[11px] text-red-300">{deleteState.message}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <form action={reorder}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="direction" value="up" />
          <button
            type="submit"
            disabled={isFirst || reordering}
            aria-label={`Move ${category.label} up`}
            className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-muted-foreground disabled:opacity-30"
          >
            ↑
          </button>
        </form>

        <form action={reorder}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="direction" value="down" />
          <button
            type="submit"
            disabled={isLast || reordering}
            aria-label={`Move ${category.label} down`}
            className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-muted-foreground disabled:opacity-30"
          >
            ↓
          </button>
        </form>

        <form action={remove}>
          <input type="hidden" name="id" value={category.id} />
          <button
            type="submit"
            disabled={removing || category.itemCount > 0}
            title={
              category.itemCount > 0 ? 'Move or remove the dishes in this category first' : undefined
            }
            className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs text-red-300 disabled:opacity-30"
          >
            Remove
          </button>
        </form>
      </div>
    </li>
  )
}
