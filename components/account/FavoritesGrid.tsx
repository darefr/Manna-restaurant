'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { toggleFavoriteAction } from '@/app/actions/account'
import { money } from '@/components/account/ui'
import { useCart } from '@/components/cart/CartProvider'
import type { DbMenuItem } from '@/lib/menu-data'

export default function FavoritesGrid({ items }: { items: DbMenuItem[] }) {
  const router = useRouter()
  const { add, open } = useCart()
  const [pending, startTransition] = useTransition()
  const [removing, setRemoving] = useState<string | null>(null)

  function handleRemove(id: string) {
    setRemoving(id)
    startTransition(async () => {
      await toggleFavoriteAction(id)
      setRemoving(null)
      router.refresh()
    })
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="glass-card flex flex-col overflow-hidden rounded-xl">
          {item.imageUrl ? (
            <div className="relative aspect-4/3">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
              {!item.isAvailable ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <span className="text-xs uppercase tracking-[0.2em] text-beige">
                    Currently unavailable
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-serif text-base text-beige">{item.name}</h3>
            {item.description ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : null}

            <p className="mt-3 text-sm text-gold">{money(item.price)}</p>

            <div className="mt-auto flex items-center gap-3 pt-5">
              <button
                type="button"
                disabled={!item.isAvailable}
                onClick={() => {
                  add({
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                  })
                  open()
                }}
                className="btn-gold text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                {item.isAvailable ? 'Add to order' : 'Unavailable'}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                disabled={pending && removing === item.id}
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-red-300 disabled:opacity-50"
              >
                {pending && removing === item.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
