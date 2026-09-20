import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'
import { errorResponse } from '../errors'
import { CANCELLED, CHECKED_IN, CONFIRMED } from './state'

export const bookingStatusSchema = t.Union([
  t.Literal(CONFIRMED),
  t.Literal(CANCELLED),
  t.Literal(CHECKED_IN),
])

/**
 * The single Booking representation returned by every Booking route —
 * identifies the Hotel with its Region and Country (Spec 0001, user story 15;
 * Spec 0003 adds the Country) and names the booker by their domain role (guestId).
 */
export const bookingRepresentation = t.Object({
  id: t.Integer(),
  guestId: t.String(),
  hotelId: t.Integer(),
  hotelName: t.String(),
  regionName: t.String(),
  countryName: t.String(),
  roomTypeId: t.Integer(),
  roomTypeName: t.String(),
  numGuests: t.Integer(),
  checkInDate: t.String(),
  checkOutDate: t.String(),
  nights: t.Integer(),
  status: bookingStatusSchema,
  checkedInAt: t.Union([t.Date(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

export type BookingRepresentation = Static<typeof bookingRepresentation>

export const createBookingBody = t.Object({
  hotelId: t.Integer({ minimum: 1 }),
  roomTypeId: t.Integer({ minimum: 1 }),
  numGuests: t.Integer({ minimum: 1 }),
  checkInDate: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
  nights: t.Integer({ minimum: 1 }),
})

export const createBookingResponse = { 201: bookingRepresentation, 400: errorResponse }
export const listBookingsResponse = { 200: t.Array(bookingRepresentation) }
export const getBookingResponse = { 200: bookingRepresentation, 404: errorResponse }
export const cancelBookingResponse = {
  200: bookingRepresentation,
  404: errorResponse,
  409: errorResponse,
}
