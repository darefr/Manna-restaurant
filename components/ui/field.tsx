'use client'

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Form primitives styled to the Manna identity (dark glass + gold hairlines).
 * Used across auth, checkout, the customer portal and the admin panel so every
 * form in the platform looks like part of the same restaurant.
 */

const base =
  'w-full rounded-lg bg-[#0d0d0d] border border-[#c9a84c]/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors outline-none focus:border-[#c9a84c]/70 focus:ring-2 focus:ring-[#c9a84c]/20 disabled:opacity-50 disabled:cursor-not-allowed'

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
    >
      <span>{children}</span>
      {hint ? <span className="text-[10px] normal-case tracking-normal opacity-70">{hint}</span> : null}
    </label>
  )
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="text-xs text-destructive">
      {children}
    </p>
  )
}

type FieldProps = {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function Field({ label, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? <Label hint={hint}>{label}</Label> : null}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'min-h-24 resize-y', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, 'appearance-none pr-10', className)} {...props}>
      {children}
    </select>
  )
}
