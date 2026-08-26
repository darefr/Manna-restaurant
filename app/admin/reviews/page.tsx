import { Card, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getAdminReviews } from '@/lib/admin-data'
import ReviewModeration from '@/components/admin/ReviewModeration'

export default async function AdminReviewsPage() {
  await requirePermission('reviews.moderate')
  const reviews = await getAdminReviews()
  return <main className="space-y-6"><PageHeader title="Reviews" subtitle="Approve published reviews and keep feedback useful for future guests." /><div className="grid gap-4">{reviews.map((r) => <Card key={r.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-gold">{'★'.repeat(r.rating)}<span className="text-muted-foreground">{'★'.repeat(5-r.rating)}</span></p><h2 className="mt-2 font-serif text-lg text-beige">{r.title || 'Guest review'}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{r.body}</p><p className="mt-3 text-xs text-muted-foreground">{r.customer_name} · {r.customer_email}{r.order_reference ? ` · Order ${r.order_reference}` : ''}</p></div><StatusBadge label={r.status} /></div><ReviewModeration id={r.id} /></Card>)}{reviews.length === 0 && <Card><p className="py-10 text-center text-sm text-muted-foreground">No reviews submitted yet.</p></Card>}</div></main>
}
