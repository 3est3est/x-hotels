import { Elysia } from 'elysia'
import type { AppContext } from '../../context'
import { authPlugin } from '../auth'
import * as service from './service'
import { idParams } from '../params'
import { checkInResponse } from './model'

export function checkIns({ db, auth }: AppContext) {
  return new Elysia({ name: 'check-ins' })
    .use(authPlugin({ auth }))
    .post('/management/bookings/:id/check-in', ({ params }) => service.checkIn(db, params.id), {
      params: idParams,
      response: checkInResponse,
      detail: { tags: ['check-ins'] },
      session: 'management',
    })
}
