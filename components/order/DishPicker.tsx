'use client'

import { useMemo, useState } from 'react'
import { Heart, Minus, Plus, Search } from 'lucide-react'

import { useCart } from '@/components/cart/CartProvider'
import { toggleFavoriteAction } from '@/app/actions/account'
import { cn } from '@/lib/utils'

export type PickerCategory = {
  id: string
  slug: string
  label: string
  items: Array<{
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    tag: string | null
    isAvailable: boolean
  }>
}

export default function DishPicker({
  categories,
  initialFavorites,
  signedIn,
}: {
  categories: PickerCategory[]
  initialFavorites: string[]
  signedIn: boolean
}) {
  const { items, add, setQuantity } = useCart()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(initialFavorites))

  const quantityOf = (id: string) => items.find((line) => line.menuItemId === id)?.quantity ?? 0

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return categories
      .filter((category) => activeCategory === 'all' || category.slug === activeCategory)
      .map((category) => ({
        ...category,
        items: term
          ? category.items.filter((item) => item.name.toLowerCase().includes(term))
          : category.items,
      }))
      .filter((category) => category.items.length > 0)
  }, [categories, activeCategory, search])

  async function handleFavorite(menuItemId: string) {
    if (!signedIn) return
    // Optimistic toggle — the server action is the source of truth.
    setFavorites((previous) => {
      const next = new Set(previous)
      if (next.has(menuItemId)) next.delete(menuItemId)
      else next.add(menuItemId)
      return next
    })
    const result = await toggleFavoriteAction(menuItemId)
    if (!result.ok) {
      setFavorites((previous) => {
        const next = new Set(previous)
        if (next.has(menuItemId)) next.delete(menuItemId)
        else next.add(menuItemId)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search + category filter */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the menu"
            aria-label="Search the menu"
            className="w-full rounded-full border border-[#c9a84c]/20 bg-[#0d0d0d] py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#c9a84c]/60"
          />
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ slug: 'all', label: 'All' }, ...categories].map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.slug)}
              aria-pressed={activeCategory === category.slug}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-all',
                activeCategory === category.slug
                  ? 'border-[#c9a84c] bg-[#c9a84c] text-[#080808]'
                  : 'border-[#c9a84c]/20 text-muted-foreground hover:border-[#c9a84c]/50 hover:text-[#c9a84c]',
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No dishes match &ldquo;{search}&rdquo;.
        </p>
      ) : null}

      {/* Dish list */}
      <div className="flex flex-col gap-10">
        {visible.map((category) => (
          <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
            <div className="mb-4 flex items-center gap-4">
              <h2
                id={`cat-${category.slug}`}
                className="font-serif text-xl text-foreground sm:text-2xl"
              >
                {category.label}
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-[#c9a84c]/30 to-transparent" />
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {category.items.map((item) => {
                const quantity = quantityOf(item.id)
                const isFavorite = favorites.has(item.id)

                return (
                  <li
                    key={item.id}
                    className={cn(
                      'glass-card flex items-center gap-4 rounded-xl p-3 transition-colors',
                      item.isAvailable ? 'hover:border-[#c9a84c]/30' : 'opacity-60',
                    )}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl || '/placeholder.svg'}
                        alt=""
                        loading="lazy"
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          {item.name}
                        </h3>
                        {signedIn ? (
                          <button
                            type="button"
                            onClick={() => handleFavorite(item.id)}
                            aria-label={isFavorite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
                            aria-pressed={isFavorite}
                            className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-[#c9a84c]"
                          >
                            <Heart
                              size={15}
                              className={isFavorite ? 'fill-[#c9a84c] text-[#c9a84c]' : ''}
                            />
                          </button>
                        ) : null}
                      </div>

                      {item.tag ? (
                        <span className="mt-0.5 inline-block text-[10px] uppercase tracking-[0.15em] text-[#c9a84c]">
                          {item.tag}
                        </span>
                      ) : null}

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="font-serif text-base text-[#c9a84c]">Rs. {item.price}</span>

                        {!item.isAvailable ? (
                          <span className="rounded-full border border-destructive/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-destructive">
                            Unavailable
                          </span>
                        ) : quantity > 0 ? (
                          <div className="flex items-center gap-1 rounded-full border border-[#c9a84c]/30 p-0.5">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, quantity - 1)}
                              aria-label={`Remove one ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/15"
                            >
                              <Minus size={13} />
                            </button>
                            <span
                              aria-live="polite"
                              className="w-6 text-center text-sm font-semibold text-foreground"
                            >
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, quantity + 1)}
                              aria-label={`Add one more ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/15"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              add({
                                menuItemId: item.id,
                                name: item.name,
                                price: item.price,
                                imageUrl: item.imageUrl,
                              })
                            }
                            className="btn-outline-gold rounded-full px-4 py-1.5 text-[11px]"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
