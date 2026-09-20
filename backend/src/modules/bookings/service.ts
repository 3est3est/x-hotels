import { and, desc, eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { bookings as bookingsTable, countries, hotels, regions, roomTypes } from '../../db/schema'
import { applyBookingTransition, loadBooking } from './state'

function checkOutDate(checkInDate: string, nights: number): string {
  const date = new Date(`${checkInDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + nights)
  return date.toISOString().slice(0, 10)
}

function isCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const bookingColumns = {
  id: bookingsTable.id,
  guestId: bookingsTable.userId,
  hotelId: bookingsTable.hotelId,
  hotelName: hotels.name,
  regionName: regions.name,
  countryName: countries.name,
  roomTypeId: bookingsTable.roomTypeId,
  roomTypeName: roomTypes.name,
  numGuests: bookingsTable.numGuests,
  checkInDate: bookingsTable.checkInDate,
  nights: bookingsTable.nights,
  status: bookingsTable.status,
  checkedInAt: bookingsTable.checkedInAt,
  createdAt: bookingsTable.createdAt,
  updatedAt: bookingsTable.updatedAt,
}

function bookingsJoined(db: Db) {
  return db
    .select(bookingColumns)
    .from(bookingsTable)
    .innerJoin(hotels, eq(hotels.id, bookingsTable.hotelId))
    .innerJoin(regions, eq(regions.id, hotels.regionId))
    .innerJoin(countries, eq(countries.id, regions.countryId))
    .innerJoin(roomTypes, eq(roomTypes.id, bookingsTable.roomTypeId))
}

function toRepresentation<T extends { checkInDate: string; nights: number }>(row: T) {
  return { ...row, checkOutDate: checkOutDate(row.checkInDate, row.nights) }
}

/** The single Booking representation — Hotel/Region/Country/Room Type identity per story 15. */
export async function bookingRepresentationById(db: Db, id: number) {
  const [row] = await bookingsJoined(db)
    .where(eq(bookingsTable.id, id))
    .limit(1)
  return row ? toRepresentation(row) : undefined
}

export async function createBooking(
  db: Db,
  userId: string,
  body: {
    hotelId: number
    roomTypeId: number
    numGuests: number
    checkInDate: string
    nights: number
  },
) {
  const [roomType] = await db
    .select()
    .from(roomTypes)
    .where(eq(roomTypes.id, body.roomTypeId))
    .limit(1)
  if (!roomType || roomType.hotelId !== body.hotelId) {
    return status(400, { error: 'Room type does not belong to the hotel' })
  }
  if (!isCalendarDate(body.checkInDate)) {
    return status(400, { error: 'Invalid check-in date' })
  }

  const [inserted] = await db
    .insert(bookingsTable)
    .values({ userId, ...body })
    .returning()

  return status(201, (await bookingRepresentationById(db, inserted.id))!)
}

export async function listBookings(db: Db, userId: string) {
  const rows = await bookingsJoined(db)
    .where(eq(bookingsTable.userId, userId))
    .orderBy(desc(bookingsTable.id))

  return rows.map(toRepresentation)
}

export async function getBooking(db: Db, userId: string, id: number) {
  const [row] = await bookingsJoined(db)
    .where(and(eq(bookingsTable.id, id), eq(bookingsTable.userId, userId)))
    .limit(1)
  if (!row) return status(404, { error: 'Booking not found' })

  return toRepresentation(row)
}

export async function cancelBooking(db: Db, userId: string, id: number) {
  const booking = await loadBooking(db, id)
  if (!booking || booking.userId !== userId) {
    return status(404, { error: 'Booking not found' })
  }

  const transitioned = await applyBookingTransition(db, booking, 'cancel')
  if (!transitioned.ok) {
    return status(409, { error: transitioned.conflict })
  }

  return (await bookingRepresentationById(db, id))!
}
