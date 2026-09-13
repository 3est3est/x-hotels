import { errorResponse } from '../errors'
import { bookingRepresentation } from '../bookings/model'

export const checkInResponse = {
  200: bookingRepresentation,
  404: errorResponse,
  409: errorResponse,
}
