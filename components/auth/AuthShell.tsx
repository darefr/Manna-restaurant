import Link from 'next/link'
import type { ReactNode } from 'react'

import { images, restaurant } from '@/lib/restaurant'

/**
 * Split-screen membership portal chrome: real restaurant photography on one
 * side, the form on the other. Collapses to a single column on mobile with the
 * photograph as a subtle backdrop.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Imagery panel */}
      <aside className="relative hidden w-full overflow-hidden lg:flex lg:w-[45%] xl:w-1/2">
        <img
          src={images.diningRoom || '/placeholder.svg'}
          alt="The dining room at Manna Restaurant and Tandoori"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#080808] via-[#080808]/80 to-[#080808]/30" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-[0.18em] text-gradient-gold">MANNA</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Restaurant &amp; Tandoori
            </span>
          </Link>

          <div className="max-w-md">
            <div className="section-divider mb-6" />
            <p className="font-serif text-3xl leading-snug text-balance text-foreground xl:text-4xl">
              {restaurant.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Order ahead, reserve your table, save your favourite dishes and earn points on every
              visit to {restaurant.address.line1}.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {restaurant.qualities.map((quality) => (
                <span
                  key={quality}
                  className="text-[10px] uppercase tracking-[0.25em] text-[#c9a84c]"
                >
                  {quality}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex w-full flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:w-[55%] xl:w-1/2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(8,8,8,0.94), rgba(8,8,8,0.99)), url(${images.diningRoom})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <Link href="/" className="mb-10 flex flex-col items-center lg:hidden">
            <span className="font-serif text-2xl font-bold tracking-[0.18em] text-gradient-gold">MANNA</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Restaurant &amp; Tandoori
            </span>
          </Link>

          <header className="mb-8">
            <h1 className="font-serif text-3xl text-balance text-foreground sm:text-4xl">{title}</h1>
            {subtitle ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
            ) : null}
          </header>

          {children}

          {footer ? <div className="mt-8">{footer}</div> : null}

          <p className="mt-10 text-center text-xs text-muted-foreground/70">
            <Link href="/" className="transition-colors hover:text-[#c9a84c]">
              Back to the restaurant
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
