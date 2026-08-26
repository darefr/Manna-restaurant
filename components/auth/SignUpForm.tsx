'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { signUpAction, type AuthState } from '@/app/actions/auth'
import { Field, Input } from '@/components/ui/field'

import { Alert, GoogleButton, OrDivider, SubmitButton } from './AuthBits'
import VerifyEmailForm from './VerifyEmailForm'

const initialState: AuthState = { status: 'idle' }

export default function SignUpForm({
  googleEnabled,
  referral,
}: {
  googleEnabled: boolean
  referral?: string
}) {
  const [state, formAction] = useActionState(signUpAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  if (state.status === 'otp' && state.email) {
    return <VerifyEmailForm email={state.email} initialMessage={state.message} />
  }

  return (
    <div className="flex flex-col gap-6">
      {googleEnabled ? (
        <>
          <GoogleButton label="Sign up with Google" />
          <OrDivider />
        </>
      ) : null}

      <form action={formAction} className="flex flex-col gap-5">
        {referral ? <input type="hidden" name="referral" value={referral} /> : null}

        {state.status === 'error' && state.message ? <Alert tone="error">{state.message}</Alert> : null}

        <Field label="Full name" error={state.fieldErrors?.name}>
          <Input name="name" required autoComplete="name" placeholder="Your name" minLength={2} />
        </Field>

        <Field label="Email" error={state.fieldErrors?.email}>
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state.email}
          />
        </Field>

        <Field
          label="Password"
          hint="8+ characters, a letter and a number"
          error={state.fieldErrors?.password}
        >
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Create a password"
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

        <Field label="Confirm password" error={state.fieldErrors?.confirmPassword}>
          <Input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            minLength={8}
          />
        </Field>

        {referral ? (
          <p className="text-xs text-[#c9a84c]">
            Referral code <span className="font-semibold">{referral}</span> applied.
          </p>
        ) : null}

        <SubmitButton pendingLabel="Creating account">Create Account</SubmitButton>

        <p className="text-center text-xs leading-relaxed text-muted-foreground/80">
          We&apos;ll email you a 6-digit code to verify your address.
        </p>
      </form>
    </div>
  )
}
