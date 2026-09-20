/**
 * Verification harness for a migration that touches data (currently 0008).
 *
 * The PGlite suite applies every migration to an empty database, so the data
 * steps of a migration — re-homing existing rows, deleting legacy rows — never
 * execute there. This script replays the pre-revision migrations, inserts
 * Spec 0001-shaped data, applies the revision migration, and asserts the
 * outcome, including that the seed is idempotent against an already-migrated
 * database.
 *
 * Run from `backend/`: `bun run scripts/verify-0008-migration.ts`
 */
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(import.meta.dir, '..', 'drizzle')
const client = new PGlite()

const statements = (file: string) =>
  readFileSync(join(dir, file), 'utf8')
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean)

async function apply(file: string) {
  for (const stmt of statements(file)) await client.exec(stmt)
}

const rows = async (sql: string) => (await client.query<Record<string, unknown>>(sql)).rows

const failures: string[] = []
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}

async function throws(label: string, sql: string) {
  try {
    await client.exec(sql)
    failures.push(`${label}: expected an error, none raised`)
    console.log(`FAIL  ${label}`)
  } catch {
    console.log(`PASS  ${label}`)
  }
}

// --- Spec 0001 state ---------------------------------------------------------
for (const file of [
  '0000_cynical_strong_guy.sql',
  '0001_talented_nicolaos.sql',
  '0002_misty_azazel.sql',
  '0003_smiling_living_tribunal.sql',
  '0004_shallow_magdalene.sql',
  '0005_dark_earthquake.sql',
  '0006_same_gambit.sql',
  '0007_sunny_review_message.sql',
]) {
  await apply(file)
}

await client.exec(`INSERT INTO "regions" ("name") VALUES ('Thailand'), ('Israel')`)
await client.exec(`
  INSERT INTO "hotels" ("region_id", "name", "description", "images")
  SELECT "regions"."id", h."name", 'seeded before the revision', '[]'::jsonb
  FROM (VALUES
    ('X Hotel Bangkok', 'Thailand'),
    ('X Hotel Phuket', 'Thailand'),
    ('X Hotel Tel Aviv', 'Israel'),
    ('X Hotel Jerusalem', 'Israel')
  ) AS h(name, region)
  JOIN "regions" ON "regions"."name" = h.region
`)
await client.exec(`
  INSERT INTO "room_types" ("hotel_id", "name", "capacity", "description", "images")
  SELECT "hotels"."id", 'Deluxe', 2, '', '[]'::jsonb FROM "hotels" WHERE "name" = 'X Hotel Bangkok'
`)

const before = await rows(`SELECT count(*)::int AS n FROM "regions"`)
check('Spec 0001 fixture has two Regions', before[0].n, 2)
const hotelsBefore = await rows(`SELECT count(*)::int AS n FROM "hotels"`)
check('Spec 0001 fixture has four Hotels', hotelsBefore[0].n, 4)

// --- the revision migration --------------------------------------------------
await apply('0008_peaceful_sentinels.sql')

const countries = await rows(`SELECT "name" FROM "countries" ORDER BY "name"`)
check('Countries created', countries.map((r) => r.name), ['Israel', 'Thailand'])

const regionCount = await rows(`SELECT count(*)::int AS n FROM "regions"`)
check('Regions are the twelve business Regions', regionCount[0].n, 12)

const sharedNames = await rows(`
  SELECT "regions"."name", "countries"."name" AS country
  FROM "regions" JOIN "countries" ON "countries"."id" = "regions"."country_id"
  WHERE "regions"."name" IN ('Central', 'Northern', 'Southern')
  ORDER BY "regions"."name", "countries"."name"
`)
check(
  'Shared Region names exist once per Country',
  sharedNames.map((r) => `${r.name}/${r.country}`),
  [
    'Central/Israel',
    'Central/Thailand',
    'Northern/Israel',
    'Northern/Thailand',
    'Southern/Israel',
    'Southern/Thailand',
  ],
)

const legacy = await rows(`SELECT "name" FROM "regions" WHERE "name" IN (SELECT "name" FROM "countries")`)
check('Legacy country-named Regions are gone', legacy, [])

const rehomed = await rows(`
  SELECT h."name" AS hotel, r."name" AS region, c."name" AS country
  FROM "hotels" h
  JOIN "regions" r ON r."id" = h."region_id"
  JOIN "countries" c ON c."id" = r."country_id"
  ORDER BY h."name"
`)
check(
  'Every existing Hotel sits in its new Region and Country',
  rehomed.map((r) => `${r.hotel} → ${r.country}/${r.region}`),
  [
    'X Hotel Bangkok → Thailand/Central',
    'X Hotel Jerusalem → Israel/Jerusalem',
    'X Hotel Phuket → Thailand/Southern',
    'X Hotel Tel Aviv → Israel/Tel Aviv',
  ],
)

const roomTypes = await rows(`
  SELECT rt."name" AS room_type, h."name" AS hotel
  FROM "room_types" rt JOIN "hotels" h ON h."id" = rt."hotel_id"
`)
check('Room Types survived the re-homing', roomTypes.map((r) => `${r.room_type}@${r.hotel}`), [
  'Deluxe@X Hotel Bangkok',
])

await throws('A Region can no longer exist without a Country', `INSERT INTO "regions" ("name") VALUES ('Orphan')`)
await throws(
  'A Region name cannot repeat inside one Country',
  `INSERT INTO "regions" ("country_id", "name") SELECT "id", 'Central' FROM "countries" WHERE "name" = 'Thailand'`,
)
await client.exec(
  `INSERT INTO "regions" ("country_id", "name") SELECT "id", 'Zeta' FROM "countries" WHERE "name" = 'Thailand'`,
)
console.log('PASS  A new Region name can be added to a Country')

// --- idempotent seed against the migrated database ----------------------------
const { seedDemoData } = await import('../src/db/seed')
const { drizzle } = await import('drizzle-orm/pglite')
const schema = await import('../src/db/schema')
const db = drizzle(client, { schema })
const first = await seedDemoData(db as never)
const second = await seedDemoData(db as never)
const afterSeed = await rows(`SELECT count(*)::int AS n FROM "hotels"`)
check('Seed fills the missing branches and adds nothing twice', [first.hotels, second.hotels], [8, 0])
check('Seed leaves one Hotel in every business Region', afterSeed[0].n, 12)

console.log(failures.length === 0 ? '\nALL CHECKS PASSED' : `\n${failures.length} CHECK(S) FAILED`)
for (const failure of failures) console.error(failure)
process.exit(failures.length === 0 ? 0 : 1)

