import { and, asc, desc, eq, ilike } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { countries, hotels, regions, reviews, roomTypes } from '../../db/schema'

/** Countries with the Regions inside them. A Country without Regions still appears. */
export async function listCountries(db: Db) {
  const rows = await db
    .select({
      countryId: countries.id,
      countryName: countries.name,
      regionId: regions.id,
      regionName: regions.name,
    })
    .from(countries)
    .leftJoin(regions, eq(regions.countryId, countries.id))
    .orderBy(asc(countries.name), asc(regions.name))

  const byCountry = new Map<number, { id: number; name: string; regions: { id: number; name: string }[] }>()
  for (const row of rows) {
    let country = byCountry.get(row.countryId)
    if (!country) {
      country = { id: row.countryId, name: row.countryName, regions: [] }
      byCountry.set(row.countryId, country)
    }
    if (row.regionId !== null && row.regionName !== null) {
      country.regions.push({ id: row.regionId, name: row.regionName })
    }
  }

  return [...byCountry.values()]
}

export function listHotels(db: Db, query: { countryId?: number; regionId?: number; q?: string }) {
  const filters = []
  if (query.countryId !== undefined) filters.push(eq(regions.countryId, query.countryId))
  if (query.regionId !== undefined) filters.push(eq(hotels.regionId, query.regionId))
  if (query.q) filters.push(ilike(hotels.name, `%${query.q}%`))
  return db
    .select({
      id: hotels.id,
      regionId: hotels.regionId,
      name: hotels.name,
      description: hotels.description,
      images: hotels.images,
    })
    .from(hotels)
    .innerJoin(regions, eq(regions.id, hotels.regionId))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(hotels.name))
}

export async function getHotelDetail(db: Db, id: number) {
  const [hotel] = await db
    .select({
      id: hotels.id,
      regionId: hotels.regionId,
      regionName: regions.name,
      countryName: countries.name,
      name: hotels.name,
      description: hotels.description,
      images: hotels.images,
      createdAt: hotels.createdAt,
    })
    .from(hotels)
    .innerJoin(regions, eq(regions.id, hotels.regionId))
    .innerJoin(countries, eq(countries.id, regions.countryId))
    .where(eq(hotels.id, id))
    .limit(1)
  if (!hotel) return status(404, { error: 'Hotel not found' })

  const detailRoomTypes = await db
    .select({
      id: roomTypes.id,
      name: roomTypes.name,
      description: roomTypes.description,
      capacity: roomTypes.capacity,
      images: roomTypes.images,
    })
    .from(roomTypes)
    .where(eq(roomTypes.hotelId, hotel.id))
    .orderBy(asc(roomTypes.id))

  const hotelReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      message: reviews.message,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.hotelId, hotel.id))
    .orderBy(desc(reviews.id))

  const avgRating =
    hotelReviews.length > 0
      ? hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length
      : null

  return { ...hotel, roomTypes: detailRoomTypes, reviews: hotelReviews, avgRating }
}
