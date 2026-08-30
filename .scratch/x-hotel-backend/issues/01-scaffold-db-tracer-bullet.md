# 01: Scaffold + DB tracer bullet

**What to build:** The backend skeleton proves the whole production path end-to-end: an ElysiaJS app running on Cloudflare Workers can talk to Supabase PostgreSQL through the Supavisor transaction pooler (port 6543), and the test harness can drive that app with a disposable database. A Guest (or anyone) hitting the regions endpoint gets real data back from PostgreSQL — proof that every later feature can sit on the same path.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Dependencies installed: Drizzle ORM, postgres-js, Better Auth, Cloudinary SDK; wrangler config for Workers (nodejs_compat), env handling for the pooler DATABASE_URL
- [ ] Drizzle config wired to Supabase pooler; `drizzle-kit push` succeeds
- [ ] `GET /regions` returns a seeded Region row from PostgreSQL through the pooler
- [ ] `bun test` harness drives the Elysia app object against a disposable DB and has one passing test
- [ ] `wrangler dev` serves the endpoint locally
