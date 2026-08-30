import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { eq } from 'drizzle-orm'
import { join } from 'node:path'
import * as schema from '../src/db/schema'
import { hotels, regions, roomTypes, user } from '../src/db/schema'
import { createApp, type App, type Db } from '../src/app'
import type { CloudinaryService } from '../src/services/cloudinary'

export const stubCloudinary: CloudinaryService = {
  async findIdentityAsset(publicId: string) {
    if (publicId === 'missing') return null
    return { publicId, url: `https://res.cloudinary.com/test/${publicId}` }
  },
  async signUpload() {
    throw new Error('not needed in tests')
  },
}

export async function createTestDb(): Promise<Db> {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder: join(import.meta.dir, '..', 'drizzle') })
  return db
}

export async function createTestApp() {
  const db = await createTestDb()
  const app = createApp({
    db,
    cloudinary: stubCloudinary,
    authSecret: 'test-secret',
    authUrl: 'http://localhost:3000',
  })
  return { db, app }
}

export interface TestUser {
  email: string
  password: string
  cookie: string
  userId: string
}

export async function signUp(
  app: App,
  email: string,
  password = 'Password123!',
): Promise<TestUser> {
  const res = await app.handle(
    new Request('http://localhost/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: email }),
    }),
  )
  if (!res.ok) throw new Error(`sign-up failed: ${res.status} ${await res.text()}`)
  const cookie = (res.headers.get('set-cookie') ?? '').split(';')[0]
  const body = (await res.json()) as { user: { id: string } }
  return { email, password, cookie, userId: body.user.id }
}

export async function promoteToManagement(db: Db, userId: string): Promise<void> {
  await db.update(user).set({ role: 'management' }).where(eq(user.id, userId))
}

export async function verifyIdentity(
  app: App,
  session: TestUser,
  documentType: 'id_card' | 'passport' = 'id_card',
): Promise<void> {
  const res = await app.handle(
    new Request('http://localhost/identity-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: session.cookie },
      body: JSON.stringify({ documentType, publicId: `identity/${session.userId}/doc` }),
    }),
  )
  if (!res.ok) throw new Error(`verification failed: ${res.status} ${await res.text()}`)
}

export async function signIn(
  app: App,
  email: string,
  password: string,
): Promise<string> {
  const res = await app.handle(
    new Request('http://localhost/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  )
  if (!res.ok) throw new Error(`sign-in failed: ${res.status}`)
  return (res.headers.get('set-cookie') ?? '').split(';')[0]
}

export async function verifiedUser(
  app: App,
  email: string,
  documentType: 'id_card' | 'passport' = 'id_card',
): Promise<TestUser> {
  const session = await signUp(app, email)
  await verifyIdentity(app, session, documentType)
  return session
}

export async function seedCatalog(db: Db, capacity = 2) {
  const [region] = await db.insert(regions).values({ name: 'Thailand' }).returning()
  const [hotel] = await db
    .insert(hotels)
    .values({ regionId: region.id, name: 'X Hotel Bangkok' })
    .returning()
  const [roomType] = await db
    .insert(roomTypes)
    .values({ hotelId: hotel.id, name: 'Deluxe', capacity, description: '' })
    .returning()
  return { regionId: region.id, hotelId: hotel.id, roomTypeId: roomType.id, capacity }
}
