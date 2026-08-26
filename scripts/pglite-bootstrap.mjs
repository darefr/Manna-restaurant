/**
 * Development-only loader hook: points the Neon serverless driver at the local
 * PGlite HTTP shim (scripts/dev-neon-proxy.mjs).
 *
 * Used with `node --import` when running scripts against the sandbox database.
 * Never referenced by application code or the production build.
 */
import { Module } from 'node:module'

// `server-only` throws outside the Next.js server runtime, so alias it away.
const resolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  if (request === 'server-only') return resolveFilename.call(this, 'node:util', ...rest)
  return resolveFilename.call(this, request, ...rest)
}

const endpoint = process.env.NEON_FETCH_ENDPOINT ?? 'http://localhost:5555/sql'

const { neonConfig } = await import('@neondatabase/serverless')
neonConfig.fetchEndpoint = endpoint
neonConfig.useSecureWebSocket = false
neonConfig.poolQueryViaFetch = true

// A `neon()` client resolves its URL when constructed, which can happen before
// this hook runs. Redirecting at the fetch layer covers those clients too.
const originalFetch = globalThis.fetch
globalThis.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : (input?.url ?? String(input))
  if (url.includes('/sql') && !url.startsWith(endpoint)) {
    return originalFetch(endpoint, init ?? (input instanceof Request ? input : undefined))
  }
  return originalFetch(input, init)
}
