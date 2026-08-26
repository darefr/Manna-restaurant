'use client'

import { useActionState, useState } from 'react'

import {
  deleteGalleryImageAction,
  reorderGalleryImageAction,
  saveGalleryImageAction,
  type CmsActionState,
} from '@/app/actions/admin-cms'

const initial: CmsActionState = { status: 'idle' }

export type AdminGalleryImage = {
  id: string
  url: string
  caption: string | null
  category: string
  is_featured: boolean
  is_active: boolean
  position: number
}

const CATEGORIES = ['restaurant', 'food', 'chef', 'events']

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[#c9a84c]'

export default function GalleryManager({ images }: { images: AdminGalleryImage[] }) {
  const [editing, setEditing] = useState<AdminGalleryImage | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-5">
        <p className="text-xs text-muted-foreground">
          {images.length} images · {images.filter((i) => i.is_active).length} visible on the site
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setCreating(true)
          }}
          className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-black"
        >
          Add image
        </button>
      </div>

      {creating || editing ? (
        <ImageForm
          key={editing?.id ?? 'new'}
          image={editing}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} onEdit={() => setEditing(image)} />
        ))}
      </div>

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
          No gallery images yet.
        </p>
      ) : null}
    </div>
  )
}

function ImageCard({ image, onEdit }: { image: AdminGalleryImage; onEdit: () => void }) {
  const [deleteState, remove, removing] = useActionState(deleteGalleryImageAction, initial)
  const [moveState, move, moving] = useActionState(reorderGalleryImageAction, initial)
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.caption || 'Manna gallery image'}
        className={`aspect-[4/3] w-full object-cover ${image.is_active ? '' : 'opacity-40 grayscale'}`}
      />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-widest text-gold">{image.category}</span>
          {image.is_featured ? (
            <span className="rounded-full bg-[#c9a84c] px-2 py-0.5 text-[10px] uppercase tracking-wider text-black">
              Featured
            </span>
          ) : null}
        </div>

        <p className="text-sm text-beige">{image.caption || 'Untitled image'}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-[#c9a84c]"
          >
            Edit
          </button>

          <form action={move}>
            <input type="hidden" name="id" value={image.id} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={moving}
              aria-label="Move image earlier"
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted-foreground disabled:opacity-50"
            >
              ↑
            </button>
          </form>

          <form action={move}>
            <input type="hidden" name="id" value={image.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={moving}
              aria-label="Move image later"
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted-foreground disabled:opacity-50"
            >
              ↓
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
            <input type="hidden" name="id" value={image.id} />
            <button
              type="submit"
              disabled={removing}
              className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {confirming ? 'Confirm remove' : 'Remove'}
            </button>
          </form>
        </div>

        {deleteState.status === 'error' ? (
          <p className="text-[11px] text-red-300">{deleteState.message}</p>
        ) : null}
        {moveState.status === 'error' ? (
          <p className="text-[11px] text-red-300">{moveState.message}</p>
        ) : null}
      </div>
    </article>
  )
}

function ImageForm({
  image,
  onClose,
}: {
  image: AdminGalleryImage | null
  onClose: () => void
}) {
  const [state, action, pending] = useActionState(saveGalleryImageAction, initial)

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl border border-[#c9a84c]/30 bg-card/80 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-beige">{image ? 'Edit image' : 'New image'}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {image ? <input type="hidden" name="id" value={image.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Image path
          </span>
          <input
            name="url"
            defaultValue={image?.url ?? ''}
            required
            placeholder="/assets/food/momo.jpg"
            className={inputClass}
          />
          <span className="text-[11px] text-muted-foreground">
            Use a path from the restaurant photo library, e.g. /assets/food/...
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Caption
          </span>
          <input name="caption" defaultValue={image?.caption ?? ''} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Category
          </span>
          <select
            name="category"
            defaultValue={image?.category ?? 'restaurant'}
            className={inputClass}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={image ? image.is_active : true}
            className="h-4 w-4 accent-[#c9a84c]"
          />
          Visible on the site
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={image?.is_featured ?? false}
            className="h-4 w-4 accent-[#c9a84c]"
          />
          Featured
        </label>
      </div>

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
          {pending ? 'Saving…' : image ? 'Save changes' : 'Add image'}
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
