import { t } from 'elysia'

const topEntity = t.Object({
  id: t.Integer(),
  name: t.String(),
  bookings: t.Integer(),
})

export const statsResponse = t.Object({
  totalBookings: t.Integer(),
  actualCheckIns: t.Integer(),
  checkInPercentage: t.Number(),
  mostBookedRoomType: t.Union([topEntity, t.Null()]),
  mostBookedHotel: t.Union([topEntity, t.Null()]),
  mostBookedRegion: t.Union([topEntity, t.Null()]),
})
