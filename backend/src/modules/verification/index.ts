import { Elysia } from 'elysia'
import type { AppContext } from '../../context'
import { authPlugin } from '../auth'
import * as service from './service'
import { verificationBody, verificationResponse } from './model'

export function verification({ db, auth }: AppContext) {
  return new Elysia({ name: 'verification' })
    .use(authPlugin({ auth }))
    .post(
      '/identity-verification',
      ({ user, body }) => service.verifyIdentity(db, user.id, body.documentType, body.documentNumber),
      {
        body: verificationBody,
        response: verificationResponse,
        detail: { tags: ['identity-verification'] },
        session: true,
      },
    )
}

