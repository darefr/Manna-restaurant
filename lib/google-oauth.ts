import 'server-only'

import { siteUrl } from './mailer'

/**
 * Google OAuth 2.0 (authorization code flow).
 *
 * Credentials come from GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and are only
 * ever read on the server. When they are absent the button is hidden and
 * email/password auth continues to work untouched.
 */

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

export const isGoogleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
)

export function googleRedirectUri() {
  return `${siteUrl()}/api/auth/google/callback`
}

export function buildGoogleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    // Always show the account chooser so users can pick which Google account.
    prompt: 'select_account',
    access_type: 'online',
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export type GoogleProfile = {
  sub: string
  email: string
  emailVerified: boolean
  name: string
  picture: string | null
}

export async function exchangeGoogleCode(code: string): Promise<GoogleProfile> {
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Google token exchange failed (${tokenResponse.status})`)
  }

  const token = (await tokenResponse.json()) as { access_token?: string }
  if (!token.access_token) throw new Error('Google did not return an access token.')

  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${token.access_token}` },
  })
  if (!userResponse.ok) throw new Error(`Google userinfo failed (${userResponse.status})`)

  const profile = (await userResponse.json()) as {
    sub: string
    email?: string
    email_verified?: boolean
    name?: string
    picture?: string
  }

  if (!profile.email) throw new Error('Google account has no email address.')

  return {
    sub: profile.sub,
    email: profile.email.toLowerCase(),
    emailVerified: profile.email_verified !== false,
    name: profile.name ?? profile.email.split('@')[0],
    picture: profile.picture ?? null,
  }
}
