import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AccountNav from '@/components/account/AccountNav'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { signOutAction } from '@/app/actions/auth'
import { getCurrentUser } from '@/lib/auth'

// Account routes depend on the request's session cookie and must never be
// evaluated during static generation.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Account | Manna Restaurant',
  description: 'Your orders, reservations, rewards and preferences at Manna Restaurant.',
  robots: { index: false, follow: false },
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate. Hiding the links in the UI is never the protection.
  const user = await getCurrentUser()
  if (!user) redirect('/signin?next=/account')

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <>
      <Navbar user={user} />

      <main className="min-h-screen bg-background pt-28 pb-24">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <header className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-8">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-serif text-lg text-gold"
              >
                {initials || 'M'}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/70">My account</p>
                <h1 className="font-serif text-2xl text-beige sm:text-3xl">{user.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/order" className="btn-outline-gold text-xs">
                Order now
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-beige"
                >
                  Sign out
                </button>
              </form>
            </div>
          </header>

          <div className="flex flex-col gap-10 pt-10 lg:flex-row lg:gap-14">
            <aside className="lg:w-56 lg:shrink-0">
              <AccountNav />
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
