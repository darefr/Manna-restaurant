'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type CartItem = {
  menuItemId: string
  name: string
  /** Display price only. The server always recalculates the real total. */
  price: number
  quantity: number
  imageUrl?: string | null
}

type CartContextValue = {
  items: CartItem[]
  count: number
  /** Indicative subtotal for the badge. Never used to charge the customer. */
  displaySubtotal: number
  isOpen: boolean
  ready: boolean
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setQuantity: (menuItemId: string, quantity: number) => void
  remove: (menuItemId: string) => void
  clear: () => void
  replace: (items: CartItem[]) => void
  open: () => void
  close: () => void
  toggle: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/**
 * Cart state lives in the browser only as a convenience while the guest is
 * choosing dishes — it is a shopping basket, not a source of truth. Prices,
 * discounts and totals are always recalculated on the server at checkout.
 */
const STORAGE_KEY = 'manna_cart_v1'
const MAX_PER_ITEM = 20

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [ready, setReady] = useState(false)

  // Restore the basket after mount so SSR and the client agree on first paint.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .filter((item) => item && typeof item.menuItemId === 'string')
              .map((item) => ({
                menuItemId: String(item.menuItemId),
                name: String(item.name ?? ''),
                price: Number(item.price) || 0,
                quantity: Math.min(MAX_PER_ITEM, Math.max(1, Number(item.quantity) || 1)),
                imageUrl: item.imageUrl ?? null,
              })),
          )
        }
      }
    } catch {
      // Corrupt or unavailable storage is not fatal — start with an empty cart.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota errors.
    }
  }, [items, ready])

  const add = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((previous) => {
      const existing = previous.find((line) => line.menuItemId === item.menuItemId)
      if (existing) {
        return previous.map((line) =>
          line.menuItemId === item.menuItemId
            ? { ...line, quantity: Math.min(MAX_PER_ITEM, line.quantity + quantity) }
            : line,
        )
      }
      return [...previous, { ...item, quantity: Math.min(MAX_PER_ITEM, Math.max(1, quantity)) }]
    })
  }, [])

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setItems((previous) => {
      if (quantity <= 0) return previous.filter((line) => line.menuItemId !== menuItemId)
      return previous.map((line) =>
        line.menuItemId === menuItemId
          ? { ...line, quantity: Math.min(MAX_PER_ITEM, quantity) }
          : line,
      )
    })
  }, [])

  const remove = useCallback((menuItemId: string) => {
    setItems((previous) => previous.filter((line) => line.menuItemId !== menuItemId))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const replace = useCallback((next: CartItem[]) => setItems(next), [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((value) => !value), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, line) => sum + line.quantity, 0),
      displaySubtotal: items.reduce((sum, line) => sum + line.price * line.quantity, 0),
      isOpen,
      ready,
      add,
      setQuantity,
      remove,
      clear,
      replace,
      open,
      close,
      toggle,
    }),
    [items, isOpen, ready, add, setQuantity, remove, clear, replace, open, close, toggle],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
