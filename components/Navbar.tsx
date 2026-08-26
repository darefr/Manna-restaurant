'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { restaurant } from '@/lib/restaurant'
import type { SessionUser } from '@/lib/auth'

// Each major navbar item opens its own dedicated route.
const navLinks = [
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Chef', href: '/chef' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar({ user = null }: { user?: Pick<SessionUser, 'name'> | null }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { count } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent the page behind the mobile drawer from scrolling.
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const isActive = (href: string) => pathname === href

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-dark py-3 shadow-2xl'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start">
            <span className="font-serif text-xl md:text-2xl font-bold tracking-[0.18em] text-gradient-gold leading-none">
              MANNA
            </span>
            <span className="text-[9px] md:text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Restaurant &amp; Tandoori
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`text-xs tracking-[0.2em] uppercase transition-colors duration-300 relative group ${
                  isActive(link.href)
                    ? 'text-[#c9a84c]'
                    : 'text-muted-foreground hover:text-[#c9a84c]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-[#c9a84c] transition-all duration-300 ${
                    isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${restaurant.phones.reception.number}`}
              className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground hover:text-[#c9a84c] transition-colors"
            >
              <Phone size={14} />
              <span>{restaurant.phones.reception.display}</span>
            </a>
            {/* /account is protected on the server: guests land on sign-in. */}
            <Link
              href={user ? '/account' : '/signin'}
              aria-label={user ? 'My account' : 'Sign in'}
              className="flex items-center gap-2 rounded-full border border-[#c9a84c]/70 px-3 py-2 text-xs uppercase tracking-widest text-[#c9a84c] transition-colors hover:bg-[#c9a84c] hover:text-[#080808]"
            >
              <User size={17} />
              <span>{user ? 'My Account' : 'Sign In'}</span>
            </Link>
            <Link
              href="/order"
              className="btn-gold relative px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest"
            >
              Order Now
              {count > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#080808] px-1 text-[10px] font-semibold text-[#c9a84c] ring-1 ring-[#c9a84c]">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>

          {/* Keep auth and hamburger together as one compact mobile control group. */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <Link
              href={user ? '/account' : '/signin'}
              aria-label={user ? 'My Account' : 'Sign In'}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#c9a84c]/70 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c9a84c] transition-colors hover:bg-[#c9a84c] hover:text-[#080808]"
            >
              <User size={14} />
              <span>{user ? 'My Account' : 'Sign In'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileOpen((open) => !open)}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/10"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-7 overflow-y-auto py-24"
          >
            {/* Decorative */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#c9a84c] opacity-5 blur-3xl" />
            </div>

            <Link href="/" className="flex flex-col items-center gap-2 mb-4 relative">
              <span className="font-serif text-4xl font-bold text-gradient-gold tracking-[0.18em]">MANNA</span>
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase text-center">
                Restaurant &amp; Tandoori
              </span>
            </Link>

            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`text-lg tracking-[0.2em] uppercase transition-colors font-light ${
                    isActive(link.href) ? 'text-[#c9a84c]' : 'text-foreground hover:text-[#c9a84c]'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.08 }}
              className="relative"
            >
              <Link
                href="/order"
                className="btn-gold mt-2 px-8 py-3 rounded-full text-sm font-semibold tracking-widest inline-block"
              >
                Order Now{count > 0 ? ` (${count})` : ''}
              </Link>
            </motion.div>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (navLinks.length + 1) * 0.08 }}
              href={`tel:${restaurant.phones.reception.number}`}
              className="flex items-center gap-2 text-sm tracking-widest text-[#c9a84c] relative"
            >
              <Phone size={14} />
              {restaurant.phones.reception.display}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
