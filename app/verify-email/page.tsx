import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import AuthShell from '@/components/auth/AuthShell'
import VerifyEmailForm from '@/components/auth/VerifyEmailForm'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Verify your email',
  robots: { index: false, follow: false },
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams
  const user = await getCurrentUser()

  // Fall back to the signed-in address so the page still works without a param.
  const target = email ?? user?.email
  if (!target) redirect('/signin')

  return (
    <AuthShell title="Verify your email" subtitle="Enter the 6-digit code we sent you.">
      <VerifyEmailForm email={target} />
    </AuthShell>
  )
}
