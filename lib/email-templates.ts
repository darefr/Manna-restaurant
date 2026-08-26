import { restaurant } from './restaurant'

/**
 * Responsive transactional email templates.
 * Table-based layout with inline styles for maximum client compatibility.
 */

const GOLD = '#c9a84c'
const INK = '#0b0b0b'
const PAPER = '#f5f0e8'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type ShellOptions = {
  preheader: string
  heading: string
  body: string
}

function shell({ preheader, heading, body }: ShellOptions) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${INK};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border:1px solid rgba(201,168,76,0.22);border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:28px 32px 20px;border-bottom:1px solid rgba(201,168,76,0.18);text-align:center;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};">${escapeHtml(restaurant.shortName)}</div>
          <div style="font-size:19px;color:${PAPER};margin-top:6px;font-weight:600;">${escapeHtml(restaurant.name)}</div>
          <div style="font-size:12px;color:#8a8070;margin-top:4px;">${escapeHtml(restaurant.subtitle)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 32px;">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${PAPER};font-weight:600;">${escapeHtml(heading)}</h1>
          ${body}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 28px;border-top:1px solid rgba(201,168,76,0.15);color:#6f6a60;font-size:12px;line-height:1.6;">
          ${escapeHtml(restaurant.address.line1)}, ${escapeHtml(restaurant.address.line2)}<br>
          ${escapeHtml(restaurant.phones.reception.display)}
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

const p = (text: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#cfc8ba;">${text}</p>`

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background:${GOLD};border-radius:8px;">
   <a href="${href}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:600;color:${INK};text-decoration:none;">${escapeHtml(label)}</a>
   </td></tr></table>`

const codeBlock = (code: string) =>
  `<div style="margin:22px 0;padding:18px;text-align:center;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.3);border-radius:10px;">
     <div style="font-size:34px;letter-spacing:10px;font-weight:700;color:${GOLD};font-family:'Courier New',monospace;">${escapeHtml(code)}</div>
   </div>`

export type EmailContent = { subject: string; html: string; text: string }

export function verificationEmail(name: string, code: string, minutes: number): EmailContent {
  return {
    subject: `${code} is your Manna verification code`,
    text: `Welcome to ${restaurant.name}. Your verification code is ${code}. It expires in ${minutes} minutes.`,
    html: shell({
      preheader: `Your verification code is ${code}`,
      heading: `Welcome, ${name || 'guest'}`,
      body:
        p('Use the code below to verify your email address and activate your account.') +
        codeBlock(code) +
        p(`This code expires in <strong style="color:${PAPER};">${minutes} minutes</strong>. If you did not create an account, you can safely ignore this email.`),
    }),
  }
}

export function passwordResetEmail(name: string, code: string, minutes: number): EmailContent {
  return {
    subject: `${code} is your Manna password reset code`,
    text: `Your password reset code is ${code}. It expires in ${minutes} minutes.`,
    html: shell({
      preheader: `Your password reset code is ${code}`,
      heading: 'Reset your password',
      body:
        p(`Hi ${escapeHtml(name || 'there')}, use the code below to choose a new password.`) +
        codeBlock(code) +
        p(`This code expires in <strong style="color:${PAPER};">${minutes} minutes</strong>. If you did not request this, no action is needed — your password stays unchanged.`),
    }),
  }
}

export function welcomeEmail(name: string, siteUrl: string): EmailContent {
  return {
    subject: `Welcome to ${restaurant.name}`,
    text: `Welcome to ${restaurant.name}, ${name}. Your account is now active.`,
    html: shell({
      preheader: 'Your account is now active.',
      heading: `You're all set, ${escapeHtml(name || 'guest')}`,
      body:
        p('Your account is verified and ready. You can now order online, book a table, save your favourite dishes and earn loyalty points on every order.') +
        button(`${siteUrl}/account`, 'Open your account') +
        p('See you soon at Devchuli-13, Daldale.'),
    }),
  }
}

type OrderLine = { name: string; quantity: number; lineTotal: number }

export function orderConfirmationEmail(
  name: string,
  reference: string,
  items: OrderLine[],
  total: number,
  orderType: string,
  siteUrl: string,
): EmailContent {
  const rows = items
    .map(
      (item) =>
        `<tr>
           <td style="padding:8px 0;font-size:14px;color:#cfc8ba;">${escapeHtml(item.name)} <span style="color:#8a8070;">× ${item.quantity}</span></td>
           <td align="right" style="padding:8px 0;font-size:14px;color:${PAPER};white-space:nowrap;">Rs. ${item.lineTotal}</td>
         </tr>`,
    )
    .join('')

  return {
    subject: `Order ${reference} confirmed — ${restaurant.shortName}`,
    text: `Thank you ${name}. Order ${reference} received. Total Rs. ${total}.`,
    html: shell({
      preheader: `Order ${reference} received — total Rs. ${total}`,
      heading: 'We have your order',
      body:
        p(`Thank you, ${escapeHtml(name)}. Your order <strong style="color:${GOLD};">${escapeHtml(reference)}</strong> has been received and is awaiting confirmation from our kitchen.`) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border-top:1px solid rgba(201,168,76,0.18);border-bottom:1px solid rgba(201,168,76,0.18);">
           ${rows}
         </table>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
           <tr>
             <td style="font-size:15px;font-weight:600;color:${PAPER};">Total (${escapeHtml(orderType)})</td>
             <td align="right" style="font-size:18px;font-weight:700;color:${GOLD};">Rs. ${total}</td>
           </tr>
         </table>` +
        button(`${siteUrl}/account/orders`, 'Track your order'),
    }),
  }
}

export function orderStatusEmail(
  name: string,
  reference: string,
  status: string,
  siteUrl: string,
): EmailContent {
  const messages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed and sent to the kitchen.',
    PREPARING: 'Our kitchen has started preparing your order.',
    READY: 'Your order is ready.',
    OUT_FOR_DELIVERY: 'Your order is on its way to you.',
    DELIVERED: 'Your order has been delivered. Enjoy your meal.',
    COMPLETED: 'Your order is complete. Thank you for dining with us.',
    CANCELLED: 'Your order has been cancelled. Please contact us if this was unexpected.',
  }

  return {
    subject: `Order ${reference} — ${status.replace(/_/g, ' ').toLowerCase()}`,
    text: `${messages[status] ?? `Order ${reference} status: ${status}`}`,
    html: shell({
      preheader: messages[status] ?? `Order ${reference} updated`,
      heading: status.replace(/_/g, ' '),
      body:
        p(`Hi ${escapeHtml(name)},`) +
        p(messages[status] ?? `Your order status is now <strong>${escapeHtml(status)}</strong>.`) +
        p(`Reference: <strong style="color:${GOLD};">${escapeHtml(reference)}</strong>`) +
        button(`${siteUrl}/account/orders`, 'View order'),
    }),
  }
}

export function reservationConfirmationEmail(
  name: string,
  reference: string,
  date: string,
  time: string,
  guests: number,
  status: string,
): EmailContent {
  return {
    subject: `Table ${status.toLowerCase()} — ${date} at ${time}`,
    text: `${name}, your reservation ${reference} for ${guests} on ${date} at ${time} is ${status}.`,
    html: shell({
      preheader: `${date} at ${time} for ${guests} guests`,
      heading: status === 'cancelled' ? 'Reservation cancelled' : 'Your table is booked',
      body:
        p(`Hi ${escapeHtml(name)},`) +
        p(
          status === 'cancelled'
            ? 'Your reservation has been cancelled.'
            : 'We are looking forward to hosting you. Here are your booking details.',
        ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;padding:16px;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.2);border-radius:10px;">
           <tr><td style="font-size:13px;color:#8a8070;padding:4px 0;">Reference</td><td align="right" style="font-size:13px;color:${GOLD};">${escapeHtml(reference)}</td></tr>
           <tr><td style="font-size:13px;color:#8a8070;padding:4px 0;">Date</td><td align="right" style="font-size:13px;color:${PAPER};">${escapeHtml(date)}</td></tr>
           <tr><td style="font-size:13px;color:#8a8070;padding:4px 0;">Time</td><td align="right" style="font-size:13px;color:${PAPER};">${escapeHtml(time)}</td></tr>
           <tr><td style="font-size:13px;color:#8a8070;padding:4px 0;">Guests</td><td align="right" style="font-size:13px;color:${PAPER};">${guests}</td></tr>
           <tr><td style="font-size:13px;color:#8a8070;padding:4px 0;">Status</td><td align="right" style="font-size:13px;color:${PAPER};text-transform:capitalize;">${escapeHtml(status)}</td></tr>
         </table>` +
        p(`Need to change something? Call us on ${escapeHtml(restaurant.phones.reception.display)}.`),
    }),
  }
}

export function loyaltyRewardEmail(name: string, reward: string, code: string): EmailContent {
  return {
    subject: `Your reward is ready — ${reward}`,
    text: `${name}, you redeemed ${reward}. Show code ${code} at the restaurant.`,
    html: shell({
      preheader: `Redemption code ${code}`,
      heading: 'Reward unlocked',
      body:
        p(`Nice work, ${escapeHtml(name)}. You redeemed <strong style="color:${PAPER};">${escapeHtml(reward)}</strong>.`) +
        codeBlock(code) +
        p('Show this code to our team when you order to claim your reward.'),
    }),
  }
}

export function reviewRequestEmail(name: string, reference: string, siteUrl: string): EmailContent {
  return {
    subject: 'How was your meal?',
    text: `${name}, tell us how order ${reference} was.`,
    html: shell({
      preheader: 'Share your experience with us',
      heading: 'How was your meal?',
      body:
        p(`Hi ${escapeHtml(name)}, thank you for ordering with us. If you have a moment, we would love to hear how order ${escapeHtml(reference)} went.`) +
        button(`${siteUrl}/account/reviews`, 'Leave a review'),
    }),
  }
}

export function campaignEmail(subject: string, bodyText: string, siteUrl: string): EmailContent {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((chunk) => p(escapeHtml(chunk).replace(/\n/g, '<br>')))
    .join('')

  return {
    subject,
    text: bodyText,
    html: shell({
      preheader: subject,
      heading: subject,
      body: paragraphs + button(`${siteUrl}/menu`, 'View the menu'),
    }),
  }
}
