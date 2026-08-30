import { createAppFromEnv, type AppEnv } from './env'

const env = process.env as Record<string, string | undefined>

const required = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const

const missing = required.filter((key) => !env[key])
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')} (put them in .env)`)
}

const appEnv: AppEnv = {
  DATABASE_URL: env.DATABASE_URL!,
  BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET!,
}

createAppFromEnv(appEnv).listen(3000)
