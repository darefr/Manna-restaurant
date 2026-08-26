import CopyCode from '@/components/account/CopyCode'
import { formatDate, Panel, SectionHeader, Stat, StatusBadge } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getReferralSummary } from '@/lib/customer'
import { siteUrl } from '@/lib/mailer'

export const metadata = { title: 'Referrals' }

export default async function ReferralsPage() {
  const user = await requireUser()
  const referral = await getReferralSummary(user.id)

  const link = referral.code ? `${siteUrl()}/signup?ref=${referral.code}` : null

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        title="Refer a friend"
        subtitle="They get a welcome reward, you earn points when their first order is completed."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Invited" value={referral.total} />
        <Stat label="Rewarded" value={referral.rewarded} />
        <Stat label="Pending" value={referral.total - referral.rewarded} />
      </div>

      {referral.code ? (
        <Panel className="flex flex-col gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your code</p>
            <div className="mt-2">
              <CopyCode code={referral.code} label="referral code" />
            </div>
          </div>

          {link ? (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Your invite link
              </p>
              <div className="mt-2">
                <CopyCode code={link} label="referral link" />
              </div>
            </div>
          ) : null}
        </Panel>
      ) : (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Your referral code is being generated. Refresh in a moment.
          </p>
        </Panel>
      )}

      <section aria-labelledby="invited">
        <h3 id="invited" className="mb-5 font-serif text-lg text-beige">
          Friends you invited
        </h3>
        {referral.invited.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted-foreground">
              No one has signed up with your code yet.
            </p>
          </Panel>
        ) : (
          <ul className="flex flex-col gap-3">
            {referral.invited.map((entry, index) => (
              <li
                key={`${entry.name}-${index}`}
                className="glass-card flex items-center justify-between gap-4 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="text-sm text-beige">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(entry.created_at)}
                  </p>
                </div>
                <StatusBadge status={entry.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
