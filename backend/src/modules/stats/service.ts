import { count, desc, eq } from 'drizzle-orm'
import type { Db } from '../../db/types'
import { bookings as bookingsTable, hotels, regions, roomTypes } from '../../db/schema'

export async function getStats(db: Db) {
  const [totals] = await db
    .select({
      totalBookings: count(),
      actualCheckIns: count(bookingsTable.checkedInAt),
    })
    .from(bookingsTable)

  const [mostBookedRoomType] = await db
    .select({ id: roomTypes.id, name: roomTypes.name, bookings: count() })
    .from(bookingsTable)
    .innerJoin(roomTypes, eq(roomTypes.id, bookingsTable.roomTypeId))
    .groupBy(roomTypes.id, roomTypes.name)
    .orderBy(desc(count()))
    .limit(1)

  const [mostBookedHotel] = await db
    .select({ id: hotels.id, name: hotels.name, bookings: count() })
    .from(bookingsTable)
    .innerJoin(hotels, eq(hotels.id, bookingsTable.hotelId))
    .groupBy(hotels.id, hotels.name)
    .orderBy(desc(count()))
    .limit(1)

  const [mostBookedRegion] = await db
    .select({ id: regions.id, name: regions.name, bookings: count() })
    .from(bookingsTable)
    .innerJoin(hotels, eq(hotels.id, bookingsTable.hotelId))
    .innerJoin(regions, eq(regions.id, hotels.regionId))
    .groupBy(regions.id, regions.name)
    .orderBy(desc(count()))
    .limit(1)

  const checkInPercentage =
    totals.totalBookings > 0 ? (totals.actualCheckIns / totals.totalBookings) * 100 : 0

  return {
    totalBookings: totals.totalBookings,
    actualCheckIns: totals.actualCheckIns,
    checkInPercentage,
    mostBookedRoomType: mostBookedRoomType ?? null,
    mostBookedHotel: mostBookedHotel ?? null,
    mostBookedRegion: mostBookedRegion ?? null,
  }
}
