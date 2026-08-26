import CategoryManager from '@/components/admin/CategoryManager'
import MenuManager, {
  type AdminCategory,
  type AdminMenuItem,
} from '@/components/admin/MenuManager'
import { PageHeader } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminMenuPage() {
  await requirePermission('menu.manage')

  const [itemRows, categoryRows] = await Promise.all([
    query<{
      id: string
      category_id: string
      category_slug: string
      category_label: string
      name: string
      description: string | null
      price: string
      image_url: string | null
      tag: string | null
      is_featured: boolean
      is_available: boolean
      available_from: string | null
      available_to: string | null
    }>(
      `SELECT i.id, i.category_id, c.slug AS category_slug, c.label AS category_label,
              i.name, i.description, i.price::text, i.image_url, i.tag,
              i.is_featured, i.is_available,
              i.available_from::text, i.available_to::text
         FROM menu_items i
         JOIN menu_categories c ON c.id = i.category_id
        WHERE i.is_active
        ORDER BY c.position, i.position, i.name`,
    ),
    query<{ id: string; label: string; slug: string; description: string | null; items: string }>(
      `SELECT c.id, c.label, c.slug, c.description,
              (SELECT count(*) FROM menu_items i
                WHERE i.category_id = c.id AND i.is_active)::text AS items
         FROM menu_categories c
        WHERE c.is_active
        ORDER BY c.position, c.label`,
    ),
  ])

  const items: AdminMenuItem[] = itemRows.map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryLabel: row.category_label,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    imageUrl: row.image_url,
    tag: row.tag,
    isFeatured: row.is_featured,
    isAvailable: row.is_available,
    availableFrom: row.available_from,
    availableTo: row.available_to,
  }))

  const categories: AdminCategory[] = categoryRows.map((row) => ({
    id: row.id,
    label: row.label,
    slug: row.slug,
  }))

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Menu"
        subtitle="Dishes, prices, seasonal windows and stock status. Changes appear on the public menu immediately."
      />

      <CategoryManager
        categories={categoryRows.map((row) => ({
          id: row.id,
          label: row.label,
          description: row.description ?? '',
          itemCount: Number(row.items),
        }))}
      />

      <MenuManager items={items} categories={categories} />
    </div>
  )
}
