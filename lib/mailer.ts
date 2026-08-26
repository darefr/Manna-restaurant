import 'server-only'

import nodemailer, { type Transporter } from 'nodemailer'

import { query } from './db'
import type { EmailContent } from './email-templates'

/**
 * SMTP delivery.
 *
 * All credentials come from environment variables and stay server-side. If SMTP
 * is not configured the app keeps working: the send is recorded as SKIPPED and,
 * in development, the message is logged so flows remain testable.
 */

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER

export const isEmailConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)

let transporter: Transporter | null = null

function getTransporter() {
  if (!isEmailConfigured) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // 465 is implicit TLS; 587 upgrades via STARTTLS.
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transporter
}

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

type SendOptions = {
  to: string
  content: EmailContent
  type: string
  userId?: string | null
}

/**
 * Sends an email and records the attempt in the notifications table.
 * Never throws — a failed notification must not roll back an order.
 */
export async function sendEmail({ to, content, type, userId }: SendOptions) {
  const log = async (status: string, error?: string) => {
    await query(
      `INSERT INTO notifications (user_id, channel, type, recipient, subject, status, error, sent_at)
       VALUES ($1, 'EMAIL', $2, $3, $4, $5, $6, CASE WHEN $5 = 'SENT' THEN now() ELSE NULL END)`,
      [userId ?? null, type, to, content.subject, status, error ?? null],
    ).catch(() => {})
  }

  const mail = getTransporter()

  if (!mail) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[manna][email:skipped] to=${to} subject="${content.subject}"`)
      console.log(`[manna][email:skipped] ${content.text}`)
    }
    await log('SKIPPED', 'SMTP is not configured')
    return { sent: false as const, reason: 'SMTP_NOT_CONFIGURED' as const }
  }

  try {
    await mail.sendMail({
      from: SMTP_FROM,
      to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    })
    await log('SENT')
    return { sent: true as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error'
    console.error('[manna] email send failed', message)
    await log('FAILED', message)
    return { sent: false as const, reason: 'SEND_FAILED' as const }
  }
}

/** Records a non-email notification intent (SMS / WhatsApp) for audit. */
export async function recordNotification(
  channel: 'SMS' | 'WHATSAPP',
  type: string,
  recipient: string,
  userId?: string | null,
  status: 'QUEUED' | 'SKIPPED' = 'SKIPPED',
) {
  await query(
    `INSERT INTO notifications (user_id, channel, type, recipient, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId ?? null, channel, type, recipient, status],
  ).catch(() => {})
}
