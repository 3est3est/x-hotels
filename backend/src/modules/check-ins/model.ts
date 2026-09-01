import { t } from 'elysia'
import { errorResponse } from '../errors'
import { bookingRow } from '../bookings/model'
import { idParams } from '../params'

export const bookingIdParams = idParams

export const checkInResponse = { 200: bookingRow, 404: errorResponse, 409: errorResponse }
