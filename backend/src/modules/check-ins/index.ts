import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import { authPlugin, type Auth } from '../auth'
import * as service from './service'
import { bookingIdParams } from './model'

export function checkIns({ db, auth }: { db: Db; auth: Auth }) {
  return new Elysia({ name: 'check-ins' })
    .use(authPlugin({ auth }))
    .post('/admin/bookings/:id/check-in', ({ params }) => service.checkIn(db, params.id), {
      params: bookingIdParams,
      management: true,
    })
}
