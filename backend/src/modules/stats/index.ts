import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import { authPlugin, type Auth } from '../auth'
import * as service from './service'
import { statsResponse } from './model'

export function stats({ db, auth }: { db: Db; auth: Auth }) {
  return new Elysia({ name: 'stats' })
    .use(authPlugin({ auth }))
    .get('/admin/stats', () => service.getStats(db), {
      response: statsResponse,
      detail: { tags: ['stats'] },
      session: 'management',
    })
}
