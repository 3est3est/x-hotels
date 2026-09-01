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

const secret = env.BETTER_AUTH_SECRET!
if (secret.startsWith('change-me') || secret.length < 32) {
  throw new Error(
    'BETTER_AUTH_SECRET is a placeholder or too short — generate one with `openssl rand -base64 32` in .env',
  )
}

const appEnv: AppEnv = {
  DATABASE_URL: env.DATABASE_URL!,
  BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET!,
}

createAppFromEnv(appEnv).listen(3000, () =>
  console.log('elysia — backend listening on http://localhost:3000'),
)
