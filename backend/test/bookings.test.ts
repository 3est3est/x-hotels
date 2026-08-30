import { describe, expect, it } from 'bun:test'
import { createTestApp, verifiedUser, signUp, seedCatalog, type TestUser } from './helpers'
import type { App } from '../src/app'

type CatalogFixture = Awaited<ReturnType<typeof seedCatalog>>

function postBooking(app: App, session: TestUser, body: Record<string, unknown>) {
  return app.handle(
    new Request('http://localhost/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: session.cookie },
      body: JSON.stringify(body),
    }),
  )
}

const validBody = (fixture: CatalogFixture, overrides: Record<string, unknown> = {}) => ({
  hotelId: fixture.hotelId,
  roomTypeId: fixture.roomTypeId,
  numGuests: 2,
  checkInDate: '2026-12-01',
  nights: 3,
  ...overrides,
})

describe('booking lifecycle', () => {
  it('rejects an unverified guest', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const unverified = await signUp(app, 'unverified@example.com')

    const res = await postBooking(app, unverified, validBody(fixture))

    expect(res.status).toBe(403)
  })

  it('creates a confirmed booking for a verified guest', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'guest@example.com')

    const res = await postBooking(app, guest, validBody(fixture))

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.status).toBe('CONFIRMED')
    expect(body.numGuests).toBe(2)
    expect(body.checkInDate).toBe('2026-12-01')
    expect(body.nights).toBe(3)
  })

  it('rejects more guests than the room type capacity', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db, 2)
    const guest = await verifiedUser(app, 'crowd@example.com')

    const res = await postBooking(app, guest, validBody(fixture, { numGuests: 3 }))

    expect(res.status).toBe(400)
  })

  it('rejects a room type from a different hotel', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'mismatch@example.com')

    const res = await postBooking(app, guest, validBody(fixture, { hotelId: fixture.hotelId + 100 }))

    expect(res.status).toBe(400)
  })

  it('rejects invalid dates and nights via validation', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'invalid@example.com')

    const badDate = await postBooking(app, guest, validBody(fixture, { checkInDate: '01-12-2026' }))
    const zeroNights = await postBooking(app, guest, validBody(fixture, { nights: 0 }))

    expect(badDate.status).toBe(422)
    expect(zeroNights.status).toBe(422)
  })

  it('lists only the caller own bookings', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const alice = await verifiedUser(app, 'alice@example.com')
    const bob = await verifiedUser(app, 'bob@example.com')
    await postBooking(app, alice, validBody(fixture))
    await postBooking(app, bob, validBody(fixture))

    const res = await app.handle(
      new Request('http://localhost/bookings', { headers: { cookie: alice.cookie } }),
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].hotelName).toBe('X Hotel Bangkok')
    expect(body[0].roomTypeName).toBe('Deluxe')
  })

  it('hides other guests bookings', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const alice = await verifiedUser(app, 'alice2@example.com')
    const bob = await verifiedUser(app, 'bob2@example.com')
    const created = await postBooking(app, alice, validBody(fixture))
    const bookingId = (await created.json()).id

    const res = await app.handle(
      new Request(`http://localhost/bookings/${bookingId}`, { headers: { cookie: bob.cookie } }),
    )

    expect(res.status).toBe(404)
  })

  it('cancels own confirmed booking once', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'canceller@example.com')
    const created = await postBooking(app, guest, validBody(fixture))
    const bookingId = (await created.json()).id

    const cancel = await app.handle(
      new Request(`http://localhost/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { cookie: guest.cookie },
      }),
    )
    const again = await app.handle(
      new Request(`http://localhost/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { cookie: guest.cookie },
      }),
    )

    expect(cancel.status).toBe(200)
    expect((await cancel.json()).status).toBe('CANCELLED')
    expect(again.status).toBe(409)
  })

  it('rejects cancelling someone else booking', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const alice = await verifiedUser(app, 'alice3@example.com')
    const bob = await verifiedUser(app, 'bob3@example.com')
    const created = await postBooking(app, alice, validBody(fixture))
    const bookingId = (await created.json()).id

    const res = await app.handle(
      new Request(`http://localhost/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { cookie: bob.cookie },
      }),
    )

    expect(res.status).toBe(404)
  })
})
