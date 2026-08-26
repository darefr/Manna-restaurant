/**
 * Applies the database schema and seeds the initial data.
 *
 * Safe to re-run: every statement in SCHEMA_STATEMENTS is written with
 * IF NOT EXISTS / ON CONFLICT semantics, and the seed helpers upsert rather
 * than truncate, so existing orders, customers and menu edits are preserved.
 *
 *   pnpm db:setup
 */
import { SCHEMA_STATEMENTS } from '../lib/schema'
import { seedDatabase } from '../lib/seed'
import { logDatabaseError, query } from '../lib/db'

async function main() {
  console.log(`Applying ${SCHEMA_STATEMENTS.length} schema statements...`)

  for (const [index, statement] of SCHEMA_STATEMENTS.entries()) {
    try {
      await query(statement)
    } catch (error) {
      logDatabaseError(`schema statement ${index + 1} failed`, error)
      throw error
    }
  }

  console.log('Schema applied. Seeding restaurant data...')
  await seedDatabase()

  const [{ count: items }] = await query<{ count: string }>(
    'SELECT count(*)::text AS count FROM menu_items',
  )
  const [{ count: admins }] = await query<{ count: string }>(
    "SELECT count(*)::text AS count FROM users WHERE role = 'SUPER_ADMIN'",
  )
  const [{ count: tables }] = await query<{ count: string }>(
    'SELECT count(*)::text AS count FROM restaurant_tables',
  )

  console.log(`Done. ${items} menu items, ${tables} tables, ${admins} super admin(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logDatabaseError('database setup failed', error)
    process.exit(1)
  })
