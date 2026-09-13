import { Elysia, type ElysiaConfig } from 'elysia'
import { cors } from '@elysiajs/cors'
import { catalog } from './modules/catalog'
import { authPlugin, createAuth } from './modules/auth'
import { verification } from './modules/verification'
import { bookings } from './modules/bookings'
import { checkIns } from './modules/check-ins'
import { reviewsModule } from './modules/reviews'
import { stats } from './modules/stats'
import type { AppContext } from './context'
import type { CloudinaryService } from './services/cloudinary'
import type { Db } from './db/types'

export type { Db } from './db/types'
export type App = ReturnType<typeof createApp>

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
  config: ElysiaConfig<''> = {},
) {
  const auth = createAuth({ db, secret: authSecret, url: authUrl, corsOrigins })
  const context: AppContext = { db, cloudinary, auth }

  return new Elysia(config)
    .use(cors({ origin: corsOrigins, credentials: true }))
    .get('/', () => 'hello elysia')
    .get('/health', () => ({ ok: true }))
    .onError(({ error }) => {
      console.error(error)
    })
    .use(authPlugin({ auth }))
    .use(verification(context))
    .use(catalog(context))
    .use(bookings(context))
    .use(checkIns(context))
    .use(reviewsModule(context))
    .use(stats(context))
}
