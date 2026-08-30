import { t } from 'elysia'

export const createBookingBody = t.Object({
  hotelId: t.Integer({ minimum: 1 }),
  roomTypeId: t.Integer({ minimum: 1 }),
  numGuests: t.Integer({ minimum: 1 }),
  checkInDate: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
  nights: t.Integer({ minimum: 1 }),
})

export const bookingIdParams = t.Object({ id: t.Integer({ minimum: 1 }) })
