'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { signInAction, type AuthState } from '@/app/actions/auth'
import { Field, Input } from '@/components/ui/field'

import { Alert, GoogleButton, OrDivider, SubmitButton } from './AuthBits'
import VerifyEmailForm from './VerifyEmailForm'

const initialState: AuthState = { status: 'idle' }

const OAUTH_ERRORS: Record<string, string> = {
  google_unavailable: 'Google sign-in is not configured yet. Please use your email and password.',
  google_cancelled: 'Google sign-in was cancelled.',
  google_state: 'That sign-in link expired. Please try again.',
  google_failed: 'We could not complete Google sign-in. Please try again.',
  account_disabled: 'This account has been deactivated. Please contact the restaurant.',
}

export default function SignInForm({
  googleEnabled,
  next,
  oauthError,
}: {
  googleEnabled: boolean
  next?: string
  oauthError?: string
}) {
  const [state, formAction] = useActionState(signInAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  // An unverified account is redirected straight into the OTP step.
  if (state.status === 'otp' && state.email) {
    return <VerifyEmailForm email={state.email} initialMessage={state.message} />
  }

  const oauthMessage = oauthError ? OAUTH_ERRORS[oauthError] ?? 'Sign-in failed. Please try again.' : null

  return (
    <div className="flex flex-col gap-6">
      {oauthMessage ? <Alert tone="error">{oauthMessage}</Alert> : null}

      {googleEnabled ? (
        <>
          <GoogleButton next={next} />
          <OrDivider />
        </>
      ) : null}

      <form action={formAction} className="flex flex-col gap-5">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {state.status === 'error' && state.message ? <Alert tone="error">{state.message}</Alert> : null}

        <Field label="Email">
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state.email}
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Your password"
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

        <SubmitButton pendingLabel="Signing in">Sign In</SubmitButton>
      </form>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-xs tracking-wide text-muted-foreground transition-colors hover:text-[#c9a84c]"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  )
}
