import type { Metadata } from 'next'

import AuthShell from '@/components/auth/AuthShell'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | Manna Restaurant and Tandoori',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a 6-digit code to set a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
