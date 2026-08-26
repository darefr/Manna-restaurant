import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signOutAction } from '@/app/actions/auth'
import AdminChrome from '@/components/admin/AdminChrome'
import { ADMIN_NAV } from '@/lib/admin-nav'
import { getCurrentUser } from '@/lib/auth'
import { ensureSchema } from '@/lib/db'
import { can, isStaffRole, ROLE_LABELS, type Role } from '@/lib/rbac'

// Admin access is resolved from the request's session and role, so this route
// tree must only render at request time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Management | Manna Restaurant',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureSchema()

  const user = await getCurrentUser()

  // Two separate gates: signed in, and actually a staff member. A customer who
  // types /admin is bounced to their own portal, never shown the shell.
  if (!user) redirect('/signin?next=/admin')
  if (!isStaffRole(user.role)) redirect('/account')

  // Build the menu from the role's permissions so no unusable links render.
  const groups = ADMIN_NAV.map((group) => ({
    group: group.group,
    items: group.items.filter((item) => item.permission === null || can(user.role, item.permission)),
  })).filter((group) => group.items.length > 0)

  return (
    <AdminChrome
      groups={groups}
      user={{ name: user.name, email: user.email }}
      roleLabel={ROLE_LABELS[user.role as Role] ?? user.role}
      signOut={signOutAction}
    >
      {children}
    </AdminChrome>
  )
}
