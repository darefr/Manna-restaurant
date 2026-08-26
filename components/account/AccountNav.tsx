'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/reservations', label: 'Reservations' },
  { href: '/account/favorites', label: 'Favourites' },
  { href: '/account/loyalty', label: 'Loyalty' },
  { href: '/account/offers', label: 'Offers' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/reviews', label: 'Reviews' },
  { href: '/account/referrals', label: 'Referrals' },
  { href: '/account/settings', label: 'Settings' },
]

export default function AccountNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Account sections" className="lg:sticky lg:top-28">
      {/* Horizontal rail on small screens, vertical list from large up. */}
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {LINKS.map((link) => {
          const active =
            link.href === '/account' ? pathname === '/account' : pathname.startsWith(link.href)

          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'block whitespace-nowrap rounded-lg px-4 py-2.5 text-sm tracking-wide transition-colors',
                  active
                    ? 'bg-gold/12 text-gold'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-beige',
                ].join(' ')}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
