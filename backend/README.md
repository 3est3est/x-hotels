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
- Migrations use the session pooler (port 5432); the runtime uses the transaction pooler (port 6543) as the Hyperdrive origin.

## Domain

See `../CONTEXT.md` for the glossary (Guest, Region, Hotel, Room Type, Booking, Actual Check-in, Review, Identity Verification) and `../.scratch/x-hotel-backend/spec.md` for the spec.
