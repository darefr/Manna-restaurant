/**
 * WhatsApp ordering — configuration and message builder.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  CHANGE THE OWNER'S WHATSAPP NUMBER HERE — THIS IS THE ONLY PLACE.
 *
 *  Format: country code + number, digits only, NO "+", NO spaces, NO dashes.
 *  Nepal country code is 977, so 984-4786004 becomes 9779844786004.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ORDER_WHATSAPP_NUMBER = '9779844786004'

/** Restaurant name printed in the order message header. */
const ORDER_BUSINESS_NAME = 'MANNA RESTAURANT'

export type OrderType = 'Pickup' | 'Delivery'

export type OrderLine = {
  /** Dish name exactly as it appears on the menu. */
  name: string
  /** Quantity ordered. Always a positive integer. */
  quantity: number
  /** Unit price in Nepalese Rupees, taken from the real menu. */
  price: number
}

export type OrderPayload = {
  customerName: string
  phone: string
  lines: OrderLine[]
  orderType: OrderType
  address?: string
  note?: string
  /** Order reference, once the order has been saved to the database. */
  reference?: string
  /** Server-calculated total. Takes precedence over the raw line sum. */
  total?: number
  /** Discount applied server-side, if any. */
  discount?: number
  /** Overrides the configured number (set from restaurant settings). */
  whatsappNumber?: string
}

/** Total of every line, in Nepalese Rupees. */
export function orderTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
}

/**
 * Builds the plain-text order message the restaurant owner receives.
 * Kept deliberately simple and scannable so it reads well in WhatsApp.
 */
export function buildOrderMessage(order: OrderPayload): string {
  const lines = order.lines.filter((l) => l.quantity > 0)
  // Prefer the server-calculated total so the message always matches the order
  // that was actually saved (including discounts, delivery and tax).
  const total = order.total ?? orderTotal(lines)

  const parts: string[] = []

  parts.push(`🍽️ NEW ORDER — ${ORDER_BUSINESS_NAME}`)
  parts.push('')
  if (order.reference) parts.push(`Order Ref: ${order.reference}`)
  parts.push(`Customer: ${order.customerName}`)
  parts.push(`Phone: ${order.phone}`)
  parts.push('')
  parts.push('ORDER:')

  for (const line of lines) {
    parts.push(`• ${line.name} × ${line.quantity} — Rs. ${line.price * line.quantity}`)
  }

  parts.push('')
  if (order.discount && order.discount > 0) {
    parts.push(`Subtotal: Rs. ${orderTotal(lines)}`)
    parts.push(`Discount: -Rs. ${order.discount}`)
  }
  parts.push(`Total: Rs. ${total}`)
  parts.push('')
  parts.push(`Order Type: ${order.orderType}`)

  if (order.orderType === 'Delivery' && order.address?.trim()) {
    parts.push('')
    parts.push('Delivery Address:')
    parts.push(order.address.trim())
  }

  if (order.note?.trim()) {
    parts.push('')
    parts.push('Special Request:')
    parts.push(order.note.trim())
  }

  parts.push('')
  parts.push('Please confirm this order.')

  return parts.join('\n')
}

/**
 * Returns the wa.me deep link for an order.
 *
 * wa.me works on Android, iOS and desktop: it opens the installed WhatsApp app
 * where available and falls back to WhatsApp Web in a desktop browser.
 */
export function buildWhatsAppUrl(order: OrderPayload): string {
  const text = encodeURIComponent(buildOrderMessage(order))
  // The number is configurable from Admin → Settings; the constant above is the
  // fallback used before any override has been saved.
  const number = (order.whatsappNumber || ORDER_WHATSAPP_NUMBER).replace(/\D/g, '')
  return `https://wa.me/${number}?text=${text}`
}
