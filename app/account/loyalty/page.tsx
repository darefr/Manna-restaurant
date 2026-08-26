import RedeemButton from '@/components/account/RedeemButton'
import { formatDate, Panel, SectionHeader, Stat, StatusBadge } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import {
  getLoyalty,
  getLoyaltyHistory,
  getRedemptions,
  getRewards,
  TIERS,
  tierFor,
} from '@/lib/customer'

export const metadata = { title: 'Loyalty' }

export default async function LoyaltyPage() {
  const user = await requireUser()

  const [loyalty, history, rewards, redemptions] = await Promise.all([
    getLoyalty(user.id),
    getLoyaltyHistory(user.id),
    getRewards(),
    getRedemptions(user.id),
  ])

  const tier = tierFor(loyalty.lifetimePoints)

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionHeader title="Loyalty" subtitle="Earn a point for every Rs. 100 you spend." />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Stat label="Available" value={loyalty.points} hint="Points to spend" />
          <Stat label="Lifetime" value={loyalty.lifetimePoints} hint="Points earned" />
          <Stat label="Tier" value={tier.current.name} hint={tier.current.perks} />
        </div>
      </div>

      {/* ------------------------------------------------------------ tiers */}
      <section aria-labelledby="tier-progress">
        <h3 id="tier-progress" className="mb-5 font-serif text-lg text-beige">
          Your tier
        </h3>
        <Panel>
          <div className="flex items-end justify-between gap-4">
            <p className="font-serif text-2xl text-gold">{tier.current.name}</p>
            {tier.next ? (
              <p className="text-sm text-muted-foreground">
                {tier.toNext} points to {tier.next.name}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Highest tier reached</p>
            )}
          </div>

          <div
            role="progressbar"
            aria-valuenow={tier.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress to ${tier.next?.name ?? 'top tier'}`}
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/8"
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-gold-dark to-gold-light transition-all"
              style={{ width: `${tier.progress}%` }}
            />
          </div>

          <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
            {TIERS.map((t) => (
              <li key={t.name} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className={t.name === tier.current.name ? 'text-gold' : 'text-beige'}>
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.perks}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{t.min} pts</p>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      {/* ---------------------------------------------------------- rewards */}
      <section aria-labelledby="rewards">
        <SectionHeader title="Rewards" subtitle="Redeem your points for something good." />
        <ul className="grid gap-4 sm:grid-cols-2">
          {rewards.map((reward) => {
            const affordable = loyalty.points >= reward.points_cost
            return (
              <li key={reward.id} className="glass-card flex flex-col rounded-xl p-5">
                <h4 className="font-serif text-base text-beige">{reward.name}</h4>
                {reward.description ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">{reward.description}</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                  <p className="text-sm text-gold">{reward.points_cost} pts</p>
                  <RedeemButton rewardId={reward.id} disabled={!affordable} />
                </div>
                {!affordable ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {reward.points_cost - loyalty.points} more points needed
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------ redemptions */}
      {redemptions.length > 0 ? (
        <section aria-labelledby="redeemed">
          <SectionHeader title="Redeemed" subtitle="Show the code at the restaurant." />
          <ul className="flex flex-col gap-3">
            {redemptions.map((r) => (
              <li
                key={r.id}
                className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="text-sm text-beige">{r.reward_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(r.created_at)} · {r.points_spent} pts
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="rounded-md border border-gold/25 bg-gold/8 px-3 py-1.5 font-mono text-sm text-gold">
                    {r.code}
                  </code>
                  <StatusBadge status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- history */}
      <section aria-labelledby="points-history">
        <SectionHeader title="Points history" />
        {history.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted-foreground">
              No points activity yet. Points are credited when an order is completed.
            </p>
          </Panel>
        ) : (
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-105 text-sm">
              <caption className="sr-only">Loyalty points history</caption>
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th scope="col" className="pb-3 font-normal">Date</th>
                  <th scope="col" className="pb-3 font-normal">Activity</th>
                  <th scope="col" className="pb-3 text-right font-normal">Points</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-t border-border">
                    <td className="py-3 pr-3 text-muted-foreground">{formatDate(entry.created_at)}</td>
                    <td className="py-3 pr-3 text-beige">
                      {entry.description ?? entry.type}
                      {entry.order_reference ? (
                        <span className="block text-xs text-muted-foreground">
                          {entry.order_reference}
                        </span>
                      ) : null}
                    </td>
                    <td
                      className={`py-3 text-right ${entry.points >= 0 ? 'text-emerald-300' : 'text-red-300'}`}
                    >
                      {entry.points >= 0 ? '+' : ''}
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </section>
    </div>
  )
}
