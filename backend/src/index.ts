import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { env } from 'cloudflare:workers'
import { createApp, type App } from './app'
import { createDb } from './db/driver'
import { createCloudinary } from './services/cloudinary'

let app: App | undefined

export default {
  fetch(request: Request) {
    app ??= createApp(
      {
        db: createDb(env.DATABASE_URL),
        cloudinary: createCloudinary({
          cloudName: env.CLOUDINARY_CLOUD_NAME,
          apiKey: env.CLOUDINARY_API_KEY,
          apiSecret: env.CLOUDINARY_API_SECRET,
        }),
        authSecret: env.BETTER_AUTH_SECRET,
        authUrl: env.BETTER_AUTH_URL,
      },
      { adapter: CloudflareAdapter },
    ).compile()

    return app.fetch(request)
  },
}
