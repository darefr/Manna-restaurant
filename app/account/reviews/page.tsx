import ReviewForm from '@/components/account/ReviewForm'
import { formatDate, Panel, SectionHeader, StatusBadge } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getCustomerReviews, getReviewableOrders } from '@/lib/customer'

export const metadata = { title: 'Reviews' }

export default async function ReviewsPage() {
  const user = await requireUser()

  const [reviews, reviewable] = await Promise.all([
    getCustomerReviews(user.id),
    getReviewableOrders(user.id),
  ])

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionHeader
          title="Write a review"
          subtitle={
            reviewable.length > 0
              ? 'Tell us how your recent order was.'
              : 'Reviews are published once our team approves them.'
          }
        />
        <ReviewForm orders={reviewable} />
      </div>

      <div>
        <SectionHeader title="Your reviews" />
        {reviews.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted-foreground">
              You have not written a review yet.
            </p>
          </Panel>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => (
              <li key={review.id} className="glass-card rounded-xl p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p aria-label={`${review.rating} out of 5 stars`} className="text-gold">
                      {'★'.repeat(review.rating)}
                      <span className="text-muted-foreground">{'★'.repeat(5 - review.rating)}</span>
                    </p>
                    {review.title ? (
                      <h3 className="mt-2 font-serif text-base text-beige">{review.title}</h3>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={review.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.body}</p>

                {review.order_reference ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Order {review.order_reference}
                  </p>
                ) : null}

                {review.response ? (
                  <div className="mt-4 rounded-lg border border-gold/20 bg-gold/6 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold">
                      Reply from Manna
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-beige">{review.response}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
