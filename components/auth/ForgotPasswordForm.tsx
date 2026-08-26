'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'

import {
  requestPasswordResetAction,
  resendOtpAction,
  resetPasswordAction,
  type AuthState,
} from '@/app/actions/auth'
import { Field, Input } from '@/components/ui/field'

import { Alert, SubmitButton } from './AuthBits'
import OtpInput from './OtpInput'

const initialState: AuthState = { status: 'idle' }
const RESEND_SECONDS = 60

function ResendButton({ seconds }: { seconds: number }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={seconds > 0 || pending}
      className="inline-flex items-center gap-2 text-xs tracking-wide text-[#c9a84c] transition-colors hover:text-[#e8c96a] disabled:cursor-not-allowed disabled:text-muted-foreground"
    >
      {pending ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : null}
      {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
    </button>
  )
}

export default function ForgotPasswordForm() {
  const [requestState, requestAction] = useActionState(requestPasswordResetAction, initialState)
  const [resetState, resetAction] = useActionState(resetPasswordAction, initialState)
  const [resendState, resendAction] = useActionState(resendOtpAction, initialState)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  useEffect(() => {
    if (resendState.status === 'otp') setSeconds(RESEND_SECONDS)
  }, [resendState])

  // Step 3 — done.
  if (resetState.status === 'success') {
    return (
      <div className="flex flex-col gap-6">
        <Alert tone="success">{resetState.message}</Alert>
        <Link
          href="/signin"
          className="btn-gold flex w-full items-center justify-center rounded-full px-6 py-3.5 text-xs font-semibold tracking-[0.15em]"
        >
          Continue to Sign In
        </Link>
      </div>
    )
  }

  const email = requestState.email

  // Step 2 — code + new password.
  if (requestState.status === 'otp' && email) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-3 rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/5 px-4 py-3.5">
          <MailCheck size={16} className="mt-0.5 shrink-0 text-[#c9a84c]" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            If <span className="text-foreground">{email}</span> is registered, a 6-digit code is on
            its way. It expires in 10 minutes.
          </p>
        </div>

        {resetState.status === 'error' && resetState.message ? (
          <Alert tone="error">{resetState.message}</Alert>
        ) : null}

        <form action={resetAction} className="flex flex-col gap-6">
          <input type="hidden" name="email" value={email} />

          <div className="flex flex-col gap-2">
            <OtpInput name="code" />
            {resetState.fieldErrors?.code ? (
              <p className="text-center text-xs text-destructive">{resetState.fieldErrors.code}</p>
            ) : null}
          </div>

          <Field label="New password" hint="8+ characters" error={resetState.fieldErrors?.password}>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Choose a new password"
                minLength={8}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-[#c9a84c]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm password" error={resetState.fieldErrors?.confirmPassword}>
            <Input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Repeat your new password"
              minLength={8}
            />
          </Field>

          <SubmitButton pendingLabel="Updating">Reset Password</SubmitButton>
        </form>

        <form action={resendAction} className="text-center">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="purpose" value="PASSWORD_RESET" />
          <ResendButton seconds={seconds} />
        </form>
      </div>
    )
  }

  // Step 1 — ask for the email.
  return (
    <form action={requestAction} className="flex flex-col gap-5">
      {requestState.status === 'error' && requestState.message ? (
        <Alert tone="error">{requestState.message}</Alert>
      ) : null}

      <Field label="Email">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={requestState.email}
        />
      </Field>

      <SubmitButton pendingLabel="Sending code">Send Reset Code</SubmitButton>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/signin" className="transition-colors hover:text-[#c9a84c]">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
