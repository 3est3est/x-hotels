import { and, eq } from 'drizzle-orm'
import type { Db } from '../../db/types'
import { bookings as bookingsTable, type BookingStatus } from '../../db/schema'

/**
 * The Booking state machine (Spec 0001): a Booking is CONFIRMED until the Guest
 * cancels it or Hotel Management records the Actual Check-in. Exactly three
 * statuses, two transitions. This module is the only owner of the transition
 * rules; callers decide *who* may ask (ownership / role) before applying.
 */
export const CONFIRMED = 'CONFIRMED' as const
export const CANCELLED = 'CANCELLED' as const
export const CHECKED_IN = 'CHECKED_IN' as const

export type BookingTransition = 'cancel' | 'check-in'

const transitions: Record<BookingTransition, { to: BookingStatus; conflict: string }> = {
  cancel: { to: CANCELLED, conflict: 'Only confirmed bookings can be cancelled' },
  'check-in': { to: CHECKED_IN, conflict: 'Only confirmed bookings can be checked in' },
}

export type BookingTransitionResult = { ok: true } | { ok: false; conflict: string }

/** The state columns a transition needs; ownership checks stay with the caller. */
export async function loadBooking(db: Db, id: number) {
  const [booking] = await db
    .select({ id: bookingsTable.id, status: bookingsTable.status, userId: bookingsTable.userId })
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1)
  return booking
}

/**
 * Applies a transition legal only from CONFIRMED, as a conditional update so
 * racing transitions lose exactly once and answer 409 with the conflict reply.
 */
export async function applyBookingTransition(
  db: Db,
  booking: { id: number; status: BookingStatus },
  transition: BookingTransition,
): Promise<BookingTransitionResult> {
  const rule = transitions[transition]
  if (booking.status !== CONFIRMED) {
    return { ok: false, conflict: rule.conflict }
  }

  const [updated] = await db
    .update(bookingsTable)
    .set(
      transition === 'check-in'
        ? { status: rule.to, checkedInAt: new Date(), updatedAt: new Date() }
        : { status: rule.to, updatedAt: new Date() },
    )
    .where(and(eq(bookingsTable.id, booking.id), eq(bookingsTable.status, CONFIRMED)))
    .returning()
  if (!updated) {
    return { ok: false, conflict: rule.conflict }
  }

  return { ok: true }
}
