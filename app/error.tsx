'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Route-level error boundary.
 *
 * Prevents an unhandled server or client exception from rendering the bare
 * "a server error occurred" screen. The stack trace is never shown to guests —
 * only the digest, which correlates with the server logs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[manna] route error', { digest: error.digest, name: error.name })
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Something went wrong</p>
        <h1 className="mt-4 font-serif text-3xl text-beige">
          We couldn&apos;t complete that just now
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The page ran into an unexpected problem. Please try again — if it keeps happening, our
          team has been notified.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={reset} className="btn-gold text-xs">
            Try again
          </button>
          <Link href="/" className="btn-outline-gold text-xs">
            Back to home
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-6 text-[11px] text-muted-foreground/70">Reference: {error.digest}</p>
        ) : null}
      </div>
    </main>
  )
}
