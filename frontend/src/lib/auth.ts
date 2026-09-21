import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { Auth } from '../../../backend/src/modules/auth'

/**
 * Better Auth client, with `inferAdditionalFields` reading the backend's auth
 * instance type so the session user carries the X Hotels additional fields
 * (role, idDocumentType, idDocumentNumber, verifiedAt) — no hand-written user
 * shape. Bound to same-origin `/api/auth/*`: the Vite dev proxy carries them to
 * the backend in development, the Cloudflare Pages `_redirects` proxy does it
 * in production, so the session cookie is always first-party. Session state is
 * read with `authClient.useSession()`.
 *
 * better-auth rejects a relative `baseURL`, so it is pinned to the page's own
 * origin — same-origin by construction in every environment.
 */
export const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/auth`,
  plugins: [inferAdditionalFields<Auth>()],
})

export const { useSession } = authClient
