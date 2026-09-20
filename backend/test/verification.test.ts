import { describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { createTestApp, signUp, signIn, verifiedUser, seedCatalog } from './helpers'
import { user as usersTable } from '../src/db/schema'

const VALID_THAI_ID = '1234567890121'
const VALID_TEUDAT = '123456782'
const VALID_PASSPORT = 'AB123456'

describe('verification by document number', () => {
  async function setup() {
    const { db, app } = await createTestApp()
    const session = await signUp(app, 'guest@example.com')
    const submit = (documentType: string, documentNumber: string, cookie = session.cookie) =>
      app.handle(
        new Request('http://localhost/identity-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', cookie },
          body: JSON.stringify({ documentType, documentNumber }),
        }),
      )
    const account = async () => {
      const [row] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId))
      return row
    }
    return { db, app, session, submit, account }
  }

  it('verifies a Thai national ID and stores type, number and timestamp', async () => {
    const { submit, account } = await setup()

    const res = await submit('id_card', VALID_THAI_ID)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ verified: true })
    const row = await account()
    expect(row.idDocumentType).toBe('id_card')
    expect(row.idDocumentNumber).toBe(VALID_THAI_ID)
    expect(row.verifiedAt).not.toBeNull()
  })

  it('verifies an Israeli Teudat Zehut', async () => {
    const { submit, account } = await setup()

    const res = await submit('id_card', VALID_TEUDAT)

    expect(res.status).toBe(200)
    expect((await account()).idDocumentNumber).toBe(VALID_TEUDAT)
  })

  it('verifies a passport of any nationality (5–15 alphanumerics)', async () => {
    const { submit } = await setup()

    expect((await submit('passport', 'ab123456')).status).toBe(200)
    expect((await submit('passport', 'A1B2C3D4E5F6G7')).status).toBe(200)
  })

  it('refuses ID-card numbers with a wrong length or a failed checksum', async () => {
    const { submit, account } = await setup()

    expect((await submit('id_card', '123456789012')).status).toBe(422)
    expect((await submit('id_card', '12345678901212')).status).toBe(422)
    expect((await submit('id_card', '9999999999999')).status).toBe(422)

    const row = await account()
    expect(row.verifiedAt).toBeNull()
    expect(row.idDocumentNumber).toBeNull()
  })

  it('refuses passports that are too short, too long, or contain symbols', async () => {
    const { submit } = await setup()

    expect((await submit('passport', 'A1b2')).status).toBe(422)
    expect((await submit('passport', 'A1B2C3D4E5F6G7H8')).status).toBe(422)
    expect((await submit('passport', 'AB12-56')).status).toBe(422)
  })

  it('normalizes numbers before validation and before storage', async () => {
    const { submit, account } = await setup()

    const spacedId = await submit('id_card', `  ${VALID_THAI_ID.slice(0, 1)}-${VALID_THAI_ID.slice(1)} `)
    expect(spacedId.status).toBe(200)
    expect((await account()).idDocumentNumber).toBe(VALID_THAI_ID)

    const lowerPassport = await submit('passport', '  ab123456 ')
    expect(lowerPassport.status).toBe(200)
    expect((await account()).idDocumentNumber).toBe('AB123456')
  })

  it('overwrites the previous document on re-submission and answers 200', async () => {
    const { submit, account } = await setup()

    expect((await submit('id_card', VALID_THAI_ID)).status).toBe(200)
    const res = await submit('passport', VALID_PASSPORT)

    expect(res.status).toBe(200)
    const row = await account()
    expect(row.idDocumentType).toBe('passport')
    expect(row.idDocumentNumber).toBe('AB123456')
    expect(row.verifiedAt).not.toBeNull()
  })

  it('locks the removed signature route away with 404', async () => {
    const { app, session } = await setup()

    const res = await app.handle(
      new Request('http://localhost/identity-verification/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: session.cookie },
        body: JSON.stringify({}),
      }),
    )

    expect(res.status).toBe(404)
  })

  it('answers 401 for an unauthenticated submission', async () => {
    const { app } = await setup()

    const res = await app.handle(
      new Request('http://localhost/identity-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: 'id_card', documentNumber: VALID_THAI_ID }),
      }),
    )

    expect(res.status).toBe(401)
  })

  it('leaves registration (email + password) untouched by verification', async () => {
    const { app, session } = await setup()
    await verifiedUser(app, 'later@example.com')

    const cookie = await signIn(app, session.email, session.password)
    expect(cookie).toContain('better-auth.session_token=')
  })

  it('keeps bookings gated on verification, and a rejected number never books', async () => {
    const { db, app, submit } = await setup()
    const { hotelId, roomTypeId } = await seedCatalog(db)

    const guest = await signUp(app, 'unverified@example.com')
    expect((await submit('id_card', '9999999999999', guest.cookie)).status).toBe(422)

    const booking = await app.handle(
      new Request('http://localhost/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: guest.cookie },
        body: JSON.stringify({ hotelId, roomTypeId, numGuests: 2, checkInDate: '2026-12-01', nights: 3 }),
      }),
    )
    expect(booking.status).toBe(403)
  })
})
