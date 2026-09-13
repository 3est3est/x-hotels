import { status } from 'elysia'
import type { Db } from '../../db/types'
import { bookingRepresentationById } from '../bookings/service'
import { applyBookingTransition, loadBooking } from '../bookings/state'

export async function checkIn(db: Db, id: number) {
  const booking = await loadBooking(db, id)
  if (!booking) return status(404, { error: 'Booking not found' })

  const transitioned = await applyBookingTransition(db, booking, 'check-in')
  if (!transitioned.ok) {
    return status(409, { error: transitioned.conflict })
  }

  return (await bookingRepresentationById(db, id))!
}
