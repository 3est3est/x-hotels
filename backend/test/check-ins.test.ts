import { describe, expect, it } from 'bun:test'
import { createTestApp, verifiedUser, promoteToManagement, signIn, seedCatalog, type TestUser } from './helpers'
import type { App } from '../src/app'


async function managementSession(app: App, db: Awaited<ReturnType<typeof createTestApp>>['db']) {
  const staff = await verifiedUser(app, 'staff@example.com')
  await promoteToManagement(db, staff.userId)
  const cookie = await signIn(app, staff.email, staff.password)
  return { cookie, userId: staff.userId }
}

async function createBooking(app: App, guest: TestUser, fixture: { hotelId: number; roomTypeId: number }) {
  const res = await app.handle(
    new Request('http://localhost/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: guest.cookie },
      body: JSON.stringify({
        hotelId: fixture.hotelId,
        roomTypeId: fixture.roomTypeId,
        numGuests: 2,
        checkInDate: '2026-12-01',
        nights: 3,
      }),
    }),
  )
  expect(res.status).toBe(201)
  return (await res.json()) as { id: number }
}

describe('actual check-in', () => {
  it('lets management mark a confirmed booking as checked in', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'arriving@example.com')
    const booking = await createBooking(app, guest, fixture)
    const staff = await managementSession(app, db)

    const res = await app.handle(
      new Request(`http://localhost/admin/bookings/${booking.id}/check-in`, {
        method: 'POST',
        headers: { cookie: staff.cookie },
      }),
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('CHECKED_IN')
    expect(body.checkedInAt).not.toBeNull()
  })

  it('rejects a guest-role account', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'sneaky@example.com')
    const booking = await createBooking(app, guest, fixture)

    const res = await app.handle(
      new Request(`http://localhost/admin/bookings/${booking.id}/check-in`, {
        method: 'POST',
        headers: { cookie: guest.cookie },
      }),
    )

    expect(res.status).toBe(403)
  })

  it('rejects double check-in', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'twice@example.com')
    const booking = await createBooking(app, guest, fixture)
    const staff = await managementSession(app, db)

    await app.handle(
      new Request(`http://localhost/admin/bookings/${booking.id}/check-in`, {
        method: 'POST',
        headers: { cookie: staff.cookie },
      }),
    )
    const res = await app.handle(
      new Request(`http://localhost/admin/bookings/${booking.id}/check-in`, {
        method: 'POST',
        headers: { cookie: staff.cookie },
      }),
    )

    expect(res.status).toBe(409)
  })

  it('rejects check-in after cancellation', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'noShow@example.com')
    const booking = await createBooking(app, guest, fixture)
    const staff = await managementSession(app, db)

    await app.handle(
      new Request(`http://localhost/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { cookie: guest.cookie },
      }),
    )
    const res = await app.handle(
      new Request(`http://localhost/admin/bookings/${booking.id}/check-in`, {
        method: 'POST',
        headers: { cookie: staff.cookie },
      }),
    )

    expect(res.status).toBe(409)
  })

  it('returns 404 for an unknown booking', async () => {
    const { db, app } = await createTestApp()
    const staff = await managementSession(app, db)

    const res = await app.handle(
      new Request('http://localhost/admin/bookings/9999/check-in', {
        method: 'POST',
        headers: { cookie: staff.cookie },
      }),
    )

    expect(res.status).toBe(404)
  })

  it('requires authentication', async () => {
    const { app } = await createTestApp()

    const res = await app.handle(
      new Request('http://localhost/admin/bookings/1/check-in', { method: 'POST' }),
    )

    expect(res.status).toBe(401)
  })
})
