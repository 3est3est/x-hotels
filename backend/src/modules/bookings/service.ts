import { and, desc, eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { bookings as bookingsTable, hotels, regions, roomTypes } from '../../db/schema'

function checkOutDate(checkInDate: string, nights: number): string {
  const date = new Date(`${checkInDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + nights)
  return date.toISOString().slice(0, 10)
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
  const [room] = await db
    .select()
    .from(roomTypes)
    .where(eq(roomTypes.id, body.roomTypeId))
    .limit(1)
  if (!room || room.hotelId !== body.hotelId) {
    return status(400, { error: 'Room type does not belong to the hotel' })
  }
  if (body.numGuests > room.capacity) {
    return status(400, { error: `Room type capacity is ${room.capacity}` })
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({ userId, ...body })
    .returning()

  return status(201, {
    ...booking,
    checkOutDate: checkOutDate(booking.checkInDate, booking.nights),
  })
}

export async function listBookings(db: Db, userId: string) {
  const rows = await db
    .select({
      id: bookingsTable.id,
      hotelId: bookingsTable.hotelId,
      hotelName: hotels.name,
      regionName: regions.name,
      roomTypeId: bookingsTable.roomTypeId,
      roomTypeName: roomTypes.name,
      numGuests: bookingsTable.numGuests,
      checkInDate: bookingsTable.checkInDate,
      nights: bookingsTable.nights,
      status: bookingsTable.status,
      createdAt: bookingsTable.createdAt,
    })
    .from(bookingsTable)
    .innerJoin(hotels, eq(hotels.id, bookingsTable.hotelId))
    .innerJoin(regions, eq(regions.id, hotels.regionId))
    .innerJoin(roomTypes, eq(roomTypes.id, bookingsTable.roomTypeId))
    .where(eq(bookingsTable.userId, userId))
    .orderBy(desc(bookingsTable.id))

  return rows.map((row) => ({ ...row, checkOutDate: checkOutDate(row.checkInDate, row.nights) }))
}

export async function getBooking(db: Db, userId: string, id: number) {
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(and(eq(bookingsTable.id, id), eq(bookingsTable.userId, userId)))
    .limit(1)
  if (!booking) return status(404, { error: 'Booking not found' })

  return { ...booking, checkOutDate: checkOutDate(booking.checkInDate, booking.nights) }
}

export async function cancelBooking(db: Db, userId: string, id: number) {
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1)
  if (!booking || booking.userId !== userId) {
    return status(404, { error: 'Booking not found' })
  }
  if (booking.status !== 'CONFIRMED') {
    return status(409, { error: 'Only confirmed bookings can be cancelled' })
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: 'CANCELLED', updatedAt: new Date() })
    .where(and(eq(bookingsTable.id, booking.id), eq(bookingsTable.status, 'CONFIRMED')))
    .returning()
  if (!updated) return status(409, { error: 'Only confirmed bookings can be cancelled' })

  return updated
}
