import { describe, expect, it } from 'bun:test'
import { createTestApp, verifiedUser, promoteToManagement, signIn, type TestUser } from './helpers'
import { bookings as bookingsTable, hotels, regions, roomTypes } from '../src/db/schema'
import type { App } from '../src/app'

type Db = Awaited<ReturnType<typeof createTestApp>>['db']

describe('management statistics', () => {
  it('rejects guest-role accounts', async () => {
    const { app } = await createTestApp()
    const guest = await verifiedUser(app, 'peasant@example.com')

    const res = await app.handle(
      new Request('http://localhost/admin/stats', { headers: { cookie: guest.cookie } }),
    )

    expect(res.status).toBe(403)
  })

  it('returns zeros for an empty system', async () => {
    const { db, app } = await createTestApp()
    const staff = await verifiedUser(app, 'boss@example.com')
    await promoteToManagement(db, staff.userId)
    const cookie = await signIn(app, staff.email, staff.password)

    const res = await app.handle(
      new Request('http://localhost/admin/stats', { headers: { cookie } }),
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.totalBookings).toBe(0)
    expect(body.actualCheckIns).toBe(0)
    expect(body.checkInPercentage).toBe(0)
    expect(body.mostBookedRoomType).toBeNull()
    expect(body.mostBookedHotel).toBeNull()
    expect(body.mostBookedRegion).toBeNull()
  })

  it('computes totals, percentage and most-booked rankings', async () => {
    const { db, app } = await createTestApp()

    const [th] = await db.insert(regions).values({ name: 'Thailand' }).returning()
    const [il] = await db.insert(regions).values({ name: 'Israel' }).returning()
    const [bangkok] = await db
      .insert(hotels)
      .values({ regionId: th.id, name: 'X Hotel Bangkok' })
      .returning()
    const [telAviv] = await db
      .insert(hotels)
      .values({ regionId: il.id, name: 'X Hotel Tel Aviv' })
      .returning()
    const [deluxe] = await db
      .insert(roomTypes)
      .values({ hotelId: bangkok.id, name: 'Deluxe', capacity: 2 })
      .returning()
    const [suite] = await db
      .insert(roomTypes)
      .values({ hotelId: bangkok.id, name: 'Suite', capacity: 4 })
      .returning()
    const [tlvDeluxe] = await db
      .insert(roomTypes)
      .values({ hotelId: telAviv.id, name: 'Deluxe', capacity: 2 })
      .returning()

    const email = (n: number) => `guest${n}@example.com`
    const guests: TestUser[] = []
    for (let i = 1; i <= 4; i++) guests.push(await verifiedUser(app, email(i)))

    const insertBooking = (
      guest: (typeof guests)[number],
      hotelId: number,
      roomTypeId: number,
      status: 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN',
    ) =>
      db.insert(bookingsTable).values({
        userId: guest.userId,
        hotelId,
        roomTypeId,
        numGuests: 2,
        checkInDate: '2026-12-01',
        nights: 2,
        status,
        checkedInAt: status === 'CHECKED_IN' ? new Date() : null,
      })

    await insertBooking(guests[0], bangkok.id, deluxe.id, 'CHECKED_IN')
    await insertBooking(guests[1], bangkok.id, deluxe.id, 'CHECKED_IN')
    await insertBooking(guests[2], bangkok.id, suite.id, 'CANCELLED')
    await insertBooking(guests[3], telAviv.id, tlvDeluxe.id, 'CONFIRMED')

    const staff = await verifiedUser(app, 'stats@example.com')
    await promoteToManagement(db, staff.userId)
    const cookie = await signIn(app, staff.email, staff.password)

    const res = await app.handle(
      new Request('http://localhost/admin/stats', { headers: { cookie } }),
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.totalBookings).toBe(4)
    expect(body.actualCheckIns).toBe(2)
    expect(body.checkInPercentage).toBe(50)
    expect(body.mostBookedRoomType).toMatchObject({ name: 'Deluxe', bookings: 2 })
    expect(body.mostBookedHotel).toMatchObject({ name: 'X Hotel Bangkok', bookings: 3 })
    expect(body.mostBookedRegion).toMatchObject({ name: 'Thailand', bookings: 3 })
  })
})
