import { t } from 'elysia'
import { errorResponse } from '../errors'

export interface TopEntity {
  id: number
  name: string
  bookings: number
}

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

export { errorResponse }
