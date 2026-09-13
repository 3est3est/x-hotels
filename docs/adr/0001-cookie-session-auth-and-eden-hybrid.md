# 0001 — Cookie session auth + Eden hybrid client

Date: 2026-09-01
Status: Accepted

## Context

X Hotels backend (ElysiaJS on Cloudflare Workers, Better Auth with email+password) is complete and deployed. The next phase is a SPA frontend (React + TypeScript + Vite + Tailwind + PWA) hosted on Cloudflare Pages — a different origin from the Workers backend (`*.pages.dev` vs `*.workers.dev`).

We had to decide how the browser client authenticates and how it consumes the API.

## Decision

### 1. Cookie sessions (no JWT/Bearer)

Keep Better Auth's signed HTTP-only cookie sessions:

- HTTP-only cookies are not readable by XSS payloads; Bearer tokens stored in JS are.
- Sessions revocable server-side (DB-backed) — fits "hotel staff management" flows.
- No token refresh logic to build or leak.

Consequence: cross-origin requests need `SameSite=None; Secure` cookies. Better Auth is configured with `advanced.defaultCookieAttributes: { sameSite: 'none', secure: true }` (its default is `sameSite: 'lax'`, which silently drops cross-site cookies). On production (HTTPS baseURL) Better Auth additionally prefixes cookies with `__Secure-` automatically.

`trustedOrigins` (Better Auth CSRF protection) must list the backend origin plus every frontend origin (from `CORS_ORIGINS`).

### 2. Hybrid client: Eden treaty for business routes, better-auth client for auth

- Business routes (`/bookings`, `/hotels`, `/reviews`, …) are consumed via **Eden treaty** (`@elysiajs/eden/treaty`) — end-to-end type safety from the exported `type App`, zero codegen.
- Auth routes (`/api/auth/*`) are consumed via **better-auth's own client** (`createAuthClient`); Eden cannot see inside the mounted Better Auth handler.

`backend/src/app.ts` exports `type App = ReturnType<typeof createApp>` for this purpose. A type-level test (`backend/test/eden-inference.test.ts`) keeps this honest: if `App` is widened (e.g. back to `AnyElysia`) the inference breaks and CI fails.

Constraints discovered while wiring this up (kept as guardrails):

- `new Elysia(config)` must not be cast to `ElysiaConfig<any>` — the `any` prefix corrupts Eden's path inference (routes become `${any}`).
- The auth macro is a single parameterized macro (`session: true | 'verified' | 'management'`). Multiple boolean macros explode Elysia's type union and break both `tsc` and treaty.
- ~~TypeScript 5.9 is required; TypeScript 7 (native) currently fails with "Excessive complexity" on this app's type union.~~ **Update 2026-09-13**: re-tested; TypeScript 7.0.2 now type-checks this app cleanly (`tsc --noEmit`, all 49 tests pass). Backend moved to `typescript@7.0.2`. The `ElysiaConfig<''>` and single-macro guardrails above remain mandatory regardless of TS version; if a future TS 7.x release regresses, revert to `5.9.3`.

### 3. Not a Next.js/Astro app

The frontend is a Vite SPA on Cloudflare Pages. Rationale:

- Requirements are a classic client-side app (catalog → booking → check-in → review); no SSR/SEO need was ever stated.
- The backend is already a deployed Workers API; Next.js would either duplicate it or force a rewrite (explicitly rejected — settled 2026-09-01, see `.kilo/plans/1788143544879-backend-wrap-up-plan.md`).
- SPA + separate API keeps deploys independent.

## Notes for development

- If a browser rejects `SameSite=None; Secure` cookies over `http://localhost` during development, prefer a Vite dev proxy (same-origin requests) over loosening cookie attributes.
- `CORS_ORIGINS` is env-based (comma-separated). Production gets the real Pages origin at deploy time; same-origin API consumers work regardless.

## Consequences

- All cross-origin browser requests require CORS preflight support (added via `@elysiajs/cors`, credentials enabled).
- OpenAPI docs (`/openapi`) are mounted **only in the dev entrypoint** (`dev.ts`) — production exposes no API docs.
