import { t } from 'elysia'
import { idParams } from '../params'

export const createBookingBody = t.Object({
  hotelId: t.Integer({ minimum: 1 }),
  roomTypeId: t.Integer({ minimum: 1 }),
  numGuests: t.Integer({ minimum: 1 }),
  checkInDate: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
  nights: t.Integer({ minimum: 1 }),
})

export const bookingIdParams = idParams
