import { edenTreaty } from '@elysiajs/eden/treaty'
import type { App } from '../../../backend/src/app'

/**
 * The typed API client. The type comes from the backend's Elysia app — routes,
 * bodies and responses are inferred, never hand-written — while the treaty is
 * wired to same-origin paths: Vite's dev server proxies `/api` to the backend
 * (vite.config.ts) and Cloudflare Pages does the same in production via
 * `_redirects`. See docs/adr/0004-react-vite-frontend.md.
 */
export const api = edenTreaty<App>('/api')

/** Where the backend can be reached when no proxy is in front (plain fetch needs). */
export const API_BASE = '/api'
