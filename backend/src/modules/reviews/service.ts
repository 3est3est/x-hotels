import { and, eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { bookings as bookingsTable, hotels, reviews } from '../../db/schema'
import { CHECKED_IN } from '../bookings/state'

/** A Review seen by its author: the booker is named by their domain role. */
function asGuestReview<T extends { userId: string }>(row: T) {
  const { userId, ...fields } = row
  return { ...fields, guestId: userId }
}

export async function createReview(
  db: Db,
  userId: string,
  hotelId: number,
  body: { rating: number; message?: string },
) {
  const [hotel] = await db.select().from(hotels).where(eq(hotels.id, hotelId)).limit(1)
  if (!hotel) return status(404, { error: 'Hotel not found' })

  const [checkedInBooking] = await db
    .select({ id: bookingsTable.id })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.userId, userId),
        eq(bookingsTable.hotelId, hotel.id),
        eq(bookingsTable.status, CHECKED_IN),
      ),
    )
    .limit(1)
  if (!checkedInBooking) {
    return status(403, { error: 'Only guests who checked in can review this hotel' })
  }

  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.hotelId, hotel.id)))
    .limit(1)
  if (existing) return status(409, { error: 'You already reviewed this hotel' })

  const [review] = await db
    .insert(reviews)
    .values({ userId, hotelId, rating: body.rating, message: body.message })
    .returning()

  return status(201, asGuestReview(review))
}

export async function updateReview(
  db: Db,
  userId: string,
  id: number,
  body: { rating?: number; message?: string | null },
) {
  const [review] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1)
  if (!review || review.userId !== userId) {
    return status(404, { error: 'Review not found' })
  }

  const [updated] = await db
    .update(reviews)
    .set({
      rating: body.rating ?? review.rating,
      message: body.message === undefined ? review.message : body.message,
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, review.id))
    .returning()

  return asGuestReview(updated)
}
