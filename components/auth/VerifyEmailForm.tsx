'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2, MailCheck } from 'lucide-react'

import { resendOtpAction, verifyEmailAction, type AuthState } from '@/app/actions/auth'

import { Alert, SubmitButton } from './AuthBits'
import OtpInput from './OtpInput'

const initialState: AuthState = { status: 'idle' }
const RESEND_SECONDS = 60

function ResendButton({ seconds }: { seconds: number }) {
  const { pending } = useFormStatus()
  const blocked = seconds > 0 || pending

  return (
    <button
      type="submit"
      disabled={blocked}
      className="inline-flex items-center gap-2 text-xs tracking-wide text-[#c9a84c] transition-colors hover:text-[#e8c96a] disabled:cursor-not-allowed disabled:text-muted-foreground"
    >
      {pending ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : null}
      {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
    </button>
  )
}

export default function VerifyEmailForm({
  email,
  initialMessage,
}: {
  email: string
  initialMessage?: string
}) {
  const [state, formAction] = useActionState(verifyEmailAction, initialState)
  const [resendState, resendAction] = useActionState(resendOtpAction, initialState)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const formRef = useRef<HTMLFormElement>(null)

  // Countdown before another code may be requested.
  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  // Restart the countdown each time a new code is sent.
  useEffect(() => {
    if (resendState.status === 'otp') setSeconds(RESEND_SECONDS)
  }, [resendState])

  const notice = state.status === 'error' ? null : resendState.message ?? initialMessage

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/5 px-4 py-3.5">
        <MailCheck size={16} className="mt-0.5 shrink-0 text-[#c9a84c]" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a 6-digit code to <span className="text-foreground">{email}</span>. It expires in 10
          minutes.
        </p>
      </div>

      {state.status === 'error' && state.message ? <Alert tone="error">{state.message}</Alert> : null}
      {notice && state.status !== 'error' ? <Alert tone="success">{notice}</Alert> : null}

      <form ref={formRef} action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="email" value={email} />
        <OtpInput
          name="code"
          onComplete={() => {
            // Submit as soon as the sixth digit lands.
            formRef.current?.requestSubmit()
          }}
        />
        <SubmitButton pendingLabel="Verifying">Verify &amp; Continue</SubmitButton>
      </form>

      <form action={resendAction} className="text-center">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="purpose" value="EMAIL_VERIFICATION" />
        <ResendButton seconds={seconds} />
      </form>
    </div>
  )
}
