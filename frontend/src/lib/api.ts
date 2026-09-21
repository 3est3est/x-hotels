import { treaty } from '@elysiajs/eden/treaty2'
import type { App } from '../../../backend/src/app'

/**
 * The typed API client. The type comes from the backend's Elysia app — routes,
 * bodies and responses are inferred, never hand-written — while the treaty is
 * wired to same-origin paths: Vite's dev server proxies `/api` to the backend
 * (vite.config.ts) and Cloudflare Pages does the same in production via
 * `_redirects`. See docs/adr/0004-react-vite-frontend.md.
 *
 * `treaty2` (not the legacy `edenTreaty`) is used because it keys `data` and
 * `error` by the declared response statuses, so `api.*` call sites are fully
 * type-safe instead of `data: unknown`.
 *
 * The treaty resolves its domain argument as a URL, so a bare `/api` would be
 * read as the host `api` — the base is pinned to the page's own origin, the
 * same trick as the auth client. Same-origin by construction, and the Vite dev
 * proxy / Pages `_redirects` carry `/api/*` to the backend in every environment.
 */
export const api = treaty<App>(`${window.location.origin}/api`)

/** Where the backend can be reached when no proxy is in front (plain fetch needs). */
export const API_BASE = '/api'

/** Pull the backend's `{ error }` message out of a treaty error, whatever its status. */
export function errorMessage(error: unknown, fallback = 'Request failed'): string {
  const value = (error as { value?: unknown } | null)?.value
  if (value && typeof value === 'object' && 'error' in value) {
    const message = (value as { error?: unknown }).error
    if (typeof message === 'string') return message
  }
  return fallback
}
