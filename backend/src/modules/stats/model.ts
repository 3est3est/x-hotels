import { t } from 'elysia'

const mostBookedEntry = t.Object({
  id: t.Integer(),
  name: t.String(),
  bookings: t.Integer(),
})

export const statsResponse = t.Object({
  totalBookings: t.Integer(),
  actualCheckIns: t.Integer(),
  checkInPercentage: t.Number(),
  mostBookedRoomType: t.Union([mostBookedEntry, t.Null()]),
  mostBookedHotel: t.Union([mostBookedEntry, t.Null()]),
  mostBookedRegion: t.Union([mostBookedEntry, t.Null()]),
})
