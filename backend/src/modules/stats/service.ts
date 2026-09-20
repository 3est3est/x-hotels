import { asc, count, desc, eq, sql } from 'drizzle-orm'
import type { Db } from '../../db/types'
import { bookings as bookingsTable, countries, hotels, regions, roomTypes } from '../../db/schema'
import { CHECKED_IN } from '../bookings/state'

const actualCheckInsExpr = sql`count(*) filter (where ${bookingsTable.status} = ${CHECKED_IN})`

export async function getStats(db: Db) {
  const [totals] = await db
    .select({
      totalBookings: count(),
      actualCheckIns: actualCheckInsExpr.mapWith(Number),
      checkInPercentage:
        sql`case when count(*) = 0 then 0 else ${actualCheckInsExpr} * 100.0 / count(*)::numeric end`.mapWith(
          Number,
        ),
    })
    .from(bookingsTable)

  const [mostBookedRoomType] = await db
    .select({ id: roomTypes.id, name: roomTypes.name, bookings: count() })
    .from(bookingsTable)
    .innerJoin(roomTypes, eq(roomTypes.id, bookingsTable.roomTypeId))
    .groupBy(roomTypes.id, roomTypes.name)
    .orderBy(desc(count()), asc(roomTypes.name), asc(roomTypes.id))
    .limit(1)

  const [mostBookedHotel] = await db
    .select({ id: hotels.id, name: hotels.name, bookings: count() })
    .from(bookingsTable)
    .innerJoin(hotels, eq(hotels.id, bookingsTable.hotelId))
    .groupBy(hotels.id, hotels.name)
    .orderBy(desc(count()), asc(hotels.name), asc(hotels.id))
    .limit(1)

  const [mostBookedRegion] = await db
    .select({ id: regions.id, name: regions.name, bookings: count() })
    .from(bookingsTable)
    .innerJoin(hotels, eq(hotels.id, bookingsTable.hotelId))
    .innerJoin(regions, eq(regions.id, hotels.regionId))
    .groupBy(regions.id, regions.name)
    .orderBy(desc(count()), asc(regions.name), asc(regions.id))
    .limit(1)

  const [mostBookedCountry] = await db
    .select({ id: countries.id, name: countries.name, bookings: count() })
    .from(bookingsTable)
    .innerJoin(hotels, eq(hotels.id, bookingsTable.hotelId))
    .innerJoin(regions, eq(regions.id, hotels.regionId))
    .innerJoin(countries, eq(countries.id, regions.countryId))
    .groupBy(countries.id, countries.name)
    .orderBy(desc(count()), asc(countries.name), asc(countries.id))
    .limit(1)

  return {
    totalBookings: totals.totalBookings,
    actualCheckIns: totals.actualCheckIns,
    checkInPercentage: totals.checkInPercentage,
    mostBookedRoomType: mostBookedRoomType ?? null,
    mostBookedHotel: mostBookedHotel ?? null,
    mostBookedRegion: mostBookedRegion ?? null,
    mostBookedCountry: mostBookedCountry ?? null,
  }
}
