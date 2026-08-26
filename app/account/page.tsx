import Image from 'next/image'
import Link from 'next/link'

import ReorderButton from '@/components/account/ReorderButton'
import { EmptyState, money, Panel, SectionHeader, Stat, StatusBadge, formatDate } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import {
  getActiveOrder,
  getAvailableOffers,
  getCustomerOrders,
  getCustomerStats,
  getLoyalty,
  getProfile,
  tierFor,
} from '@/lib/customer'
import { getFavoriteItems, getRecommendations } from '@/lib/menu-data'
import { STATUS_LABELS } from '@/lib/orders'
import { getUpcomingReservation } from '@/lib/reservations'

export default async function AccountOverviewPage() {
  const user = await requireUser()

  // Everything on this page is real data, loaded in parallel.
  const [profile, loyalty, stats, activeOrder, orders, reservation, favorites, recommendations, offers] =
    await Promise.all([
      getProfile(user.id),
      getLoyalty(user.id),
      getCustomerStats(user.id),
      getActiveOrder(user.id),
      getCustomerOrders(user.id, 3),
      getUpcomingReservation(user.id),
      getFavoriteItems(user.id),
      getRecommendations(user.id, 3),
      getAvailableOffers(user.id),
    ])

  const tier = tierFor(loyalty.lifetimePoints)
  const lastOrder = orders[0] ?? null

  return (
    <div className="flex flex-col gap-12">
      {/* ------------------------------------------------ verification notice */}
      {profile && !profile.emailVerified ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-500/25 bg-amber-500/8 px-5 py-4">
          <p className="text-sm text-amber-200">
            Your email address is not verified yet. Verify it to secure your account.
          </p>
          <Link
            href={`/verify-email?email=${encodeURIComponent(user.email)}`}
            className="btn-outline-gold text-xs"
          >
            Verify email
          </Link>
        </div>
      ) : null}

      {/* ------------------------------------------------------------- stats */}
      <section aria-labelledby="snapshot">
        <h2 id="snapshot" className="sr-only">
          Account snapshot
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Points" value={loyalty.points} hint="Available to redeem" />
          <Stat label="Tier" value={tier.current.name} hint={tier.next ? `${tier.toNext} to ${tier.next.name}` : 'Top tier'} />
          <Stat label="Orders" value={stats.orderCount} hint={money(stats.totalSpent)} />
          <Stat label="Offers" value={offers.length} hint="Available now" />
        </div>
      </section>

      {/* ----------------------------------------------------- live order */}
      {activeOrder ? (
        <section aria-labelledby="live-order">
          <SectionHeader
            title="Order in progress"
            subtitle={`Reference ${activeOrder.reference}`}
            action={
              <Link href={`/account/orders/${activeOrder.reference}`} className="btn-outline-gold text-xs">
                Track order
              </Link>
            }
          />
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <StatusBadge status={activeOrder.status} label={STATUS_LABELS[activeOrder.status]} />
                <p className="mt-3 text-sm text-muted-foreground">
                  {activeOrder.itemCount} {activeOrder.itemCount === 1 ? 'item' : 'items'} ·{' '}
                  {activeOrder.orderType.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
              <p className="font-serif text-2xl text-gold">{money(activeOrder.total)}</p>
            </div>
          </Panel>
        </section>
      ) : null}

      {/* ------------------------------------------- reservation + last order */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 font-serif text-lg text-beige">Next reservation</h3>
          {reservation ? (
            <Panel>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl text-beige">
                    {formatDate(reservation.date)} · {reservation.time}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                    {reservation.tableName ? ` · Table ${reservation.tableName}` : ''}
                  </p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
              <Link
                href="/account/reservations"
                className="mt-5 inline-block text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light"
              >
                Manage booking
              </Link>
            </Panel>
          ) : (
            <EmptyState
              title="No upcoming table"
              message="Reserve a table and it will appear here."
              actionHref="/reservations"
              actionLabel="Book a table"
            />
          )}
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg text-beige">Recent order</h3>
          {lastOrder ? (
            <Panel>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl text-beige">{lastOrder.reference}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {formatDate(lastOrder.createdAt)} · {money(lastOrder.total)}
                  </p>
                </div>
                <StatusBadge status={lastOrder.status} label={STATUS_LABELS[lastOrder.status]} />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <ReorderButton orderId={lastOrder.id} />
                <Link
                  href={`/account/orders/${lastOrder.reference}`}
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-beige"
                >
                  View details
                </Link>
              </div>
            </Panel>
          ) : (
            <EmptyState
              title="No orders yet"
              message="Your order history will appear here after your first order."
              actionHref="/order"
              actionLabel="Start an order"
            />
          )}
        </div>
      </section>

      {/* --------------------------------------------------- recommendations */}
      {recommendations.length > 0 ? (
        <section aria-labelledby="for-you">
          <SectionHeader
            title="Picked for you"
            subtitle="Based on what you have ordered before."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <article key={item.id} className="glass-card overflow-hidden rounded-xl">
                {item.imageUrl ? (
                  <div className="relative aspect-4/3">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <h4 className="font-serif text-base text-beige">{item.name}</h4>
                  <p className="mt-2 text-sm text-gold">{money(item.price)}</p>
                </div>
              </article>
            ))}
          </div>
          <Link
            href="/order"
            className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light"
          >
            Order these
          </Link>
        </section>
      ) : null}

      {/* --------------------------------------------------------- favourites */}
      {favorites.length > 0 ? (
        <section aria-labelledby="favourites">
          <SectionHeader
            title="Your favourites"
            action={
              <Link href="/account/favorites" className="text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light">
                See all
              </Link>
            }
          />
          <ul className="flex flex-wrap gap-3">
            {favorites.slice(0, 6).map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-gold/20 bg-gold/8 px-4 py-2 text-sm text-beige"
              >
                {item.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ offers */}
      {offers.length > 0 ? (
        <section aria-labelledby="offers">
          <SectionHeader
            title="Offers for you"
            action={
              <Link href="/account/offers" className="text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light">
                See all
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {offers.slice(0, 2).map((offer) => (
              <Panel key={offer.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm tracking-widest text-gold">{offer.code}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {offer.description ?? 'Apply this code at checkout.'}
                    </p>
                  </div>
                  {offer.is_personal ? <StatusBadge status="ISSUED" label="Yours" /> : null}
                </div>
              </Panel>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
