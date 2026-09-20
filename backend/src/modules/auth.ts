import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Elysia } from 'elysia'
import * as schema from '../db/schema'
import type { Db } from '../db/types'

export type Auth = ReturnType<typeof createAuth>

/** Better Auth user shape (incl. X Hotels additional fields) — from the auth instance's own $Infer. */
export type SessionUser = Auth['$Infer']['Session']['user']

export function createAuth({
  db,
  secret,
  url,
  corsOrigins = [],
}: {
  db: Db
  secret: string
  url: string
  corsOrigins?: string[]
}) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret,
    baseURL: url,
    basePath: '/api/auth',
    trustedOrigins: [url, ...corsOrigins],
    advanced: {
      defaultCookieAttributes: { sameSite: 'none', secure: true },
    },
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'guest', input: false },
        idDocumentType: { type: 'string', required: false, input: false },
        idDocumentNumber: { type: 'string', required: false, input: false },
        verifiedAt: { type: 'date', required: false, input: false },
      },
    },
  })
}

export function authPlugin({ auth }: { auth: Auth }) {
  type SessionLevel = true | 'verified' | 'management'

  return new Elysia({ name: 'better-auth' })
    .mount(auth.handler)
    .macro({
      session: (options?: SessionLevel) => ({
        resolve: async (ctx: { status: any; request: Request }) => {
          const result = await auth.api.getSession({ headers: ctx.request.headers })
          if (!result) return ctx.status(401, { error: 'Authentication required' })
          const level = options ?? true
          const denial =
            level === 'management' && result.user.role !== 'management'
              ? 'Management role required'
              : level === 'verified' && !result.user.verifiedAt
                ? 'Identity verification required'
                : null
          if (denial) return ctx.status(403, { error: denial })
          return { user: result.user, session: result.session }
        },
      }),
    })
}
