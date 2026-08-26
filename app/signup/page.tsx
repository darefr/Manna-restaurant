import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AuthShell from '@/components/auth/AuthShell'
import SignUpForm from '@/components/auth/SignUpForm'
import { getCurrentUser } from '@/lib/auth'
import { isGoogleConfigured } from '@/lib/google-oauth'
import { isStaffRole } from '@/lib/rbac'

export const metadata: Metadata = {
  title: 'Create Account | Manna Restaurant and Tandoori',
  description:
    'Join the Manna Restaurant membership to order online, reserve tables, save favourite dishes and earn loyalty points.',
  robots: { index: false, follow: false },
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()

  if (user) redirect(isStaffRole(user.role) ? '/admin' : '/account')

  return (
    <AuthShell
      title="Create your account"
      subtitle="Order ahead, save your favourite dishes and earn points on every visit."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already a member?{' '}
          <Link href="/signin" className="text-[#c9a84c] transition-colors hover:text-[#e8c96a]">
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm
        googleEnabled={isGoogleConfigured}
        referral={params.ref?.slice(0, 32).toUpperCase()}
      />
    </AuthShell>
  )
}
