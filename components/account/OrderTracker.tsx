import { DELIVERY_TRACK, PICKUP_TRACK, STATUS_LABELS, type OrderStatus } from '@/lib/order-constants'

/**
 * Progress rail for an order. The track shown depends on the order type:
 * delivery orders go out for delivery, pickup and dine-in orders do not.
 */
export default function OrderTracker({
  status,
  orderType,
}: {
  status: OrderStatus
  orderType: string
}) {
  if (status === 'CANCELLED') {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-5 py-4">
        <p className="text-sm text-red-200">This order was cancelled.</p>
      </div>
    )
  }

  const track = orderType === 'DELIVERY' ? DELIVERY_TRACK : PICKUP_TRACK
  const currentIndex = track.indexOf(status)

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:gap-2">
      {track.map((step, index) => {
        const done = currentIndex >= 0 && index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
            {/* Rail */}
            <div className="flex items-center gap-0 sm:w-full">
              <span
                aria-hidden="true"
                className={[
                  'flex h-3 w-3 shrink-0 rounded-full transition-colors',
                  done ? 'bg-gold' : 'bg-white/15',
                  isCurrent ? 'ring-4 ring-gold/25' : '',
                ].join(' ')}
              />
              {index < track.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`hidden h-px flex-1 sm:block ${done ? 'bg-gold/50' : 'bg-white/10'}`}
                />
              ) : null}
            </div>

            <p
              className={[
                'py-2 text-xs uppercase tracking-[0.16em] sm:py-0',
                done ? 'text-beige' : 'text-muted-foreground',
              ].join(' ')}
            >
              {STATUS_LABELS[step]}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
