import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AuthShell from '@/components/auth/AuthShell'
import SignInForm from '@/components/auth/SignInForm'
import { getCurrentUser } from '@/lib/auth'
import { isGoogleConfigured } from '@/lib/google-oauth'
import { isStaffRole } from '@/lib/rbac'

export const metadata: Metadata = {
  title: 'Sign In | Manna Restaurant and Tandoori',
  description:
    'Sign in to your Manna Restaurant membership account to order online, book a table and track your loyalty rewards.',
  robots: { index: false, follow: false },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()

  if (user) {
    redirect(params.next?.startsWith('/') ? params.next : isStaffRole(user.role) ? '/admin' : '/account')
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to order ahead, manage your reservations and collect points on every meal."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#c9a84c] transition-colors hover:text-[#e8c96a]">
            Create account
          </Link>
        </p>
      }
    >
      <SignInForm
        googleEnabled={isGoogleConfigured}
        next={params.next?.startsWith('/') ? params.next : undefined}
        oauthError={params.error}
      />
    </AuthShell>
  )
}
