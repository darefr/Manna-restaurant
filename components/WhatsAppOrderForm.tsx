'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import {
  User,
  Phone,
  MessageSquare,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Bike,
  Package,
  MapPin,
  ShoppingBag,
} from 'lucide-react'
import {
  menu as staticMenu,
  formatPrice,
  restaurant,
  type MenuCategory,
} from '@/lib/restaurant'
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  orderTotal,
  ORDER_WHATSAPP_NUMBER,
  type OrderLine,
  type OrderType,
} from '@/lib/whatsapp-order'

type Row = { id: number; dishKey: string; quantity: number }

type Errors = {
  name?: string
  phone?: string
  items?: string
  address?: string
}

const inputClass =
  'w-full glass-card rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground gold-border focus:outline-none focus:border-[#c9a84c]/60 focus:ring-0 transition-colors bg-transparent'
const labelClass =
  'block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-medium'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
  )
}

let nextRowId = 1

export default function WhatsAppOrderForm({
  menu = staticMenu,
}: {
  /** Live menu from the database; falls back to the printed-board data. */
  menu?: MenuCategory[]
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-5%' })

  /** Every dish on the menu, flattened for the dish picker. */
  const dishByKey = useMemo(
    () =>
      new Map(
        menu.flatMap((category) =>
          category.items.map((item) => [
            `${category.id}::${item.name}`,
            { name: item.name, price: item.price, category: category.label },
          ]),
        ),
      ),
    [menu],
  )

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [orderType, setOrderType] = useState<OrderType>('Pickup')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [rows, setRows] = useState<Row[]>([{ id: 0, dishKey: '', quantity: 1 }])
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  /** Only rows with a chosen dish count toward the order. */
  const lines: OrderLine[] = useMemo(
    () =>
      rows
        .map((row) => {
          const dish = dishByKey.get(row.dishKey)
          if (!dish) return null
          return { name: dish.name, quantity: row.quantity, price: dish.price }
        })
        .filter((l): l is OrderLine => l !== null && l.quantity > 0),
    [rows, dishByKey],
  )

  const total = orderTotal(lines)

  const addRow = () => setRows((r) => [...r, { id: nextRowId++, dishKey: '', quantity: 1 }])

  const removeRow = (id: number) =>
    setRows((r) => (r.length === 1 ? r : r.filter((row) => row.id !== id)))

  const updateRow = (id: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const validate = (): Errors => {
    const next: Errors = {}

    if (customerName.trim().length < 2) {
      next.name = 'Please enter your name.'
    }

    // Accepts Nepali mobile/landline formats, with or without +977.
    const digits = phone.replace(/[^\d]/g, '')
    if (digits.length < 7) {
      next.phone = 'Please enter a valid phone number.'
    }

    if (lines.length === 0) {
      next.items = 'Please choose at least one dish and a quantity.'
    }

    if (orderType === 'Delivery' && address.trim().length < 5) {
      next.address = 'Please enter the delivery address.'
    }

    return next
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the problem so the error is not missed on mobile.
      document.getElementById('order-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)

    const order = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      lines,
      orderType,
      address: orderType === 'Delivery' ? address : undefined,
      note,
    }

    const url = buildWhatsAppUrl(order)

    // Opening WhatsApp is the actual submission — nothing is "confirmed" here.
    // A short delay lets the submitting state paint before the app switches.
    window.setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer')
      setSubmitting(false)
    }, 400)
  }

  const hasErrors = Object.keys(errors).length > 0
  const preview = lines.length > 0 ? buildOrderMessage({
    customerName: customerName.trim() || 'Your name',
    phone: phone.trim() || 'Your phone',
    lines,
    orderType,
    address: orderType === 'Delivery' ? address : undefined,
    note,
  }) : null

  return (
    <section id="order" className="py-32 md:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-charcoal/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c9a84c] opacity-[0.03] blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 md:mb-20"
        >
          <span className="text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-[#c9a84c] font-medium">
            Order Direct
          </span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mt-4 mb-6 text-balance">
            Build Your Order
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-muted-foreground mt-8 max-w-2xl mx-auto leading-relaxed text-pretty">
            Choose your dishes and quantities below. When you send the order it opens WhatsApp with
            everything filled in, and we reply to confirm your order and the timing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="grid lg:grid-cols-5 gap-8"
        >
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-3 glass-card gold-border rounded-2xl p-6 sm:p-8 md:p-10"
          >
            {/* Error summary */}
            <div id="order-errors">
              <AnimatePresence>
                {hasErrors && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5"
                  >
                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200 leading-relaxed">
                      Please check the highlighted fields before sending your order.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Your details */}
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#c9a84c] font-semibold mb-6">
              Your Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div>
                <label htmlFor="customerName" className={labelClass}>
                  <User size={10} className="inline mr-1.5" />
                  Your Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  className={inputClass}
                />
                <FieldError message={errors.name} />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  <Phone size={10} className="inline mr-1.5" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  className={inputClass}
                />
                <FieldError message={errors.phone} />
              </div>
            </div>

            {/* Dishes */}
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#c9a84c] font-semibold mb-6">
              Your Dishes
            </h3>

            <div className="flex flex-col gap-4 mb-4">
              {rows.map((row) => {
                const dish = dishByKey.get(row.dishKey)
                return (
                  <div
                    key={row.id}
                    className="glass-card rounded-xl gold-border p-4 flex flex-col sm:flex-row sm:items-end gap-3"
                  >
                    {/* Dish */}
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`dish-${row.id}`} className={labelClass}>
                        Dish
                      </label>
                      <select
                        id={`dish-${row.id}`}
                        value={row.dishKey}
                        onChange={(e) => updateRow(row.id, { dishKey: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select a dish</option>
                        {menu.map((category) => (
                          <optgroup key={category.id} label={category.label}>
                            {category.items.map((item) => (
                              <option key={item.name} value={`${category.id}::${item.name}`}>
                                {item.name} — {formatPrice(item.price)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:w-28 shrink-0">
                      <label htmlFor={`qty-${row.id}`} className={labelClass}>
                        Qty
                      </label>
                      <input
                        type="number"
                        id={`qty-${row.id}`}
                        min={1}
                        max={50}
                        step={1}
                        value={row.quantity}
                        onChange={(e) => {
                          const parsed = Number.parseInt(e.target.value, 10)
                          updateRow(row.id, {
                            quantity: Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), 50),
                          })
                        }}
                        inputMode="numeric"
                        className={inputClass}
                      />
                    </div>

                    {/* Line total + remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:pb-3.5">
                      <span className="font-serif text-base font-bold text-[#c9a84c] whitespace-nowrap min-w-[80px] sm:text-right">
                        {dish ? formatPrice(dish.price * row.quantity) : '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        aria-label="Remove this dish"
                        className="w-9 h-9 rounded-full border border-[#c9a84c]/25 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <FieldError message={errors.items} />

            <button
              type="button"
              onClick={addRow}
              className="mt-4 mb-10 btn-outline-gold px-6 py-3 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase inline-flex items-center gap-2"
            >
              <Plus size={14} />
              Add Another Dish
            </button>

            {/* Order type */}
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#c9a84c] font-semibold mb-6">
              Pickup or Delivery
            </h3>
            <div
              role="radiogroup"
              aria-label="Order type"
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {(
                [
                  { value: 'Pickup', icon: Package, desc: 'Collect from the restaurant' },
                  { value: 'Delivery', icon: Bike, desc: 'Delivered around Devchuli' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={orderType === opt.value}
                  onClick={() => setOrderType(opt.value)}
                  className={`rounded-xl p-5 text-left transition-all duration-300 border ${
                    orderType === opt.value
                      ? 'bg-[#c9a84c]/12 border-[#c9a84c]/60'
                      : 'glass-card border-[#c9a84c]/15 hover:border-[#c9a84c]/35'
                  }`}
                >
                  <opt.icon
                    size={18}
                    className={orderType === opt.value ? 'text-[#c9a84c]' : 'text-muted-foreground'}
                  />
                  <div
                    className={`text-sm font-semibold mt-3 ${
                      orderType === opt.value ? 'text-[#c9a84c]' : 'text-foreground'
                    }`}
                  >
                    {opt.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Delivery address, only when relevant */}
            <AnimatePresence>
              {orderType === 'Delivery' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">
                    <label htmlFor="address" className={labelClass}>
                      <MapPin size={10} className="inline mr-1.5" />
                      Delivery Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ward, tole and a landmark near you"
                      aria-invalid={Boolean(errors.address)}
                      className={`${inputClass} resize-none`}
                    />
                    <FieldError message={errors.address} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Special request */}
            <div className="mb-10">
              <label htmlFor="note" className={labelClass}>
                <MessageSquare size={10} className="inline mr-1.5" />
                Special Request (Optional)
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Less spicy, veg only, packing preference..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Submit */}
            {/* Extra right padding on tablet keeps the submit button clear of the
                floating call/WhatsApp buttons pinned to that corner. */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/50 sm:pr-28 lg:pr-0">
              <p className="text-xs text-muted-foreground max-w-xs text-center sm:text-left leading-relaxed">
                This opens WhatsApp with your order written out. Your order is confirmed once we
                reply to you.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold px-10 py-4 rounded-full text-sm font-semibold tracking-[0.2em] uppercase shrink-0 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Opening WhatsApp
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Send Order
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live summary */}
          <div className="lg:col-span-2">
            <div className="glass-card gold-border rounded-2xl p-6 sm:p-8 lg:sticky lg:top-28">
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#c9a84c] font-semibold mb-6">
                Order Summary
              </h3>

              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No dishes selected yet. Choose a dish and quantity to build your order.
                </p>
              ) : (
                <div className="flex flex-col gap-3 mb-6">
                  {lines.map((line, i) => (
                    <div
                      key={`${line.name}-${i}`}
                      className="flex items-start justify-between gap-3 pb-3 border-b border-border/50 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-foreground leading-snug">{line.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {formatPrice(line.price)} × {line.quantity}
                        </div>
                      </div>
                      <div className="font-serif text-sm font-bold text-[#c9a84c] whitespace-nowrap">
                        {formatPrice(line.price * line.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-5 border-t border-[#c9a84c]/25">
                <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  Total
                </span>
                <span className="font-serif text-2xl font-bold text-gradient-gold">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 flex flex-col gap-2">
                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  Order Type
                </div>
                <div className="text-sm text-foreground">{orderType}</div>
              </div>

              {/* Message preview */}
              {preview && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
                    WhatsApp Message
                  </div>
                  <pre className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
                    {preview}
                  </pre>
                </div>
              )}

              <p className="mt-6 pt-6 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed">
                Sent to +{ORDER_WHATSAPP_NUMBER}. Prefer to talk? Call{' '}
                <a
                  href={`tel:${restaurant.phones.reception.number}`}
                  className="text-[#c9a84c] hover:underline"
                >
                  {restaurant.phones.reception.display}
                </a>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
