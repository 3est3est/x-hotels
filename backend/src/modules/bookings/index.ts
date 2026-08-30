import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import { authPlugin, type Auth } from '../auth'
import * as service from './service'
import { bookingIdParams, createBookingBody } from './model'

export function bookings({ db, auth }: { db: Db; auth: Auth }) {
  return new Elysia({ name: 'bookings' })
    .use(authPlugin({ auth }))
    .post(
      '/bookings',
      ({ user, body }) => service.createBooking(db, user.id, body),
      {
        body: createBookingBody,
        verified: true,
      },
    )
    .get('/bookings', ({ user }) => service.listBookings(db, user.id), {
      session: true,
    })
    .get('/bookings/:id', ({ user, params }) => service.getBooking(db, user.id, params.id), {
      params: bookingIdParams,
      session: true,
    })
    .post(
      '/bookings/:id/cancel',
      ({ user, params }) => service.cancelBooking(db, user.id, params.id),
      {
        params: bookingIdParams,
        verified: true,
      },
    )
}
