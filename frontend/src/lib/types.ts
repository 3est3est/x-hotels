import { api } from './api'

/**
 * Response shapes read off the typed client rather than hand-written: each alias
 * is derived from the backend's Elysia response schemas, so a backend shape
 * change breaks the frontend build (the compile-time half of the Eden proof).
 */
export type Country = NonNullable<Awaited<ReturnType<typeof api.countries.get>>['data']>[number]
export type HotelSummary = NonNullable<Awaited<ReturnType<typeof api.hotels.get>>['data']>[number]
type HotelDetailRoute = ReturnType<typeof api.hotels>
export type HotelDetail = NonNullable<Awaited<ReturnType<HotelDetailRoute['get']>>['data']>
export type RoomType = HotelDetail['roomTypes'][number]
export type Review = HotelDetail['reviews'][number]
export type Booking = NonNullable<
  Awaited<ReturnType<typeof api.bookings.get>>['data']
>[number]
export type BookingStatus = Booking['status']
export type DocumentType = 'id_card' | 'passport'

export type HotelFilters = {
  countryId?: number
  regionId?: number
  q?: string
}