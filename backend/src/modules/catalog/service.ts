import { and, asc, desc, eq, ilike } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { hotels, regions, reviews, roomTypes } from '../../db/schema'

export function listRegions(db: Db) {
  return db.select({ id: regions.id, name: regions.name }).from(regions).orderBy(asc(regions.name))
}

export function listHotels(db: Db, query: { regionId?: number; q?: string }) {
  const filters = []
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
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(hotels.name))
}

export async function getHotelDetail(db: Db, id: number) {
  const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id)).limit(1)
  if (!hotel) return status(404, { error: 'Hotel not found' })

  const rooms = await db
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
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.hotelId, hotel.id))
    .orderBy(desc(reviews.id))

  const avgRating =
    hotelReviews.length > 0
      ? hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length
      : null

  return { ...hotel, roomTypes: rooms, reviews: hotelReviews, avgRating }
}
