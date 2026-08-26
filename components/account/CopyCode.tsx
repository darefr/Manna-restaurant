'use client'

import { useState } from 'react'

/** Coupon / referral code with a copy-to-clipboard affordance. */
export default function CopyCode({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard permission denied — the code is still visible to select.
    }
  }

  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 rounded-lg border border-gold/25 bg-gold/8 px-3.5 py-2.5 font-mono text-sm tracking-widest text-gold">
        {code}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label ?? 'code'} ${code}`}
        className="shrink-0 rounded-lg border border-border px-3.5 py-2.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-gold/40 hover:text-beige"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
