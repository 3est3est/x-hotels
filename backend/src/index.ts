import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { env } from 'cloudflare:workers'
import { AsyncLocalStorage } from 'node:async_hooks'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { createApp, type Db } from './app'
import * as schema from './db/schema'
import { createCloudinary } from './services/cloudinary'
import { parseCorsOrigins } from './env'

const requestDb = new AsyncLocalStorage<Db>()

const lazyDb = new Proxy({} as Db, {
  get(_, prop) {
    if (prop === '_') return undefined
    const real = requestDb.getStore() as unknown as Record<string | symbol, unknown> | undefined
    if (!real) {
      throw new Error('Database accessed outside of a request context')
    }
    const value = real[prop]
    return typeof value === 'function' ? value.bind(real) : value
  },
})

const app = createApp(
  {
    db: lazyDb,
    cloudinary: createCloudinary({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    }),
    authSecret: env.BETTER_AUTH_SECRET,
    authUrl: env.BETTER_AUTH_URL,
    corsOrigins: parseCorsOrigins(env.CORS_ORIGINS as string | undefined),
  },
  { adapter: CloudflareAdapter, precompile: true },
).compile()

interface FetchCtx {
  waitUntil(promise: Promise<unknown>): void
}

export default {
  fetch(request: Request, _env: unknown, ctx: FetchCtx): Response | Promise<Response> {
    const client = postgres(env.HYPERDRIVE.connectionString, {
      prepare: false,
      max: 1,
      connect_timeout: 10,
      idle_timeout: 5,
    })
    const db = drizzle(client, { schema })
    const response = Promise.resolve(requestDb.run(db, () => app.fetch(request)))
    ctx.waitUntil(
      response
        .catch(() => undefined)
        .then(() => client.end({ timeout: 1 }))
        .catch(() => undefined),
    )
    return response
  },
}
