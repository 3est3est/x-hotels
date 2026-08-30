# X Hotels — Backend Implementation Plan

## Goal
Implement the backend API for the X Hotel reservation system per `requirements.md`, `architecture.md`, and the settled decisions below. Frontend is deferred (backend-first per architecture.md §16).

## Settled Decisions
1. **Catalog**: `Region` (geographic area, expandable e.g. Israel) → `Hotel` (1 branch = 1 hotel, `region_id` FK) → `Room Type` (guest books a type, never a physical room). X-group hotels only.
2. **Actors / Auth**: Single app, Better Auth, role field on user: `guest` / `management`. Unauthenticated: view only. Unverified logged-in guest: view only.
3. **Identity Verification**: at registration, guest uploads **Thai ID card or passport** image (multi-region/foreigner support) to Cloudinary → auto-verified, no approval queue. Verification gates booking/review actions. Profile photo is out of scope for now.
4. **Booking**: user + hotel + room type + number of guests + `check_in_date` + number of nights (check-out derived). **No availability checking.** On-site payment only. Data must persist (Postgres).
5. **Booking statuses** (exactly 3): `CONFIRMED` → `CANCELLED` (by guest, no rules/deadlines) or `CONFIRMED` → `CHECKED_IN` (marked by management; records `checked_in_at`).
6. **Review**: rating 0–5 integer (required) + comment (optional). Only users with a `CHECKED_IN` booking at that hotel may review. 1 review per user per hotel (unique constraint), editable. Creating a new review over an existing one is rejected — use edit.
7. **Statistics** (management, all-time, SQL aggregates): total bookings (includes cancelled, matching instructor's 100/80 example), actual check-ins, check-in % = check-ins ÷ total bookings, most-booked room type / hotel / region.
8. **Stack**: ElysiaJS + Drizzle ORM + Supabase Postgres (Supavisor transaction pooler, port 6543) + Better Auth + Cloudinary + Cloudflare Workers. Bun for tooling only.
9. **Seed data**: script generates fake regions/hotels/room types with placeholder images (Cloudinary sample/demo images). No catalog CRUD endpoints — catalog is seeded, not administered.
10. **Excluded by default** (not in requirements): room price, email, notifications, date-range filters on stats.

## Schema (Drizzle / PostgreSQL)
- `regions`: id, name (unique), created_at
- `hotels`: id, region_id → regions, name, description, images (jsonb: [{url, publicId}]), created_at
- `room_types`: id, hotel_id → hotels, name, description, capacity (max guests), images (jsonb), created_at
- Better Auth tables (user, session, etc.) via its Drizzle adapter; add `role` enum (`guest` | `management`) and verification fields on user: `id_document_type` (`id_card` | `passport`), `id_document_url`, `verified_at`
- `bookings`: id, user_id, hotel_id, room_type_id, num_guests, check_in_date (date), nights (int), status enum (`CONFIRMED` | `CANCELLED` | `CHECKED_IN`), checked_in_at (nullable), created_at, updated_at
- `reviews`: id, user_id, hotel_id, rating (int 0–5), comment (text, nullable), created_at, updated_at; unique(user_id, hotel_id)

## API Surface (REST via ElysiaJS)
- **Public**: `GET /regions`, `GET /hotels?regionId=&q=`, `GET /hotels/:id` (room types + reviews + avg rating)
- **Auth**: Better Auth handlers (`/api/auth/*`): sign-up, login, session
- **Verification (guest)**: `POST /identity-verification` (multipart: document image + type) → upload to Cloudinary, set verified fields
- **Bookings (guest, verified)**: `POST /bookings`, `GET /bookings` (own), `GET /bookings/:id` (own), `POST /bookings/:id/cancel` (own, only if `CONFIRMED`)
- **Reviews (guest, verified)**: `POST /hotels/:id/reviews` (server validates a `CHECKED_IN` booking exists for user+hotel), `PATCH /reviews/:id` (own)
- **Management (role=management)**: `POST /admin/bookings/:id/check-in` (only if `CONFIRMED`), `GET /admin/stats`

## Validation Rules
- rating: integer 0–5; num_guests ≥ 1 and ≤ room_type capacity; nights ≥ 1; check_in_date required (no availability check, no past-date rule unless trivial to add)
- review: gated on checked-in stay + unique per user/hotel
- booking mutation: ownership + status checks; admin routes: role check

## Tasks (ordered)
1. Update `CONTEXT.md`: Booking gains a date range ("check-in date + nights"); Review requires an actual check-in; Identity Verification = ID card or passport upload at registration; add **Branch** as synonym of Hotel (_Avoid_ as separate entity); remove the ADR idea for "no dates" (obsolete).
2. Backend deps: `drizzle-orm`, `postgres`, `better-auth`, Cloudinary SDK; `wrangler` + `wrangler.jsonc` (`nodejs_compat`); env handling (`.dev.vars` / secrets: `DATABASE_URL`, `CLOUDINARY_*`, `BETTER_AUTH_SECRET`).
3. Drizzle schema + `drizzle.config.ts`; `drizzle-kit push` against Supabase (pooler URL, port 6543).
4. Better Auth setup with Drizzle adapter + `role` field; role guard plugin for Elysia (`requireGuest`, `requireManagement`).
5. Cloudinary upload route (signed upload) + identity verification endpoint + `verified` gate on booking/review.
6. Catalog read APIs + seed script (fake regions → hotels → room types, demo images).
7. Booking APIs (create/list/detail/cancel) with status transitions.
8. Check-in endpoint (management) + stats endpoint (SQL group-by aggregates; check-in % server-side).
9. Review APIs with checked-in gate and unique constraint handling.
10. Tests (`bun test`): booking lifecycle transitions, review gate (no stay → 403; after check-in → ok; second review → 409), stats math (seeded fixture → verify % and most-booked), verification gate (unverified booking → 403).
11. Workers deploy config check: `wrangler dev` locally, pooling-only DB connection, deploy to Cloudflare Workers.

## Risks / Notes
- **Workers ↔ Postgres**: direct TCP is impossible; must use Supavisor transaction pooler (port 6543) with `postgres-js`. Do not use `pg`/node-postgres.
- **Better Auth on Workers**: use its web-standard/Drizzle adapter path; verify session cookie handling under Workers runtime early (task 4 is the de-risk step).
- **Cloudinary**: upload client→Cloudinary with signature from backend (avoid proxying large files through the Worker); store `url` + `public_id` only in Postgres.
- **Stats %**: includes cancelled bookings in denominator per instructor's example (100 total / 80 check-ins = 80%).

## Validation Plan
- `bun test` green (task 10 suite).
- `curl` smoke test of full happy path: seed → sign-up → verify → book → management check-in → review → admin stats.
- `drizzle-kit push` succeeds against Supabase; `wrangler dev` serves all routes.

## Open Questions
- None blocking. Minor defaults recorded in Decisions §10 (no price field, optional comment, all-time stats).
