import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import { authPlugin, type Auth } from '../auth'
import * as service from './service'

export function stats({ db, auth }: { db: Db; auth: Auth }) {
  return new Elysia({ name: 'stats' })
    .use(authPlugin({ auth }))
    .get('/admin/stats', () => service.getStats(db), { management: true })
}
