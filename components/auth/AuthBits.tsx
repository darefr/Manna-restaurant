'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Primary submit button with a built-in pending state. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = 'gold',
}: {
  children: ReactNode
  pendingLabel?: string
  className?: string
  variant?: 'gold' | 'outline'
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-semibold tracking-[0.15em] transition-all disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'gold' ? 'btn-gold' : 'btn-outline-gold',
        className,
      )}
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          {pendingLabel ?? 'Please wait'}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function Alert({ tone, children }: { tone: 'error' | 'success' | 'info'; children: ReactNode }) {
  if (!children) return null

  const styles = {
    error: 'border-destructive/40 bg-destructive/10 text-destructive',
    success: 'border-[#c9a84c]/40 bg-[#c9a84c]/10 text-[#e8c96a]',
    info: 'border-[#c9a84c]/25 bg-[#c9a84c]/5 text-muted-foreground',
  }[tone]

  const Icon = tone === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', styles)}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="leading-relaxed">{children}</span>
    </div>
  )
}

export function OrDivider({ label = 'OR' }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a84c]/30" />
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a84c]/30" />
    </div>
  )
}

/** Google's brand mark, rendered inline so no external request is needed. */
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  )
}

/**
 * Starts the Google OAuth flow. Rendered as a link to the server route so the
 * redirect happens without any client-side credential handling.
 */
export function GoogleButton({ next, label }: { next?: string; label?: string }) {
  const href = next ? `/api/auth/google?next=${encodeURIComponent(next)}` : '/api/auth/google'

  return (
    <Link
      href={href}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-[#c9a84c]/25 bg-[#111111] px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:border-[#c9a84c]/60 hover:bg-[#161616]"
    >
      <GoogleMark />
      {label ?? 'Continue with Google'}
    </Link>
  )
}
