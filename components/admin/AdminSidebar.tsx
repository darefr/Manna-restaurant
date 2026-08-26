'use client'

import {
  BarChart3,
  CalendarDays,
  ChefHat,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Receipt,
  Settings,
  Star,
  Tags,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { NavItem } from '@/lib/admin-nav'

const ICONS = {
  dashboard: LayoutDashboard,
  orders: Receipt,
  menu: UtensilsCrossed,
  categories: ChefHat,
  reservations: CalendarDays,
  tables: LayoutDashboard,
  customers: Users,
  reviews: Star,
  analytics: BarChart3,
  reports: FileText,
  coupons: Tags,
  marketing: Megaphone,
  staff: Users,
  cms: MessageSquare,
  gallery: ImageIcon,
  settings: Settings,
} as const

export default function AdminSidebar({
  groups,
  open,
  onClose,
}: {
  groups: { group: string; items: NavItem[] }[]
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Lock scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mounted) return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, mounted])

  const content = (
    <nav aria-label="Admin sections" className="flex h-full flex-col gap-7 overflow-y-auto p-5">
      <Link href="/" className="flex flex-col">
        <span className="font-serif text-lg font-bold tracking-[0.18em] text-gradient-gold">
          MANNA
        </span>
        <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
          Management
        </span>
      </Link>

      {groups.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
            {group.group}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon]
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      active
                        ? 'bg-gold/12 text-gold'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-beige',
                    ].join(' ')}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-black/40 lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative h-full w-72 max-w-[85vw] border-r border-border bg-background">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 p-2 text-muted-foreground hover:text-beige"
            >
              <X size={20} />
            </button>
            {content}
          </div>
        </div>
      ) : null}
    </>
  )
}
