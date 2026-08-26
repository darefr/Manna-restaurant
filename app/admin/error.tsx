'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Admin-scoped error boundary. Keeps the dashboard usable when a single
 * management screen fails, instead of blanking the whole app.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[manna][admin] route error', { digest: error.digest, name: error.name })
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Dashboard error</p>
        <h1 className="mt-4 font-serif text-2xl text-beige">This screen didn&apos;t load</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Unable to load this section right now. Your data has not been changed.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={reset} className="btn-gold text-xs">
            Retry
          </button>
          <Link href="/admin" className="btn-outline-gold text-xs">
            Dashboard home
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-6 text-[11px] text-muted-foreground/70">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  )
}
