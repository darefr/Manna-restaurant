import FavoritesGrid from '@/components/account/FavoritesGrid'
import { EmptyState, SectionHeader } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getFavoriteItems } from '@/lib/menu-data'

export const metadata = { title: 'Favourites' }

export default async function FavoritesPage() {
  const user = await requireUser()
  const items = await getFavoriteItems(user.id)

  return (
    <>
      <SectionHeader
        title="Favourites"
        subtitle={items.length ? `${items.length} saved` : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          message="Tap the heart on any dish while ordering and it will be waiting for you here."
          actionHref="/order"
          actionLabel="Browse the menu"
        />
      ) : (
        <FavoritesGrid items={items} />
      )}
    </>
  )
}
