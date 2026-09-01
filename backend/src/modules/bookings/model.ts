import { t } from 'elysia'
import type { Static } from '@sinclair/typebox'
import { idParams } from '../params'
import { errorResponse } from '../errors'

export const bookingStatusSchema = t.Union([
  t.Literal('CONFIRMED'),
  t.Literal('CANCELLED'),
  t.Literal('CHECKED_IN'),
])

export const bookingRow = t.Object({
  id: t.Integer(),
  userId: t.String(),
  hotelId: t.Integer(),
  roomTypeId: t.Integer(),
  numGuests: t.Integer(),
  checkInDate: t.String(),
  nights: t.Integer(),
  status: bookingStatusSchema,
  checkedInAt: t.Union([t.Date(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

export const bookingWithCheckOut = t.Object({
  ...bookingRow.properties,
  checkOutDate: t.String(),
})

export const bookingListRow = t.Object({
  id: t.Integer(),
  hotelId: t.Integer(),
  hotelName: t.String(),
  regionName: t.String(),
  roomTypeId: t.Integer(),
  roomTypeName: t.String(),
  numGuests: t.Integer(),
  checkInDate: t.String(),
  nights: t.Integer(),
  status: bookingStatusSchema,
  createdAt: t.Date(),
  checkOutDate: t.String(),
})

export type BookingListRow = Static<typeof bookingListRow>

export const createBookingBody = t.Object({
  hotelId: t.Integer({ minimum: 1 }),
  roomTypeId: t.Integer({ minimum: 1 }),
  numGuests: t.Integer({ minimum: 1 }),
  checkInDate: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
  nights: t.Integer({ minimum: 1 }),
})

export const bookingIdParams = idParams

export const createBookingResponse = { 201: bookingWithCheckOut, 400: errorResponse }
export const listBookingsResponse = { 200: t.Array(bookingListRow) }
export const getBookingResponse = { 200: bookingWithCheckOut, 404: errorResponse }
export const cancelBookingResponse = { 200: bookingRow, 404: errorResponse, 409: errorResponse }
