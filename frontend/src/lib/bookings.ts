import { useCallback } from 'react'
import { api, errorMessage } from './api'
import { useResource, type Resource } from './hooks'
import type { Booking } from './types'

export function useBookings(): Resource<Booking[]> {
  const load = useCallback(async () => {
    const response = await api.bookings.get()
    if (response.error) throw response.error
    return response.data ?? []
  }, [])
  return useResource(load)
}

export type ManagementBooking = NonNullable<
  Awaited<ReturnType<typeof api.management.bookings.get>>['data']
>[number]

/** Every booking in the system with the booking guest. Management only. */
export function useManagementBookings(): Resource<ManagementBooking[]> {
  const load = useCallback(async () => {
    const response = await api.management.bookings.get()
    if (response.error) throw response.error
    return response.data ?? []
  }, [])
  return useResource(load)
}

export type CreateBookingInput = {
  hotelId: number
  roomTypeId: number
  numGuests: number
  checkInDate: string
  nights: number
}

/** A thin wrapper over the create call that throws the server's message on any non-201. */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const response = await api.bookings.post(input)
  if (response.error || !response.data) {
    throw new Error(errorMessage(response.error, 'Booking failed'))
  }
  return response.data
}

export async function cancelBooking(id: number): Promise<Booking> {
  const response = await api.bookings({ id }).cancel.post()
  if (response.error || !response.data) {
    throw new Error(errorMessage(response.error, 'Cancellation failed'))
  }
  return response.data
}