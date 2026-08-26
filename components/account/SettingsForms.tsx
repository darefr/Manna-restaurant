'use client'

import { useActionState } from 'react'

import { saveNotificationPrefsAction, type AddressState } from '@/app/actions/account'
import { changePasswordAction, updateProfileAction, type AuthState } from '@/app/actions/auth'
import type { Preferences, Profile } from '@/lib/customer'

const EMPTY_AUTH: AuthState = { status: 'idle' }
const EMPTY: AddressState = { status: 'idle' }

const inputClass =
  'w-full rounded-lg border border-border bg-black/30 px-3.5 py-2.5 text-sm text-beige placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-gold/50'

function Feedback({ status, message }: { status: string; message?: string }) {
  if (status === 'idle' || !message) return null
  return (
    <p
      role={status === 'error' ? 'alert' : 'status'}
      className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}
    >
      {message}
    </p>
  )
}

/* ------------------------------------------------------------------ profile */

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, EMPTY_AUTH)

  return (
    <form action={formAction} className="glass-card flex flex-col gap-5 rounded-xl p-6">
      <h3 className="font-serif text-lg text-beige">Profile</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Name</span>
          <input name="name" required defaultValue={profile.name} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</span>
          {/* Read-only: changing it would require re-verification. */}
          <input
            value={profile.email}
            readOnly
            disabled
            className={`${inputClass} cursor-not-allowed opacity-60`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</span>
          <input name="phone" defaultValue={profile.phone ?? ''} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Birthday</span>
          <input
            type="date"
            name="birthday"
            defaultValue={profile.birthday ?? ''}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Anniversary
          </span>
          <input
            type="date"
            name="anniversary"
            defaultValue={profile.anniversary ?? ''}
            className={inputClass}
          />
        </label>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        We only use your birthday and anniversary to send you an offer, and only if you have
        marketing messages switched on below.
      </p>

      <Feedback status={state.status} message={state.message} />

      <div>
        <button type="submit" disabled={pending} className="btn-gold text-xs disabled:opacity-50">
          {pending ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}

/* ----------------------------------------------------------------- password */

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, EMPTY_AUTH)

  return (
    <form action={formAction} className="glass-card flex flex-col gap-5 rounded-xl p-6">
      <h3 className="font-serif text-lg text-beige">
        {hasPassword ? 'Change password' : 'Set a password'}
      </h3>

      {!hasPassword ? (
        <p className="text-sm text-muted-foreground">
          You signed in with Google. Set a password if you would also like to sign in with your
          email address.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {hasPassword ? (
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Current password
            </span>
            <input
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            New password
          </span>
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Confirm password
          </span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </label>
      </div>

      <Feedback status={state.status} message={state.message} />

      <div>
        <button type="submit" disabled={pending} className="btn-gold text-xs disabled:opacity-50">
          {pending ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------ notifications */

export function NotificationForm({ preferences }: { preferences: Preferences }) {
  const [state, formAction, pending] = useActionState(saveNotificationPrefsAction, EMPTY)

  const toggles = [
    { name: 'email', label: 'Email', hint: 'Order and booking confirmations.', value: preferences.email },
    { name: 'sms', label: 'SMS', hint: 'Text updates about your order.', value: preferences.sms },
    { name: 'whatsapp', label: 'WhatsApp', hint: 'Order updates on WhatsApp.', value: preferences.whatsapp },
    {
      name: 'marketing',
      label: 'Offers and news',
      hint: 'Seasonal menus, offers and birthday treats.',
      value: preferences.marketing,
    },
  ]

  return (
    <form action={formAction} className="glass-card flex flex-col gap-5 rounded-xl p-6">
      <h3 className="font-serif text-lg text-beige">Notifications</h3>

      <ul className="flex flex-col divide-y divide-[color:var(--border)]">
        {toggles.map((toggle) => (
          <li key={toggle.name} className="py-4 first:pt-0 last:pb-0">
            <label className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm text-beige">{toggle.label}</span>
                <span className="block text-xs text-muted-foreground">{toggle.hint}</span>
              </span>
              <input
                type="checkbox"
                name={toggle.name}
                defaultChecked={toggle.value}
                className="mt-1 h-4 w-4 shrink-0 accent-[#c9a84c]"
              />
            </label>
          </li>
        ))}
      </ul>

      <Feedback status={state.status} message={state.message} />

      <div>
        <button type="submit" disabled={pending} className="btn-gold text-xs disabled:opacity-50">
          {pending ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </form>
  )
}
