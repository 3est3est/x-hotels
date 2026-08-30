# X Hotels — Backend

ElysiaJS API on Cloudflare Workers, Drizzle ORM over Supabase PostgreSQL (Supavisor pooler, port 6543), Better Auth for authentication, Cloudinary for image storage. Bun is used for tooling only.

## Setup

```bash
bun install
cp .dev.vars.example .env   # fill in your Supabase pooler URL, auth secret, Cloudinary keys
bun run db:migrate
bun run db:seed             # demo Regions/Hotels/Room Types
bun run dev                 # http://localhost:3000
```

## Scripts

- `bun test` — full test suite (runs against an in-memory PostgreSQL, no credentials needed)
- `bun run typecheck` — `tsc --noEmit`
- `bun run db:generate` — generate SQL migrations from the Drizzle schema
- `bun run db:migrate` — apply migrations to `DATABASE_URL`
- `bun run db:seed` — seed demo catalog data into `DATABASE_URL`

## Domain

See `../CONTEXT.md` for the glossary (Guest, Region, Hotel, Room Type, Booking, Actual Check-in, Review, Identity Verification) and `../.scratch/x-hotel-backend/spec.md` for the spec.
