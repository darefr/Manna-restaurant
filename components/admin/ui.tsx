import type { ReactNode } from 'react'

export { money, formatDate, formatDateTime, StatusBadge } from '@/components/account/ui'

export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <header className="mb-8">
      {eyebrow ? <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-gold">{eyebrow}</p> : null}
      <h1 className="font-serif text-2xl text-beige sm:text-3xl">{title}</h1>
      {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
    </header>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl text-beige sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function Card({
  children,
  title,
  action,
  className = '',
}: {
  children: ReactNode
  /** Optional heading rendered above the card body. */
  title?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border bg-card/60 p-5 ${className}`}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'warn' | 'good' | 'bad'
}) {
  const toneClass = {
    default: 'text-gold',
    warn: 'text-amber-300',
    good: 'text-emerald-300',
    bad: 'text-red-300',
  }[tone]

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-serif text-2xl ${toneClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/** Horizontal-scroll wrapper so wide tables never break the mobile layout. */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
      <div className="min-w-full">{children}</div>
    </div>
  )
}

export function Th({
  children,
  align = 'left',
  className = '',
}: {
  children: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  const alignment =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-4 py-3 ${alignment} text-[10px] font-normal uppercase tracking-[0.18em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  align = 'left',
  className = '',
}: {
  children: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  const alignment =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <td className={`px-4 py-3.5 align-top ${alignment} text-sm text-beige ${className}`}>
      {children}
    </td>
  )
}

export function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-6 py-14 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/** Simple bar chart. Avoids a chart dependency for these small visualisations. */
export function BarChart({
  data,
  valueFormatter,
  label,
}: {
  data: { label: string; value: number }[]
  valueFormatter?: (value: number) => string
  label: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <ul aria-label={label} className="flex flex-col gap-2.5">
      {data.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-muted-foreground" title={item.label}>
            {item.label}
          </span>
          <span className="h-6 flex-1 overflow-hidden rounded bg-white/5">
            <span
              className="block h-full rounded bg-linear-to-r from-gold-dark to-gold"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </span>
          <span className="w-20 shrink-0 text-right text-xs text-beige">
            {valueFormatter ? valueFormatter(item.value) : item.value}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Sparkline-style column chart for daily series. */
export function ColumnChart({
  data,
  label,
  valueFormatter,
}: {
  data: { day: string; value: number }[]
  label: string
  valueFormatter?: (value: number) => string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div aria-label={label} role="img" className="flex h-40 items-end gap-1">
      {data.map((item) => (
        <div key={item.day} className="group relative flex h-full flex-1 items-end">
          <div
            className="w-full rounded-t bg-gold/35 transition-colors group-hover:bg-gold"
            style={{ height: `${Math.max(2, (item.value / max) * 100)}%` }}
          />
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded border border-border bg-background px-2 py-1 text-[10px] text-beige group-hover:block">
            {item.day}: {valueFormatter ? valueFormatter(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
