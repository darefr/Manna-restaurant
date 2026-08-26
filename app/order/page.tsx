import type { Metadata } from 'next'

import PageHero from '@/components/PageHero'
import PageShell from '@/components/PageShell'
import OrderExperience from '@/components/order/OrderExperience'
import WhatsAppOrderForm from '@/components/WhatsAppOrderForm'
import { getCurrentUser } from '@/lib/auth'
import { isDatabaseConfigured, query } from '@/lib/db'
import { getFavoriteIds, getPublicMenu } from '@/lib/menu-data'
import { images, restaurant } from '@/lib/restaurant'

export const metadata: Metadata = {
  title: 'Order Online',
  description:
    'Order online from Manna Restaurant and Tandoori in Devchuli. Build your order from our real menu, choose pickup or home delivery, and track it from your account.',
  alternates: { canonical: '/order' },
}

export const dynamic = 'force-dynamic'

export default async function OrderPage() {
  const [menu, user] = await Promise.all([getPublicMenu(), getCurrentUser()])

  const categories = menu.map((category) => ({
    id: category.id,
    slug: category.slug,
    label: category.label,
    items: category.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      tag: item.tag,
      isAvailable: item.isAvailable,
    })),
  }))

  let favorites: string[] = []
  let addresses: Array<{
    id: string
    label: string
    line1: string
    line2: string | null
    city: string | null
    isDefault: boolean
  }> = []
  let pointsBalance = 0

  if (user && isDatabaseConfigured) {
    favorites = await getFavoriteIds(user.id)

    const addressRows = await query<{
      id: string
      label: string
      line1: string
      line2: string | null
      city: string | null
      is_default: boolean
    }>(
      `SELECT id, label, line1, line2, city, is_default
         FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at`,
      [user.id],
    )
    addresses = addressRows.map((row) => ({
      id: row.id,
      label: row.label,
      line1: row.line1,
      line2: row.line2,
      city: row.city,
      isDefault: row.is_default,
    }))

    const loyalty = await query<{ points_balance: number }>(
      'SELECT points_balance FROM loyalty_accounts WHERE user_id = $1',
      [user.id],
    )
    pointsBalance = loyalty[0]?.points_balance ?? 0
  }

  // Without a database the original WhatsApp-only flow remains fully usable.
  const canOrderOnline = isDatabaseConfigured && categories.length > 0

  return (
    <PageShell>
      <PageHero
        overline="Pickup & Home Delivery"
        title="Order Now"
        description="Build your order from our real menu, choose pickup or delivery around Devchuli, and send it straight to our kitchen. We reply to confirm every order."
        image={images.jholMomo}
        imageAlt={`Jhol momo served at ${restaurant.name}`}
      />

      {canOrderOnline ? (
        <OrderExperience
          categories={categories}
          favorites={favorites}
          signedIn={Boolean(user)}
          customer={user ? { name: user.name, email: user.email, phone: user.phone } : null}
          addresses={addresses}
          pointsBalance={pointsBalance}
        />
      ) : (
        <WhatsAppOrderForm />
      )}
    </PageShell>
  )
}
