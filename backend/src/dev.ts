import { createAppFromEnv } from './env'

const env = process.env as Record<string, string | undefined>

const missing = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'CLOUDINARY_CLOUD_NAME'].filter(
  (key) => !env[key],
)

if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')} (put them in .env)`)
}

createAppFromEnv(env as never).listen(3000)
