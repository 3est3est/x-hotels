import { Elysia, type ElysiaConfig } from 'elysia'
import { cors } from '@elysiajs/cors'
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
export type App = ReturnType<typeof createApp>

export interface AppOptions {
  adapter?: any
  precompile?: boolean
}

export function createApp(
  {
    db,
    cloudinary,
    authSecret,
    authUrl,
    corsOrigins = [],
  }: {
    db: Db
    cloudinary: CloudinaryService
    authSecret: string
    authUrl: string
    corsOrigins?: string[]
  },
  options?: AppOptions,
) {
  const auth = createAuth({ db, secret: authSecret, url: authUrl, corsOrigins })

  return new Elysia(options as ElysiaConfig<''>)
    .use(cors({ origin: corsOrigins, credentials: true }))
    .get('/', () => 'hello elysia')
    .get('/health', () => ({ ok: true }))
    .onError(({ error }) => {
      console.error(error)
    })
    .use(authPlugin({ auth }))
    .use(verification({ db, cloudinary, auth }))
    .use(catalog({ db }))
    .use(bookings({ db, auth }))
    .use(checkIns({ db, auth }))
    .use(reviewsModule({ db, auth }))
    .use(stats({ db, auth }))
}
