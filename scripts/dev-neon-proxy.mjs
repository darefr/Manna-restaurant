/**
 * Local development shim: serves the Neon serverless HTTP protocol on top of an
 * in-process PGlite database.
 *
 * This exists purely so the app can be exercised end to end in a sandbox that
 * has no Postgres server. It is never imported by application code and is not
 * part of the production build.
 *
 *   node scripts/dev-neon-proxy.mjs
 *   DATABASE_URL=postgres://user:pass@localhost:5555/main pnpm dev
 */
import { createServer } from 'node:http'

import { PGlite } from '@electric-sql/pglite'

const PORT = Number(process.env.PGLITE_PORT ?? 5555)

const db = await PGlite.create({ dataDir: process.env.PGLITE_DIR ?? './.pglite' })
console.log('[pglite] database ready')

/** Neon returns Postgres type OIDs alongside each field. */
function toNeonFields(fields = []) {
  return fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID }))
}

/** Neon's HTTP driver expects every value as a string (or null). */
function toNeonRow(row, fields) {
  return fields.map((f) => {
    const value = row[f.name]
    if (value === null || value === undefined) return null
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  })
}

async function runQuery({ query, params }) {
  const result = await db.query(query, params ?? [], { rowMode: 'object' })
  const fields = result.fields ?? []
  return {
    command: 'SELECT',
    fields: toNeonFields(fields),
    rowCount: result.rows?.length ?? result.affectedRows ?? 0,
    rows: (result.rows ?? []).map((row) => toNeonRow(row, fields)),
    rowAsArray: true,
  }
}

const server = createServer((req, res) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', async () => {
    res.setHeader('Content-Type', 'application/json')
    try {
      const payload = JSON.parse(body || '{}')

      // A batch request carries a `queries` array; a single query does not.
      if (Array.isArray(payload.queries)) {
        const results = []
        for (const q of payload.queries) results.push(await runQuery(q))
        res.end(JSON.stringify({ results }))
        return
      }

      res.end(JSON.stringify(await runQuery(payload)))
    } catch (error) {
      console.error('[pglite] query failed:', error.message)
      res.statusCode = 400
      res.end(
        JSON.stringify({
          message: error.message,
          code: error.code ?? 'XX000',
          severity: 'ERROR',
        }),
      )
    }
  })
})

server.listen(PORT, () => console.log(`[pglite] neon-compatible endpoint on :${PORT}`))
