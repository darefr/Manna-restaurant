'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import {
  checkRateLimit,
  clientIp,
  createSession,
  destroySession,
  ensureUserExtras,
  getCurrentUser,
  isValidEmail,
  issueOtp,
  passwordProblem,
  verifyOtp,
} from '@/lib/auth'
import { ensureSchema, isDatabaseConfigured, query } from '@/lib/db'
import { passwordResetEmail, verificationEmail, welcomeEmail } from '@/lib/email-templates'
import { sendEmail, siteUrl } from '@/lib/mailer'
import { hashPassword, verifyPassword } from '@/lib/password'
import { isStaffRole } from '@/lib/rbac'

export type AuthState = {
  status: 'idle' | 'error' | 'success' | 'otp'
  message?: string
  email?: string
  fieldErrors?: Record<string, string>
}

const OTP_MINUTES = 10

function field(formData: FormData, name: string, max = 200) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function dbUnavailable(): AuthState {
  return {
    status: 'error',
    message: 'Accounts are temporarily unavailable. Please try again shortly.',
  }
}

/** Awards the referral bonus once the referred customer's account is active. */
async function attachReferral(referredUserId: string, code: string) {
  if (!code) return
  const rows = await query<{ user_id: string }>(
    'SELECT user_id FROM referral_codes WHERE upper(code) = upper($1)',
    [code],
  )
  const referrer = rows[0]?.user_id
  if (!referrer || referrer === referredUserId) return

  await query(
    `INSERT INTO referrals (referrer_user_id, referred_user_id, status)
     VALUES ($1, $2, 'PENDING') ON CONFLICT (referred_user_id) DO NOTHING`,
    [referrer, referredUserId],
  )
}

// ------------------------------------------------------------------- signup

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDatabaseConfigured) return dbUnavailable()
  await ensureSchema()

  const name = field(formData, 'name', 120)
  const email = field(formData, 'email', 160).toLowerCase()
  const password = field(formData, 'password', 200)
  const confirm = field(formData, 'confirmPassword', 200)
  const referral = field(formData, 'referral', 32)

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Please enter your full name.'
  if (!isValidEmail(email)) fieldErrors.email = 'Enter a valid email address.'

  const problem = passwordProblem(password)
  if (problem) fieldErrors.password = problem
  if (password !== confirm) fieldErrors.confirmPassword = 'Passwords do not match.'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', email, fieldErrors }
  }

  const allowed = await checkRateLimit(`signup:${await clientIp()}`, 8, 3600)
  if (!allowed) {
    return { status: 'error', message: 'Too many sign-up attempts. Please try again later.', email }
  }

  const existing = await query<{ id: string; email_verified: boolean }>(
    'SELECT id, email_verified FROM users WHERE email_lower = $1',
    [email],
  )

  if (existing.length > 0 && existing[0].email_verified) {
    return {
      status: 'error',
      message: 'An account with this email already exists. Try signing in instead.',
      email,
      fieldErrors: { email: 'This email is already registered.' },
    }
  }

  const passwordHash = await hashPassword(password)
  let userId: string

  if (existing.length > 0) {
    // Unverified account: refresh the details and re-send a code.
    userId = existing[0].id
    await query(
      'UPDATE users SET name = $2, password_hash = $3, updated_at = now() WHERE id = $1',
      [userId, name, passwordHash],
    )
  } else {
    const inserted = await query<{ id: string }>(
      `INSERT INTO users (email, name, password_hash, role, email_verified)
       VALUES ($1, $2, $3, 'CUSTOMER', FALSE) RETURNING id`,
      [email, name, passwordHash],
    )
    userId = inserted[0].id
  }

  await ensureUserExtras(userId)
  if (referral) await attachReferral(userId, referral)

  const { code } = await issueOtp(email, 'EMAIL_VERIFICATION', userId)
  const delivery = await sendEmail({
    to: email,
    content: verificationEmail(name, code, OTP_MINUTES),
    type: 'EMAIL_VERIFICATION',
    userId,
  })

  // Delivery problems must not strand a half-created account. The code is
  // already stored, so always advance to the OTP step and let the guest use
  // "Resend" once email delivery is healthy again.
  if (!delivery.sent) {
    return {
      status: 'otp',
      email,
      message:
        'Your account is ready, but we could not email the code right now. Use “Resend code” in a moment.',
    }
  }

  return { status: 'otp', email, message: 'We sent a 6-digit code to your email.' }
}

// ------------------------------------------------------------ verify e-mail

export async function verifyEmailAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDatabaseConfigured) return dbUnavailable()
  await ensureSchema()

  const email = field(formData, 'email', 160).toLowerCase()
  const code = field(formData, 'code', 6).replace(/\D/g, '')

  if (code.length !== 6) {
    return { status: 'error', email, message: 'Enter the full 6-digit code.' }
  }

  const allowed = await checkRateLimit(`verify:${email}`, 12, 900)
  if (!allowed) {
    return { status: 'error', email, message: 'Too many attempts. Please request a new code.' }
  }

  const result = await verifyOtp(email, 'EMAIL_VERIFICATION', code)

  if (!result.ok) {
    const messages: Record<string, string> = {
      INVALID: 'That code is not correct. Please check and try again.',
      EXPIRED: 'That code has expired. Request a new one.',
      TOO_MANY_ATTEMPTS: 'Too many incorrect attempts. Request a new code.',
      NOT_FOUND: 'No active code found. Request a new one.',
    }
    return { status: 'error', email, message: messages[result.reason] }
  }

  const rows = await query<{ id: string; name: string }>(
    'SELECT id, name FROM users WHERE email_lower = $1',
    [email],
  )
  const user = rows[0]
  if (!user) return { status: 'error', email, message: 'Account not found.' }

  await query(
    'UPDATE users SET email_verified = TRUE, updated_at = now() WHERE id = $1',
    [user.id],
  )
  await ensureUserExtras(user.id)
  await createSession(user.id)

  await sendEmail({
    to: email,
    content: welcomeEmail(user.name, siteUrl()),
    type: 'WELCOME',
    userId: user.id,
  })

  redirect('/account')
}

export async function resendOtpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDatabaseConfigured) return dbUnavailable()
  await ensureSchema()

  const email = field(formData, 'email', 160).toLowerCase()
  const purpose = field(formData, 'purpose', 40) === 'PASSWORD_RESET' ? 'PASSWORD_RESET' : 'EMAIL_VERIFICATION'

  if (!isValidEmail(email)) return { status: 'error', email, message: 'Enter a valid email address.' }

  const allowed = await checkRateLimit(`otp-send:${email}`, 5, 900)
  if (!allowed) {
    return { status: 'otp', email, message: 'Please wait a few minutes before requesting another code.' }
  }

  const rows = await query<{ id: string; name: string }>(
    'SELECT id, name FROM users WHERE email_lower = $1',
    [email],
  )
  const user = rows[0]

  // Do not disclose whether an account exists.
  if (user) {
    const { code } = await issueOtp(email, purpose, user.id)
    await sendEmail({
      to: email,
      content:
        purpose === 'PASSWORD_RESET'
          ? passwordResetEmail(user.name, code, OTP_MINUTES)
          : verificationEmail(user.name, code, OTP_MINUTES),
      type: purpose,
      userId: user.id,
    })
  }

  return { status: 'otp', email, message: 'A new code is on its way.' }
}

// -------------------------------------------------------------------- login

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDatabaseConfigured) return dbUnavailable()
  await ensureSchema()

  const email = field(formData, 'email', 160).toLowerCase()
  const password = field(formData, 'password', 200)
  const next = field(formData, 'next', 200)

  if (!isValidEmail(email) || !password) {
    return { status: 'error', email, message: 'Enter your email and password.' }
  }

  const allowed = await checkRateLimit(`login:${email}:${await clientIp()}`, 10, 900)
  if (!allowed) {
    return { status: 'error', email, message: 'Too many sign-in attempts. Please try again in a few minutes.' }
  }

  const rows = await query<{
    id: string
    name: string
    password_hash: string | null
    email_verified: boolean
    is_active: boolean
    role: string
  }>(
    'SELECT id, name, password_hash, email_verified, is_active, role FROM users WHERE email_lower = $1',
    [email],
  )

  const user = rows[0]
  const valid = user ? await verifyPassword(password, user.password_hash) : false

  if (!user || !valid) {
    return { status: 'error', email, message: 'Email or password is incorrect.' }
  }
  if (!user.is_active) {
    return { status: 'error', email, message: 'This account has been deactivated. Please contact the restaurant.' }
  }

  if (!user.email_verified) {
    const { code } = await issueOtp(email, 'EMAIL_VERIFICATION', user.id)
    const delivery = await sendEmail({
      to: email,
      content: verificationEmail(user.name, code, OTP_MINUTES),
      type: 'EMAIL_VERIFICATION',
      userId: user.id,
    })
    return {
      status: 'otp',
      email,
      message: delivery.sent
        ? 'Please verify your email. We sent you a new code.'
        : 'Please verify your email. We could not send the code just now — try “Resend code”.',
    }
  }

  await ensureUserExtras(user.id)
  await createSession(user.id)

  const target = next && next.startsWith('/') ? next : isStaffRole(user.role) ? '/admin' : '/account'
  redirect(target)
}

export async function signOutAction() {
  await destroySession()
  redirect('/')
}

// ----------------------------------------------------------- password reset

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isDatabaseConfigured) return dbUnavailable()
  await ensureSchema()

  const email = field(formData, 'email', 160).toLowerCase()
  if (!isValidEmail(email)) {
    return { status: 'error', email, message: 'Enter a valid email address.' }
  }

  const allowed = await checkRateLimit(`reset:${email}`, 5, 900)
  if (!allowed) {
    return { status: 'otp', email, message: 'If that email is registered, a code is on its way.' }
  }

  const rows = await query<{ id: string; name: string }>(
    'SELECT id, name FROM users WHERE email_lower = $1',
    [email],
  )
  const user = rows[0]

  if (user) {
    const { code } = await issueOtp(email, 'PASSWORD_RESET', user.id)
    await sendEmail({
      to: email,
      content: passwordResetEmail(user.name, code, OTP_MINUTES),
      type: 'PASSWORD_RESET',
      userId: user.id,
    })
  }

  // Same response either way — never reveals whether an account exists.
  return { status: 'otp', email, message: 'If that email is registered, a code is on its way.' }
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isDatabaseConfigured) return dbUnavailable()
  await ensureSchema()

  const email = field(formData, 'email', 160).toLowerCase()
  const code = field(formData, 'code', 6).replace(/\D/g, '')
  const password = field(formData, 'password', 200)
  const confirm = field(formData, 'confirmPassword', 200)

  const fieldErrors: Record<string, string> = {}
  const problem = passwordProblem(password)
  if (problem) fieldErrors.password = problem
  if (password !== confirm) fieldErrors.confirmPassword = 'Passwords do not match.'
  if (code.length !== 6) fieldErrors.code = 'Enter the full 6-digit code.'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', email, message: 'Please fix the highlighted fields.', fieldErrors }
  }

  const allowed = await checkRateLimit(`reset-verify:${email}`, 12, 900)
  if (!allowed) {
    return { status: 'error', email, message: 'Too many attempts. Please request a new code.' }
  }

  const result = await verifyOtp(email, 'PASSWORD_RESET', code)
  if (!result.ok) {
    const messages: Record<string, string> = {
      INVALID: 'That code is not correct.',
      EXPIRED: 'That code has expired. Request a new one.',
      TOO_MANY_ATTEMPTS: 'Too many incorrect attempts. Request a new code.',
      NOT_FOUND: 'No active code found. Request a new one.',
    }
    return { status: 'error', email, message: messages[result.reason] }
  }

  const rows = await query<{ id: string }>('SELECT id FROM users WHERE email_lower = $1', [email])
  const user = rows[0]
  if (!user) return { status: 'error', email, message: 'Account not found.' }

  const passwordHash = await hashPassword(password)
  await query(
    'UPDATE users SET password_hash = $2, email_verified = TRUE, updated_at = now() WHERE id = $1',
    [user.id, passwordHash],
  )
  // Invalidate every existing session after a password change.
  await query('DELETE FROM sessions WHERE user_id = $1', [user.id])

  return { status: 'success', email, message: 'Password updated. You can now sign in.' }
}

// ------------------------------------------------------------------ profile

export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser()
  if (!user) return { status: 'error', message: 'You must be signed in.' }

  const name = field(formData, 'name', 120)
  const phone = field(formData, 'phone', 40)
  const birthday = field(formData, 'birthday', 20)
  const anniversary = field(formData, 'anniversary', 20)

  if (name.length < 2) {
    return { status: 'error', message: 'Please enter your full name.', fieldErrors: { name: 'Required.' } }
  }

  await query(
    `UPDATE users SET name = $2, phone = $3,
            birthday = NULLIF($4,'')::date, anniversary = NULLIF($5,'')::date,
            updated_at = now()
      WHERE id = $1`,
    [user.id, name, phone || null, birthday, anniversary],
  )

  revalidatePath('/account')
  revalidatePath('/account/settings')
  return { status: 'success', message: 'Profile updated.' }
}

export async function changePasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser()
  if (!user) return { status: 'error', message: 'You must be signed in.' }

  const current = field(formData, 'currentPassword', 200)
  const next = field(formData, 'newPassword', 200)
  const confirm = field(formData, 'confirmPassword', 200)

  const rows = await query<{ password_hash: string | null }>(
    'SELECT password_hash FROM users WHERE id = $1',
    [user.id],
  )
  const hash = rows[0]?.password_hash

  // Google-only accounts can set a password without providing an old one.
  if (hash) {
    const ok = await verifyPassword(current, hash)
    if (!ok) {
      return { status: 'error', message: 'Your current password is incorrect.', fieldErrors: { currentPassword: 'Incorrect.' } }
    }
  }

  const problem = passwordProblem(next)
  if (problem) return { status: 'error', message: problem, fieldErrors: { newPassword: problem } }
  if (next !== confirm) {
    return { status: 'error', message: 'Passwords do not match.', fieldErrors: { confirmPassword: 'Passwords do not match.' } }
  }

  await query('UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1', [
    user.id,
    await hashPassword(next),
  ])

  return { status: 'success', message: 'Password changed.' }
}
