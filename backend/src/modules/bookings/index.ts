import { Elysia } from 'elysia'
import type { AppContext } from '../../context'
import { authPlugin } from '../auth'
import * as service from './service'
import { idParams } from '../params'
import {
  createBookingBody,
  createBookingResponse,
  cancelBookingResponse,
  getBookingResponse,
  listBookingsResponse,
} from './model'

export function bookings({ db, auth }: AppContext) {
  return new Elysia({ name: 'bookings' })
    .use(authPlugin({ auth }))
    .post(
      '/bookings',
      ({ user, body }) => service.createBooking(db, user.id, body),
      {
        body: createBookingBody,
        response: createBookingResponse,
        detail: { tags: ['bookings'] },
        session: 'verified',
      },
    )
    .get('/bookings', ({ user }) => service.listBookings(db, user.id), {
      response: listBookingsResponse,
      detail: { tags: ['bookings'] },
      session: true,
    })
    .get('/bookings/:id', ({ user, params }) => service.getBooking(db, user.id, params.id), {
      params: idParams,
      response: getBookingResponse,
      detail: { tags: ['bookings'] },
      session: true,
    })
    .post(
      '/bookings/:id/cancel',
      ({ user, params }) => service.cancelBooking(db, user.id, params.id),
      {
        params: idParams,
        response: cancelBookingResponse,
        detail: { tags: ['bookings'] },
        session: 'verified',
      },
    )
}
