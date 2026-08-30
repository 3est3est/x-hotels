import { Elysia, type AnyElysia, type ElysiaConfig } from 'elysia'
import { catalog } from './modules/catalog'
import { authPlugin, createAuth } from './modules/auth'
import { verification } from './modules/verification'
import { bookings } from './modules/bookings'
import { checkIns } from './modules/check-ins'
import { reviewsModule } from './modules/reviews'
import { stats } from './modules/stats'
import type { CloudinaryService } from './services/cloudinary'
import type { Db } from './db/types'

export type { Db } from './db/types'
export type App = AnyElysia

export interface AppOptions {
  adapter?: any
}

export function createApp(
  {
    db,
    cloudinary,
    authSecret,
    authUrl,
  }: {
    db: Db
    cloudinary: CloudinaryService
    authSecret: string
    authUrl: string
  },
  options?: AppOptions,
): App {
  const auth = createAuth({ db, secret: authSecret, url: authUrl })

  return new Elysia(options as ElysiaConfig<any>)
    .get('/health', () => ({ ok: true }))
    .use(authPlugin({ auth }))
    .use(verification({ db, cloudinary, auth }))
    .use(catalog({ db }))
    .use(bookings({ db, auth }))
    .use(checkIns({ db, auth }))
    .use(reviewsModule({ db, auth }))
    .use(stats({ db, auth }))
}
