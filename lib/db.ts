import 'server-only'

import { neon, neonConfig } from '@neondatabase/serverless'

import { SCHEMA_STATEMENTS } from './schema'

// The Neon connection string must be provided via DATABASE_URL — never hardcoded.
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('[manna] DATABASE_URL is not set — database features are disabled.')
}

// Local development against a Postgres running on this machine. Neon's driver
// defaults to HTTPS on its own hosts, so a localhost connection string needs
// the plain-HTTP endpoint. Production connection strings are untouched.
const localEndpoint = process.env.NEON_FETCH_ENDPOINT
if (localEndpoint && connectionString && /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString)) {
  neonConfig.fetchEndpoint = localEndpoint
  neonConfig.useSecureWebSocket = false
  neonConfig.poolQueryViaFetch = true
}

export const isDatabaseConfigured = Boolean(connectionString)

export const sql = connectionString ? neon(connectionString) : null

type DatabaseError = Error & { code?: string; name: string }

/**
 * Emits useful, credential-safe diagnostics. Never include query text, bound
 * values, connection strings, or the original error message in production logs.
 */
export function logDatabaseError(context: string, error: unknown) {
  const dbError = error instanceof Error ? (error as DatabaseError) : null
  const code = dbError?.code ?? 'UNKNOWN'
  const category =
    code === '42P01'
      ? 'MISSING_TABLE'
      : code === '42703'
        ? 'SCHEMA_MISMATCH'
        : code.startsWith('08')
          ? 'CONNECTION_FAILURE'
          : 'QUERY_FAILURE'

  console.error(`[manna][database] ${context}`, {
    category,
    code,
    errorName: dbError?.name ?? 'UnknownError',
  })
}

/** Throws a clear error instead of a null-dereference when the DB is missing. */
export function requireSql() {
  if (!sql) {
    throw new Error('DATABASE_URL is not configured. Add it to the project environment.')
  }
  return sql
}

/**
 * Parameterised query helper for dynamically composed SQL.
 * Values are always bound as parameters, never interpolated, so this stays safe
 * against SQL injection. Only static query text may be composed in code.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const client = requireSql()
  try {
    const rows = await client.query(text, params as never[])
    return rows as T[]
  } catch (error) {
    logDatabaseError('query failed', error)
    throw error
  }
}

/** Same as `query`, but returns the first row (or null) for single-row lookups. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

/** NUMERIC columns come back as strings over the wire. */
export function num(value: unknown): number {
  if (value === null || value === undefined) return 0
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

let bootstrapPromise: Promise<void> | null = null

/**
 * Creates every table/index the platform needs. All statements are additive and
 * idempotent, so this is safe to run on every cold start. The promise is cached
 * so concurrent requests only run the DDL once per instance.
 */
export function ensureSchema(): Promise<void> {
  if (!sql) return Promise.resolve()

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const client = requireSql()
      for (const statement of SCHEMA_STATEMENTS) {
        await client.query(statement)
      }
      // Seeding lives in its own module to keep this file dependency-light.
      const { seedDatabase } = await import('./seed')
      await seedDatabase()
    })().catch((error) => {
      // Reset so a later request can retry after a transient failure.
      bootstrapPromise = null
      logDatabaseError('schema bootstrap failed', error)
      throw error
    })
  }

  return bootstrapPromise
}

/** Convenience wrapper: guarantees the schema is ready before running work. */
export async function withDb<T>(fn: () => Promise<T>): Promise<T> {
  await ensureSchema()
  return fn()
}
