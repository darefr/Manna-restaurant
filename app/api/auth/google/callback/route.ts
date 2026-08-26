import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createSession, ensureUserExtras } from '@/lib/auth'
import { ensureSchema, query } from '@/lib/db'
import { welcomeEmail } from '@/lib/email-templates'
import { exchangeGoogleCode, isGoogleConfigured } from '@/lib/google-oauth'
import { sendEmail, siteUrl } from '@/lib/mailer'
import { isStaffRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

const STATE_COOKIE = 'manna_oauth_state'
const NEXT_COOKIE = 'manna_oauth_next'

function fail(request: Request, reason: string) {
  return NextResponse.redirect(new URL(`/signin?error=${reason}`, request.url))
}

export async function GET(request: Request) {
  if (!isGoogleConfigured) return fail(request, 'google_unavailable')

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const store = await cookies()
  const expectedState = store.get(STATE_COOKIE)?.value
  const next = store.get(NEXT_COOKIE)?.value

  store.delete(STATE_COOKIE)
  store.delete(NEXT_COOKIE)

  if (url.searchParams.get('error')) return fail(request, 'google_cancelled')
  if (!code || !state || !expectedState || state !== expectedState) {
    return fail(request, 'google_state')
  }

  try {
    await ensureSchema()
    const profile = await exchangeGoogleCode(code)

    // Google-verified emails are trusted — no second OTP is required.
    const existing = await query<{ id: string; role: string; is_active: boolean; name: string }>(
      'SELECT id, role, is_active, name FROM users WHERE email_lower = $1',
      [profile.email],
    )

    let userId: string
    let isNew = false

    if (existing.length > 0) {
      const user = existing[0]
      if (!user.is_active) return fail(request, 'account_disabled')
      userId = user.id
      await query(
        `UPDATE users
            SET email_verified = TRUE,
                image_url = COALESCE(image_url, $2),
                name = CASE WHEN name = '' THEN $3 ELSE name END,
                updated_at = now()
          WHERE id = $1`,
        [userId, profile.picture, profile.name],
      )
    } else {
      const inserted = await query<{ id: string }>(
        `INSERT INTO users (email, name, image_url, role, email_verified)
         VALUES ($1, $2, $3, 'CUSTOMER', TRUE) RETURNING id`,
        [profile.email, profile.name, profile.picture],
      )
      userId = inserted[0].id
      isNew = true
    }

    // Link the Google identity to the account.
    await query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_account_id)
       VALUES ($1, 'google', $2)
       ON CONFLICT (provider, provider_account_id) DO NOTHING`,
      [userId, profile.sub],
    )

    await ensureUserExtras(userId)
    await createSession(userId)

    if (isNew) {
      await sendEmail({
        to: profile.email,
        content: welcomeEmail(profile.name, siteUrl()),
        type: 'WELCOME',
        userId,
      })
    }

    const role = existing[0]?.role ?? 'CUSTOMER'
    const target = next && next.startsWith('/') ? next : isStaffRole(role) ? '/admin' : '/account'
    return NextResponse.redirect(new URL(target, request.url))
  } catch (error) {
    console.error('[manna] Google sign-in failed', error)
    return fail(request, 'google_failed')
  }
}
