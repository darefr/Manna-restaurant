export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED', 'FAILED'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const ORDER_TYPES = ['DELIVERY', 'PICKUP', 'DINE_IN'] as const
export type OrderType = (typeof ORDER_TYPES)[number]

/** Statuses an order may move to next. Guards against illegal transitions. */
export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

/** Progress tracks shown to the customer, per order type. */
export const DELIVERY_TRACK: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

export const PICKUP_TRACK: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED']

export function trackFor(orderType: string): OrderStatus[] {
  return orderType === 'DELIVERY' ? DELIVERY_TRACK : PICKUP_TRACK
}

export const MAX_QTY_PER_ITEM = 20
export const MAX_TOTAL_ITEMS = 100
