'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/** Keeps account pages recoverable instead of showing a server error screen. */
export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[manna][account] route error', { digest: error.digest, name: error.name })
  }, [error])

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h2 className="font-serif text-2xl text-beige">We couldn&apos;t load this page</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Something went wrong loading your account details. Please try again.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={reset} className="btn-gold text-xs">
            Try again
          </button>
          <Link href="/account" className="btn-outline-gold text-xs">
            My account
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-6 text-[11px] text-muted-foreground/70">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  )
}
