import { describe, expect, it } from 'bun:test'
import { createTestApp, verifiedUser, managementSession, type TestUser } from './helpers'
import { bookings as bookingsTable, hotels, regions, roomTypes } from '../src/db/schema'
import type { App } from '../src/app'

type Db = Awaited<ReturnType<typeof createTestApp>>['db']

function insertBooking(
  db: Db,
  guest: TestUser,
  hotelId: number,
  roomTypeId: number,
  status: 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN',
) {
  return db.insert(bookingsTable).values({
    userId: guest.userId,
    hotelId,
    roomTypeId,
    numGuests: 2,
    checkInDate: '2026-12-01',
    nights: 2,
    status,
    checkedInAt: status === 'CHECKED_IN' ? new Date() : null,
  })
}

describe('management statistics', () => {
  it('rejects guest-role accounts', async () => {
    const { app } = await createTestApp()
    const guest = await verifiedUser(app, 'peasant@example.com')

    const res = await app.handle(
      new Request('http://localhost/management/stats', { headers: { cookie: guest.cookie } }),
    )

    expect(res.status).toBe(403)
  })

  it('no longer serves the legacy /admin path', async () => {
    const { db, app } = await createTestApp()
    const manager = await managementSession(app, db)

    const res = await app.handle(
      new Request('http://localhost/admin/stats', { headers: { cookie: manager.cookie } }),
    )

    expect(res.status).toBe(404)
  })

  it('returns zeros for an empty system', async () => {
    const { db, app } = await createTestApp()
    const manager = await managementSession(app, db)

    const res = await app.handle(
      new Request('http://localhost/management/stats', { headers: { cookie: manager.cookie } }),
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

    await insertBooking(db, guests[0], bangkok.id, deluxe.id, 'CHECKED_IN')
    await insertBooking(db, guests[1], bangkok.id, deluxe.id, 'CHECKED_IN')
    await insertBooking(db, guests[2], bangkok.id, suite.id, 'CANCELLED')
    await insertBooking(db, guests[3], telAviv.id, tlvDeluxe.id, 'CONFIRMED')

    const manager = await managementSession(app, db)

    const res = await app.handle(
      new Request('http://localhost/management/stats', { headers: { cookie: manager.cookie } }),
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

  it('breaks most-booked ties deterministically (name first, then id)', async () => {
    const { db, app } = await createTestApp()

    const [th] = await db.insert(regions).values({ name: 'Thailand' }).returning()
    const [bangkok] = await db
      .insert(hotels)
      .values({ regionId: th.id, name: 'X Hotel Bangkok' })
      .returning()
    const [aa] = await db
      .insert(hotels)
      .values({ regionId: th.id, name: 'AA Resort' })
      .returning()
    const [suiteB] = await db
      .insert(roomTypes)
      .values({ hotelId: bangkok.id, name: 'Suite', capacity: 2 })
      .returning()
    const [deluxeB] = await db
      .insert(roomTypes)
      .values({ hotelId: bangkok.id, name: 'Deluxe', capacity: 2 })
      .returning()
    const [deluxeA] = await db
      .insert(roomTypes)
      .values({ hotelId: aa.id, name: 'Deluxe', capacity: 2 })
      .returning()
    const [suiteA] = await db
      .insert(roomTypes)
      .values({ hotelId: aa.id, name: 'Suite', capacity: 2 })
      .returning()

    const guests = []
    for (let i = 1; i <= 4; i++) guests.push(await verifiedUser(app, `t${i}@example.com`))
    await insertBooking(db, guests[0], bangkok.id, suiteB.id, 'CONFIRMED')
    await insertBooking(db, guests[1], bangkok.id, deluxeB.id, 'CONFIRMED')
    await insertBooking(db, guests[2], aa.id, deluxeA.id, 'CONFIRMED')
    await insertBooking(db, guests[3], aa.id, suiteA.id, 'CONFIRMED')

    const manager = await managementSession(app, db)
    const fetchStats = async () => {
      const res = await app.handle(
        new Request('http://localhost/management/stats', { headers: { cookie: manager.cookie } }),
      )
      expect(res.status).toBe(200)
      return res.json()
    }

    const first = await fetchStats()
    const second = await fetchStats()

    expect(first.mostBookedRoomType).toMatchObject({ name: 'Deluxe', bookings: 1 })
    expect(first.mostBookedHotel).toMatchObject({ name: 'AA Resort', bookings: 2 })
    expect(second).toEqual(first)
  })
})
