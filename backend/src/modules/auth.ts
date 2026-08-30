import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Elysia } from 'elysia'
import * as schema from '../db/schema'
import type { Db } from '../db/types'

export type Auth = ReturnType<typeof createAuth>

export function createAuth({ db, secret, url }: { db: Db; secret: string; url: string }) {
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
    trustedOrigins: [url],
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'guest', input: false },
        idDocumentType: { type: 'string', required: false, input: false },
        idDocumentUrl: { type: 'string', required: false, input: false },
        idDocumentPublicId: { type: 'string', required: false, input: false },
        verifiedAt: { type: 'date', required: false, input: false },
      },
    },
  })
}

export function authPlugin({ auth }: { auth: Auth }) {
  const sessionMacro = (deny?: (user: Record<string, any>) => string | null) => ({
    resolve: async (ctx: { status: any; request: Request }) => {
      const result = await auth.api.getSession({ headers: ctx.request.headers })
      if (!result) return ctx.status(401, { error: 'Authentication required' })
      const denial = deny?.(result.user as unknown as Record<string, any>)
      if (denial) return ctx.status(403, { error: denial })
      return { user: result.user, session: result.session }
    },
  })

  return new Elysia({ name: 'better-auth' })
    .mount(auth.handler)
    .macro({
      session: sessionMacro(),
      verified: sessionMacro((user) =>
        user.verifiedAt ? null : 'Identity verification required',
      ),
      management: sessionMacro((user) =>
        user.role === 'management' ? null : 'Management role required',
      ),
    })
}
