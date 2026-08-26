import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { buildGoogleAuthUrl, isGoogleConfigured } from '@/lib/google-oauth'

export const dynamic = 'force-dynamic'

const STATE_COOKIE = 'manna_oauth_state'
const NEXT_COOKIE = 'manna_oauth_next'

export async function GET(request: Request) {
  if (!isGoogleConfigured) {
    return NextResponse.redirect(
      new URL('/signin?error=google_unavailable', request.url),
    )
  }

  const url = new URL(request.url)
  const next = url.searchParams.get('next')

  // CSRF protection: random state echoed back by Google and compared on return.
  const state = randomBytes(16).toString('hex')
  const store = await cookies()

  store.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  if (next && next.startsWith('/')) {
    store.set(NEXT_COOKIE, next, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    })
  }

  return NextResponse.redirect(buildGoogleAuthUrl(state))
}
