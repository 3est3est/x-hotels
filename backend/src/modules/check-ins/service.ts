import { Elysia } from 'elysia'
import { and, eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { bookings as bookingsTable } from '../../db/schema'

export async function checkIn(db: Db, id: number) {
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1)
  if (!booking) return status(404, { error: 'Booking not found' })
  if (booking.status !== 'CONFIRMED') {
    return status(409, { error: 'Only confirmed bookings can be checked in' })
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: 'CHECKED_IN', checkedInAt: new Date(), updatedAt: new Date() })
    .where(and(eq(bookingsTable.id, booking.id), eq(bookingsTable.status, 'CONFIRMED')))
    .returning()
  if (!updated) return status(409, { error: 'Booking is already checked in' })

  return updated
}
