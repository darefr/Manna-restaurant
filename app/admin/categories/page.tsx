import CategoryManager, { type AdminCategoryRow } from '@/components/admin/CategoryManager'
import { PageHeader } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  await requirePermission('menu.manage')

  const rows = await query<{
    id: string
    label: string
    description: string | null
    item_count: string
  }>(
    `SELECT c.id, c.label, c.description, count(i.id)::text AS item_count
       FROM menu_categories c
       LEFT JOIN menu_items i ON i.category_id = c.id AND i.is_active
      GROUP BY c.id
      ORDER BY c.position, c.label`,
  )

  const categories: AdminCategoryRow[] = rows.map((row) => ({
    id: row.id,
    label: row.label,
    description: row.description ?? '',
    itemCount: Number(row.item_count),
  }))

  return (
    <main className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organise the menu into clear kitchen and guest-facing sections."
      />
      <CategoryManager categories={categories} />
    </main>
  )
}
