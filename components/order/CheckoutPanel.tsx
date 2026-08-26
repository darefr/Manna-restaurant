'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { CheckCircle2, Loader2, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react'

import { placeOrderAction, quoteOrderAction, type QuoteResult } from '@/app/actions/order'
import { useCart } from '@/components/cart/CartProvider'
import { Alert } from '@/components/auth/AuthBits'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import type { OrderType } from '@/lib/order-constants'
import { buildWhatsAppUrl } from '@/lib/whatsapp-order'
import { cn } from '@/lib/utils'

export type SavedAddress = {
  id: string
  label: string
  line1: string
  line2: string | null
  city: string | null
  isDefault: boolean
}

type Props = {
  signedIn: boolean
  customer: { name: string; email: string; phone: string | null } | null
  addresses: SavedAddress[]
  pointsBalance: number
}

type Placed = {
  reference: string
  total: number
  whatsappUrl: string
}

const EMPTY_QUOTE: QuoteResult = {
  ok: false,
  lines: [],
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  pointsEarned: 0,
  pointsRedeemed: 0,
  couponCode: null,
  pointsBalance: 0,
  pointValue: 1,
}

export default function CheckoutPanel({ signedIn, customer, addresses, pointsBalance }: Props) {
  const { items, setQuantity, remove, clear, displaySubtotal, ready } = useCart()

  const [orderType, setOrderType] = useState<OrderType>('PICKUP')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [redeemPoints, setRedeemPoints] = useState(0)
  const [addressId, setAddressId] = useState(
    () => addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? '',
  )

  const [quote, setQuote] = useState<QuoteResult>(EMPTY_QUOTE)
  const [quoting, setQuoting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [placed, setPlaced] = useState<Placed | null>(null)
  const [pending, startTransition] = useTransition()

  const cartLines = items.map((line) => ({ menuItemId: line.menuItemId, quantity: line.quantity }))
  const cartKey = JSON.stringify(cartLines)

  // Ask the server for an authoritative quote whenever the order changes.
  useEffect(() => {
    if (!ready || items.length === 0 || placed) {
      setQuote(EMPTY_QUOTE)
      return
    }

    let cancelled = false
    setQuoting(true)

    quoteOrderAction({
      lines: JSON.parse(cartKey),
      orderType,
      couponCode: appliedCoupon || null,
      redeemPoints,
    })
      .then((result) => {
        if (cancelled) return
        setQuote(result)
        // A coupon that stops qualifying is dropped rather than silently kept.
        if (appliedCoupon && result.ok && !result.couponCode) setAppliedCoupon('')
      })
      .catch(() => {
        if (!cancelled) setQuote({ ...EMPTY_QUOTE, error: 'Could not price your order.' })
      })
      .finally(() => {
        if (!cancelled) setQuoting(false)
      })

    return () => {
      cancelled = true
    }
  }, [cartKey, orderType, appliedCoupon, redeemPoints, ready, items.length, placed])

  // ---- success state ----
  if (placed) {
    return (
      <div className="glass-card flex flex-col items-center gap-5 rounded-2xl p-8 text-center">
        <CheckCircle2 size={44} className="text-[#c9a84c]" aria-hidden="true" />
        <div>
          <h2 className="font-serif text-2xl text-foreground">Order received</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your reference is{' '}
            <span className="font-semibold text-[#c9a84c]">{placed.reference}</span>. We will confirm
            it shortly.
          </p>
          <p className="mt-1 font-serif text-2xl text-[#c9a84c]">Rs. {placed.total}</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <a
            href={placed.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold flex flex-1 items-center justify-center rounded-full px-6 py-3 text-xs font-semibold tracking-[0.15em]"
          >
            Send on WhatsApp
          </a>
          {signedIn ? (
            <Link
              href="/account/orders"
              className="btn-outline-gold flex flex-1 items-center justify-center rounded-full px-6 py-3 text-xs font-semibold tracking-[0.15em]"
            >
              Track Order
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setPlaced(null)}
          className="text-xs tracking-wide text-muted-foreground transition-colors hover:text-[#c9a84c]"
        >
          Place another order
        </button>
      </div>
    )
  }

  // ---- empty state ----
  if (ready && items.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
        <h2 className="font-serif text-xl text-foreground">Your order is empty</h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Add dishes from the menu and your order summary will appear here.
        </p>
      </div>
    )
  }

  const maxRedeemable = Math.min(
    quote.pointsBalance || pointsBalance,
    Math.floor(Math.max(0, quote.subtotal) / Math.max(1, quote.pointValue)),
  )

  function handleSubmit(formData: FormData) {
    setSubmitError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = await placeOrderAction({
        lines: cartLines,
        orderType,
        customerName: String(formData.get('customerName') ?? ''),
        customerPhone: String(formData.get('customerPhone') ?? ''),
        customerEmail: String(formData.get('customerEmail') ?? ''),
        addressId: orderType === 'DELIVERY' && addressId ? addressId : null,
        address: String(formData.get('address') ?? ''),
        specialRequests: String(formData.get('specialRequests') ?? ''),
        couponCode: appliedCoupon || null,
        redeemPoints,
      })

      if (!result.ok) {
        setSubmitError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }

      const selected = addresses.find((address) => address.id === addressId)
      const addressText =
        orderType === 'DELIVERY'
          ? selected
            ? [selected.line1, selected.line2, selected.city].filter(Boolean).join(', ')
            : String(formData.get('address') ?? '')
          : undefined

      setPlaced({
        reference: result.reference,
        total: result.total,
        whatsappUrl: buildWhatsAppUrl({
          customerName: String(formData.get('customerName') ?? ''),
          phone: String(formData.get('customerPhone') ?? ''),
          lines: result.lines,
          orderType: orderType === 'DELIVERY' ? 'Delivery' : 'Pickup',
          address: addressText,
          note: String(formData.get('specialRequests') ?? ''),
          reference: result.reference,
          total: result.total,
          discount: result.discount,
          whatsappNumber: result.whatsappNumber,
        }),
      })

      clear()
    })
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      {/* Cart lines */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Your order
        </h2>

        <ul className="flex flex-col divide-y divide-[#c9a84c]/10">
          {items.map((line) => (
            <li key={line.menuItemId} className="flex items-center gap-3 py-3 first:pt-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{line.name}</p>
                <p className="text-xs text-muted-foreground">Rs. {line.price} each</p>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-[#c9a84c]/25 p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                  aria-label={`Remove one ${line.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/15"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm text-foreground">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                  aria-label={`Add one more ${line.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/15"
                >
                  <Plus size={12} />
                </button>
              </div>

              <span className="w-20 shrink-0 text-right text-sm text-foreground">
                Rs. {line.price * line.quantity}
              </span>

              <button
                type="button"
                onClick={() => remove(line.menuItemId)}
                aria-label={`Remove ${line.name}`}
                className="p-1 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Order type */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          How would you like it?
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: 'PICKUP', label: 'Pickup' },
              { value: 'DELIVERY', label: 'Delivery' },
              { value: 'DINE_IN', label: 'Dine in' },
            ] as Array<{ value: OrderType; label: string }>
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setOrderType(option.value)}
              aria-pressed={orderType === option.value}
              className={cn(
                'rounded-lg border py-2.5 text-[11px] uppercase tracking-[0.12em] transition-all',
                orderType === option.value
                  ? 'border-[#c9a84c] bg-[#c9a84c] text-[#080808]'
                  : 'border-[#c9a84c]/20 text-muted-foreground hover:border-[#c9a84c]/50',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact + address */}
      <div className="glass-card flex flex-col gap-4 rounded-2xl p-5">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Your details
        </h2>

        <Field label="Name" error={fieldErrors.customerName}>
          <Input name="customerName" required defaultValue={customer?.name ?? ''} placeholder="Your name" />
        </Field>

        <Field label="Phone" error={fieldErrors.customerPhone}>
          <Input
            name="customerPhone"
            type="tel"
            required
            defaultValue={customer?.phone ?? ''}
            placeholder="98XXXXXXXX"
          />
        </Field>

        <Field label="Email" hint="For your receipt">
          <Input
            name="customerEmail"
            type="email"
            defaultValue={customer?.email ?? ''}
            placeholder="you@example.com"
          />
        </Field>

        {orderType === 'DELIVERY' ? (
          <>
            {addresses.length > 0 ? (
              <Field label="Saved address">
                <Select value={addressId} onChange={(event) => setAddressId(event.target.value)}>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} — {address.line1}
                      {address.isDefault ? ' (default)' : ''}
                    </option>
                  ))}
                  <option value="">Use a different address</option>
                </Select>
              </Field>
            ) : null}

            {(!addressId || addresses.length === 0) ? (
              <Field label="Delivery address" error={fieldErrors.address}>
                <Textarea
                  name="address"
                  placeholder="House / tole, street, landmark, Devchuli"
                  required
                />
              </Field>
            ) : null}
          </>
        ) : null}

        <Field label="Special requests" hint="Optional">
          <Textarea name="specialRequests" placeholder="Less spicy, no onion, call on arrival…" />
        </Field>
      </div>

      {/* Coupon + points */}
      <div className="glass-card flex flex-col gap-4 rounded-2xl p-5">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Discounts
        </h2>

        <div className="flex gap-2">
          <Input
            value={couponInput}
            onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
            placeholder="Coupon code"
            aria-label="Coupon code"
            className="flex-1"
          />
          {appliedCoupon ? (
            <button
              type="button"
              onClick={() => {
                setAppliedCoupon('')
                setCouponInput('')
              }}
              className="btn-outline-gold shrink-0 rounded-lg px-5 text-[11px]"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAppliedCoupon(couponInput.trim())}
              disabled={!couponInput.trim()}
              className="btn-outline-gold shrink-0 rounded-lg px-5 text-[11px] disabled:opacity-40"
            >
              Apply
            </button>
          )}
        </div>

        {quote.couponCode ? (
          <p className="text-xs text-[#c9a84c]">Coupon {quote.couponCode} applied.</p>
        ) : null}

        {signedIn && maxRedeemable > 0 ? (
          <div className="flex flex-col gap-2 border-t border-[#c9a84c]/10 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Use loyalty points
              </span>
              <span className="text-xs text-[#c9a84c]">
                {quote.pointsBalance || pointsBalance} available
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxRedeemable}
              step={10}
              value={Math.min(redeemPoints, maxRedeemable)}
              onChange={(event) => setRedeemPoints(Number(event.target.value))}
              aria-label="Loyalty points to redeem"
              className="w-full accent-[#c9a84c]"
            />
            <p className="text-xs text-muted-foreground">
              Redeeming {quote.pointsRedeemed} points — saves Rs.{' '}
              {quote.pointsRedeemed * quote.pointValue}
            </p>
          </div>
        ) : null}
      </div>

      {/* Totals */}
      <div className="glass-card flex flex-col gap-3 rounded-2xl p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">Rs. {quote.subtotal || displaySubtotal}</span>
        </div>

        {quote.discount > 0 ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-[#c9a84c]">− Rs. {quote.discount}</span>
          </div>
        ) : null}

        {quote.deliveryFee > 0 ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="text-foreground">Rs. {quote.deliveryFee}</span>
          </div>
        ) : null}

        {quote.tax > 0 ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-foreground">Rs. {quote.tax}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-[#c9a84c]/15 pt-3">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="flex items-center gap-2 font-serif text-2xl text-[#c9a84c]">
            {quoting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            Rs. {quote.total}
          </span>
        </div>

        {quote.pointsEarned > 0 ? (
          <p className="text-xs text-muted-foreground">
            You&apos;ll earn {quote.pointsEarned} points when this order completes.
          </p>
        ) : null}

        <p className="flex items-center gap-2 text-[11px] leading-relaxed text-muted-foreground/80">
          <ShieldCheck size={13} className="shrink-0 text-[#c9a84c]" aria-hidden="true" />
          Prices are confirmed by our kitchen when your order is saved.
        </p>
      </div>

      {quote.error ? <Alert tone="error">{quote.error}</Alert> : null}
      {submitError ? <Alert tone="error">{submitError}</Alert> : null}

      <button
        type="submit"
        disabled={pending || quoting || !quote.ok}
        className="btn-gold flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-semibold tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            Placing order
          </>
        ) : (
          `Place Order · Rs. ${quote.total}`
        )}
      </button>

      {!signedIn ? (
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          <Link href="/signin?next=/order" className="text-[#c9a84c] hover:underline">
            Sign in
          </Link>{' '}
          to earn loyalty points and track this order.
        </p>
      ) : null}
    </form>
  )
}
