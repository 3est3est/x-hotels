import { describe, expect, it } from 'bun:test'
import {
  createTestApp,
  postBooking,
  verifiedUser,
  signUp,
  seedCatalog,
  seedBranch,
} from './helpers'

type CatalogFixture = Awaited<ReturnType<typeof seedCatalog>>
type BranchFixture = Awaited<ReturnType<typeof seedBranch>>

const validBody = (fixture: BranchFixture, overrides: Record<string, unknown> = {}) => ({
  hotelId: fixture.hotelId,
  roomTypeId: fixture.roomTypeId,
  numGuests: 2,
  checkInDate: '2026-12-01',
  nights: 3,
  ...overrides,
})

describe('booking lifecycle', () => {
  it('accepts a signed-in guest without verification (ADR 0005)', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await signUp(app, 'unverified@example.com')

    const res = await postBooking(app, guest, validBody(fixture))

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.status).toBe('CONFIRMED')
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

  it('returns the Hotel and Region in the created Booking (story 15)', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'where@example.com')

    const res = await postBooking(app, guest, validBody(fixture))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body).toMatchObject({
      guestId: guest.userId,
      hotelId: fixture.hotelId,
      hotelName: 'X Hotel Bangkok',
      regionName: 'Central',
      roomTypeId: fixture.roomTypeId,
      roomTypeName: 'Deluxe',
      checkOutDate: '2026-12-04',
    })
    expect(body.userId).toBeUndefined()
  })

  it('fetches a single Booking with the same representation as the list', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'single@example.com')
    const created = await postBooking(app, guest, validBody(fixture))
    const createdBody = (await created.json()) as { id: number }

    const res = await app.handle(
      new Request(`http://localhost/bookings/${createdBody.id}`, { headers: { cookie: guest.cookie } }),
    )
    const listed = await (
      await app.handle(new Request('http://localhost/bookings', { headers: { cookie: guest.cookie } }))
    ).json()

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      guestId: guest.userId,
      hotelName: 'X Hotel Bangkok',
      regionName: 'Central',
      roomTypeName: 'Deluxe',
    })
    expect(Object.keys(body).sort()).toEqual(Object.keys(listed[0]).sort())
  })

  it('accepts more guests than the Room Type maximum-guest capacity (no unapproved booking rule)', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db, 2)
    const guest = await verifiedUser(app, 'crowd@example.com')

    const res = await postBooking(app, guest, validBody(fixture, { numGuests: 3 }))

    expect(res.status).toBe(201)
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

    const badFormat = await postBooking(app, guest, validBody(fixture, { checkInDate: '01-12-2026' }))
    const impossibleDate = await postBooking(app, guest, validBody(fixture, { checkInDate: '2026-99-99' }))
    const zeroNights = await postBooking(app, guest, validBody(fixture, { nights: 0 }))

    expect(badFormat.status).toBe(422)
    expect(impossibleDate.status).toBe(400)
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
    const cancelledBody = await cancel.json()
    expect(cancelledBody.status).toBe('CANCELLED')
    expect(cancelledBody.hotelName).toBe('X Hotel Bangkok')
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

  it('carries the Country of the Hotel through every Booking route', async () => {
    const { db, app } = await createTestApp()
    const thailand = await seedBranch(db, 'Thailand', 'Central', 'X Hotel Bangkok', 2)
    const israel = await seedBranch(db, 'Israel', 'Tel Aviv', 'X Hotel Tel Aviv', 2)
    const guest = await verifiedUser(app, 'geographer@example.com')

    const created = await postBooking(app, guest, validBody(thailand))
    expect(created.status).toBe(201)
    const createdBody = await created.json()
    expect(createdBody).toMatchObject({
      hotelName: 'X Hotel Bangkok',
      regionName: 'Central',
      countryName: 'Thailand',
    })

    const fetched = await app.handle(
      new Request(`http://localhost/bookings/${createdBody.id}`, { headers: { cookie: guest.cookie } }),
    )
    expect(fetched.status).toBe(200)
    expect((await fetched.json()).countryName).toBe('Thailand')

    const israelBooking = await postBooking(app, guest, validBody(israel))
    expect(israelBooking.status).toBe(201)
    expect((await israelBooking.json()).countryName).toBe('Israel')

    const listed = await app.handle(
      new Request('http://localhost/bookings', { headers: { cookie: guest.cookie } }),
    )
    const list = (await listed.json()) as Array<{ countryName: string }>
    expect(list.map((booking) => booking.countryName).sort()).toEqual(['Israel', 'Thailand'])

    const cancel = await app.handle(
      new Request(`http://localhost/bookings/${createdBody.id}/cancel`, {
        method: 'POST',
        headers: { cookie: guest.cookie },
      }),
    )
    expect(cancel.status).toBe(200)
    expect((await cancel.json()).countryName).toBe('Thailand')
  })

  it('keeps one shared Booking shape across create, fetch, list and cancel', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'oneshape@example.com')

    const created = await postBooking(app, guest, validBody(fixture))
    const createdBody = await created.json()
    const bookingId = createdBody.id

    const fetched = await (
      await app.handle(
        new Request(`http://localhost/bookings/${bookingId}`, { headers: { cookie: guest.cookie } }),
      )
    ).json()
    const listed = await (
      await app.handle(
        new Request('http://localhost/bookings', { headers: { cookie: guest.cookie } }),
      )
    ).json()
    const cancelled = await (
      await app.handle(
        new Request(`http://localhost/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: { cookie: guest.cookie },
        }),
      )
    ).json()

    const keys = (row: Record<string, unknown>) => Object.keys(row).sort()
    expect(keys(createdBody)).toEqual(keys(fetched))
    expect(keys(createdBody)).toEqual(keys(listed[0]))
    expect(keys(createdBody)).toEqual(keys(cancelled))
    expect(keys(createdBody)).toContain('countryName')
  })
})
