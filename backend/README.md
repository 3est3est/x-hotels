# X Hotels — Backend

ElysiaJS API on Cloudflare Workers, Drizzle ORM over Supabase PostgreSQL via Cloudflare Hyperdrive, Better Auth for authentication, Cloudinary for image storage. Bun is used for tooling only.

## Setup

```bash
bun install
cp .dev.vars.example .dev.vars   # fill in auth secret + Cloudinary keys
# backend/.env needs DATABASE_URL = Supabase SESSION pooler URL (port 5432)
bun run db:migrate
bun run db:seed                  # demo Regions/Hotels/Room Types
```

Local dev runs on the real Workers runtime:

```bash
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgres://...pooler.supabase.com:6543/postgres?sslmode=require"
bunx wrangler dev                # http://localhost:8787
```

## Scripts

- `bun test` — full test suite (runs against an in-memory PostgreSQL, no credentials needed)
- `bun run typecheck` — `tsc --noEmit`
- `bun run db:generate` — generate SQL migrations from the Drizzle schema
- `bun run db:migrate` — apply migrations to `DATABASE_URL` (session pooler, port 5432)
- `bun run db:seed` — seed demo catalog data into `DATABASE_URL`
- `bun run dev` — plain Bun server on `http://localhost:3000` (no Workers runtime)
- `bun run deploy` — deploy to Cloudflare Workers

## Smoke tests

Against a running instance (local or deployed):

```bash
BASE=http://localhost:8787 bash scripts/smoke-full.sh      # full happy path (needs a promoted `smoke-manager@example.com` account)
bash scripts/smoke-session.sh                              # sign-up + session regression check
```

## Notes

- The Supabase pooler presents a private-CA certificate that the Workers runtime always verifies, so the Worker reaches the database through Hyperdrive. Postgres clients are created per request (Workers forbid sharing I/O objects across requests).
- Migrations use the session pooler (port 5432); the Hyperdrive origin points at the Supabase **session** pooler (the transaction pooler on 6543 proved unstable in production).

## Identity Verification

Verification is a document number — there is no upload and no image (ADR 0002):

- A signed-in Guest `POST /identity-verification` with `{ documentType, documentNumber }`.
- `documentType: 'id_card'` accepts a Thai national ID (13 digits, mod-11 check digit) or an Israeli Teudat Zehut (9 digits, weighted check digit). `documentType: 'passport'` accepts any nationality, 5–15 alphanumerics.
- Numbers are normalized before validation and storage; a wrong number is refused with 422 and the account stays unverified. Verified accounts store `id_document_type`, `id_document_number`, `verified_at`.
- Cloudinary is used for hotel/room images only and is no longer part of the trust path.

## Domain

See `../CONTEXT.md` for the glossary (Guest, Country, Region, Hotel, Room Type, Booking, Actual Check-in, Review, Identity Verification), `../docs/HANDOFF.md` for the current system summary and route inventory, and `../.scratch/backend-revision-0003/spec.md` for the latest spec.
