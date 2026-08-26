import 'server-only'

import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { ensureSchema, isDatabaseConfigured, logDatabaseError, query } from './db'
import { isStaffRole, type Permission, can } from './rbac'

export const SESSION_COOKIE = 'manna_session'
const SESSION_TTL_DAYS = 30
const OTP_TTL_MINUTES = 10
const OTP_MAX_ATTEMPTS = 5

export type SessionUser = {
  id: string
  email: string
  name: string
  phone: string | null
  imageUrl: string | null
  role: string
  emailVerified: boolean
  isActive: boolean
  birthday: string | null
  anniversary: string | null
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

// ---------------------------------------------------------------- rate limit

/**
 * Sliding-window rate limiter backed by Postgres.
 * Returns true when the action is allowed.
 */
export async function checkRateLimit(bucket: string, limit: number, windowSeconds: number) {
  if (!isDatabaseConfigured) return true
  await query(`DELETE FROM rate_limits WHERE event_at < now() - interval '1 day'`)
  const rows = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM rate_limits
      WHERE bucket = $1 AND event_at > now() - ($2 || ' seconds')::interval`,
    [bucket, String(windowSeconds)],
  )
  if (Number(rows[0]?.count ?? 0) >= limit) return false
  await query('INSERT INTO rate_limits (bucket) VALUES ($1)', [bucket])
  return true
}

export async function clientIp() {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}

// ------------------------------------------------------------------ sessions

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const h = await headers()
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000)

  await query(
    `INSERT INTO sessions (token_hash, user_id, user_agent, ip, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [sha256(token), userId, h.get('user-agent')?.slice(0, 300) ?? null, await clientIp(), expires],
  )

  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId])

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires,
  })

  return token
}

export async function destroySession() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token && isDatabaseConfigured) {
    await query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]).catch(() => {})
  }
  store.delete(SESSION_COOKIE)
}

/**
 * Resolves the signed-in user for the current request.
 * Cached per-request so multiple components can call it without extra queries.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!isDatabaseConfigured) return null

  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    await ensureSchema()
    const rows = await query<{
      id: string
      email: string
      name: string
      phone: string | null
      image_url: string | null
      role: string
      email_verified: boolean
      is_active: boolean
      birthday: string | null
      anniversary: string | null
    }>(
      `SELECT u.id, u.email, u.name, u.phone, u.image_url, u.role,
              u.email_verified, u.is_active, u.birthday::text, u.anniversary::text
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha256(token)],
    )

    const row = rows[0]
    if (!row || !row.is_active) return null

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      imageUrl: row.image_url,
      role: row.role,
      emailVerified: row.email_verified,
      isActive: row.is_active,
      birthday: row.birthday,
      anniversary: row.anniversary,
    }
  } catch (error) {
    logDatabaseError('session lookup failed', error)
    return null
  }
})

// ------------------------------------------------------------- authorisation

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Guards used by Server Components (pages/layouts).
 *
 * These redirect rather than throw: an unauthenticated visitor must land on the
 * sign-in page, never on the generic "a server error occurred" screen.
 * `redirect()` works by throwing a special NEXT_REDIRECT signal, so it must not
 * be wrapped in a try/catch by callers.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/signin')
  return user
}

/** Any staff member (used to gate /admin as a whole). */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/signin?next=/admin')
  if (!isStaffRole(user.role)) redirect('/account')
  return user
}

/** Staff member holding a specific permission. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireStaff()
  if (!can(user.role, permission)) redirect('/admin?denied=1')
  return user
}

/**
 * Guards used by Server Actions.
 *
 * Actions return a result object to the client, so they must throw a typed
 * AuthError (caught and converted into a friendly message) instead of
 * redirecting mid-mutation.
 */
export async function requireUserForAction(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError('You must be signed in.')
  return user
}

export async function requireStaffForAction(): Promise<SessionUser> {
  const user = await requireUserForAction()
  if (!isStaffRole(user.role)) throw new AuthError('Administrator access required.')
  return user
}

export async function requirePermissionForAction(permission: Permission): Promise<SessionUser> {
  const user = await requireStaffForAction()
  if (!can(user.role, permission)) {
    throw new AuthError('You do not have permission to perform this action.')
  }
  return user
}

// ------------------------------------------------------------------ OTP flow

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'

/**
 * Generates a cryptographically random 6-digit code, stores only its hash and
 * returns the plaintext once so it can be emailed. Codes are never hardcoded
 * and never persisted in plaintext.
 */
export async function issueOtp(email: string, purpose: OtpPurpose, userId?: string | null) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60_000)

  // Invalidate any outstanding codes for the same purpose.
  await query(
    `UPDATE verification_codes SET consumed_at = now()
      WHERE lower(email) = lower($1) AND purpose = $2 AND consumed_at IS NULL`,
    [email, purpose],
  )

  await query(
    `INSERT INTO verification_codes (user_id, email, purpose, code_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId ?? null, email, purpose, sha256(code), expires],
  )

  return { code, expiresAt: expires }
}

export type OtpResult =
  | { ok: true; userId: string | null; email: string }
  | { ok: false; reason: 'INVALID' | 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'NOT_FOUND' }

export async function verifyOtp(
  email: string,
  purpose: OtpPurpose,
  code: string,
): Promise<OtpResult> {
  const rows = await query<{
    id: string
    user_id: string | null
    email: string
    code_hash: string
    attempts: number
    expired: boolean
  }>(
    `SELECT id, user_id, email, code_hash, attempts, (expires_at <= now()) AS expired
       FROM verification_codes
      WHERE lower(email) = lower($1) AND purpose = $2 AND consumed_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1`,
    [email, purpose],
  )

  const record = rows[0]
  if (!record) return { ok: false, reason: 'NOT_FOUND' }
  if (record.expired) return { ok: false, reason: 'EXPIRED' }
  if (record.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: 'TOO_MANY_ATTEMPTS' }

  const provided = Buffer.from(sha256(code.trim()))
  const expected = Buffer.from(record.code_hash)
  const matches = provided.length === expected.length && timingSafeEqual(provided, expected)

  if (!matches) {
    await query('UPDATE verification_codes SET attempts = attempts + 1 WHERE id = $1', [record.id])
    return { ok: false, reason: 'INVALID' }
  }

  await query('UPDATE verification_codes SET consumed_at = now() WHERE id = $1', [record.id])
  return { ok: true, userId: record.user_id, email: record.email }
}

// --------------------------------------------------------------- onboarding

/** Creates the loyalty account, notification prefs and referral code for a user. */
export async function ensureUserExtras(userId: string) {
  await query(
    'INSERT INTO loyalty_accounts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
    [userId],
  )
  await query(
    'INSERT INTO notification_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
    [userId],
  )

  const existing = await query('SELECT 1 FROM referral_codes WHERE user_id = $1', [userId])
  if (existing.length === 0) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `MANNA${randomBytes(3).toString('hex').toUpperCase()}`
      const inserted = await query(
        'INSERT INTO referral_codes (user_id, code) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING code',
        [userId, code],
      )
      if (inserted.length > 0) break
    }
  }
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 200) return 'Password is too long.'
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain a letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain a number.'
  return null
}
