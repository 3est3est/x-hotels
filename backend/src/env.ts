import { createApp } from './app'
import { createDb } from './db/driver'
import { createCloudinary } from './services/cloudinary'

export interface AppEnv {
  DATABASE_URL: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  CORS_ORIGINS?: string
}

export function parseCorsOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function createAppFromEnv(env: AppEnv) {
  return createApp({
    db: createDb(env.DATABASE_URL),
    cloudinary: createCloudinary({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    }),
    authSecret: env.BETTER_AUTH_SECRET,
    authUrl: env.BETTER_AUTH_URL,
    corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
  })
}
