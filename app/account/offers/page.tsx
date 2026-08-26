import Link from 'next/link'

import CopyCode from '@/components/account/CopyCode'
import { EmptyState, formatDate, money, SectionHeader, StatusBadge } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getAvailableOffers } from '@/lib/customer'

export const metadata = { title: 'Offers' }

export default async function OffersPage() {
  const user = await requireUser()
  const offers = await getAvailableOffers(user.id)

  return (
    <>
      <SectionHeader
        title="Offers"
        subtitle="Apply a code at checkout. Every code is validated on the server."
        action={
          <Link href="/order" className="btn-outline-gold text-xs">
            Start an order
          </Link>
        }
      />

      {offers.length === 0 ? (
        <EmptyState
          title="No offers right now"
          message="Seasonal offers and rewards you unlock will show up here."
          actionHref="/order"
          actionLabel="Browse the menu"
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => {
            const value =
              offer.discount_type === 'PERCENT'
                ? `${Number(offer.discount_value)}% off`
                : `${money(Number(offer.discount_value))} off`

            return (
              <li key={offer.id} className="glass-card flex flex-col rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-serif text-xl text-gold">{value}</p>
                  {offer.is_personal ? <StatusBadge status="ISSUED" label="Just for you" /> : null}
                </div>

                {offer.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {offer.description}
                  </p>
                ) : null}

                <ul className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
                  {Number(offer.min_order) > 0 ? (
                    <li>Minimum order {money(Number(offer.min_order))}</li>
                  ) : null}
                  {offer.max_discount ? (
                    <li>Up to {money(Number(offer.max_discount))} off</li>
                  ) : null}
                  {offer.ends_at ? <li>Valid until {formatDate(offer.ends_at)}</li> : null}
                </ul>

                <div className="mt-auto pt-5">
                  <CopyCode code={offer.code} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
