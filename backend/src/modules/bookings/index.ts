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
  listManagementBookingsResponse,
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
        // ADR 0005: booking takes a plain signed-in session — the verified
        // gate (FR-06 flow) no longer fronts the guest path.
        session: true,
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
    .get('/management/bookings', () => service.listAllBookings(db), {
      response: listManagementBookingsResponse,
      detail: { tags: ['management'] },
      session: 'management',
    })
    .post(
      '/bookings/:id/cancel',
      ({ user, params }) => service.cancelBooking(db, user.id, params.id),
      {
        params: idParams,
        response: cancelBookingResponse,
        detail: { tags: ['bookings'] },
        // ADR 0005: same plain-session rule as creation.
        session: true,
      },
    )
}
