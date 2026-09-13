import { Elysia } from 'elysia'
import type { AppContext } from '../../context'
import { authPlugin } from '../auth'
import * as service from './service'
import { statsResponse } from './model'

export function stats({ db, auth }: AppContext) {
  return new Elysia({ name: 'stats' })
    .use(authPlugin({ auth }))
    .get('/management/stats', () => service.getStats(db), {
      response: statsResponse,
      detail: { tags: ['stats'] },
      session: 'management',
    })
}
