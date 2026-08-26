import { notFound } from 'next/navigation'

import {
  NotificationForm,
  PasswordForm,
  ProfileForm,
} from '@/components/account/SettingsForms'
import { SectionHeader } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getPreferences, getProfile } from '@/lib/customer'
import { query } from '@/lib/db'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const user = await requireUser()

  const [profile, preferences, passwordRows] = await Promise.all([
    getProfile(user.id),
    getPreferences(user.id),
    query<{ has_password: boolean }>(
      'SELECT (password_hash IS NOT NULL) AS has_password FROM users WHERE id = $1',
      [user.id],
    ),
  ])

  if (!profile) notFound()

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader title="Settings" subtitle="Manage your details and how we contact you." />

      <ProfileForm profile={profile} />
      <NotificationForm preferences={preferences} />
      <PasswordForm hasPassword={passwordRows[0]?.has_password ?? false} />
    </div>
  )
}
