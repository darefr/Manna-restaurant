import Link from 'next/link'
import type { ReactNode } from 'react'

import { ORDER_STATUSES, type OrderStatus } from '@/lib/order-constants'

/** Section heading used at the top of every account page. */
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-2xl text-beige">{title}</h2>
        {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Panel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`glass-card rounded-xl p-6 ${className}`}>{children}</div>
}

/** Consistent empty state so no screen ever renders a blank area. */
export function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string
  message: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="glass-card flex flex-col items-center rounded-xl px-6 py-14 text-center">
      <h3 className="font-serif text-lg text-beige">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{message}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-gold mt-6 text-xs">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl text-gold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
  CONFIRMED: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
  PREPARING: 'bg-orange-500/12 text-orange-300 border-orange-500/25',
  READY: 'bg-violet-500/12 text-violet-300 border-violet-500/25',
  OUT_FOR_DELIVERY: 'bg-blue-500/12 text-blue-300 border-blue-500/25',
  DELIVERED: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  COMPLETED: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  CANCELLED: 'bg-red-500/12 text-red-300 border-red-500/25',
  PAID: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  UNPAID: 'bg-white/5 text-muted-foreground border-white/10',
  REFUNDED: 'bg-violet-500/12 text-violet-300 border-violet-500/25',
  FAILED: 'bg-red-500/12 text-red-300 border-red-500/25',
  pending: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
  confirmed: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  seated: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
  completed: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  cancelled: 'bg-red-500/12 text-red-300 border-red-500/25',
  APPROVED: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  HIDDEN: 'bg-white/5 text-muted-foreground border-white/10',
  ISSUED: 'bg-gold/12 text-gold border-gold/25',
  USED: 'bg-white/5 text-muted-foreground border-white/10',
}

export function StatusBadge({ status, label, tone: toneOverride }: { status?: string; label?: string; tone?: 'green' | 'yellow' | 'red' }) {
  const tone = toneOverride === 'green'
    ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25'
    : toneOverride === 'yellow'
      ? 'bg-amber-500/12 text-amber-300 border-amber-500/25'
      : toneOverride === 'red'
        ? 'bg-red-500/12 text-red-300 border-red-500/25'
        : STATUS_TONE[status ?? ''] ?? 'bg-white/5 text-muted-foreground border-white/10'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${tone}`}
    >
      {label ?? (status ?? 'unknown').replace(/_/g, ' ').toLowerCase()}
    </span>
  )
}

export function money(value: number) {
  return `Rs. ${Math.round(value).toLocaleString('en-IN')}`
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}
