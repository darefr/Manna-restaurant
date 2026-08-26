'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import type { NavItem } from '@/lib/admin-nav'

import AdminSidebar from './AdminSidebar'

/**
 * Client shell that owns the mobile drawer state. The navigation itself is
 * filtered on the server so a role never even receives links it cannot use.
 */
export default function AdminChrome({
  groups,
  user,
  roleLabel,
  signOut,
  children,
}: {
  groups: { group: string; items: NavItem[] }[]
  user: { name: string; email: string }
  roleLabel: string
  signOut: () => Promise<void>
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar groups={groups} open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-4 py-3.5 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-beige lg:hidden"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold"
            >
              View site
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm text-beige">{user.name}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold/80">{roleLabel}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3.5 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-gold/40 hover:text-beige"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
