import { Elysia } from 'elysia'
import type { AppContext } from '../../context'
import { authPlugin } from '../auth'
import * as service from './service'
import { verificationBody, signatureResponse, verificationResponse } from './model'

export function verification({ db, cloudinary, auth }: AppContext) {
  return new Elysia({ name: 'verification' })
    .use(authPlugin({ auth }))
    .post(
      '/identity-verification/signature',
      ({ user }) => service.prepareVerificationUpload(cloudinary, user.id),
      {
        response: signatureResponse,
        detail: { tags: ['identity-verification'] },
        session: true,
      },
    )
    .post(
      '/identity-verification',
      ({ user, body }) =>
        service.verifyIdentity(db, cloudinary, user.id, body.documentType, body.publicId),
      {
        body: verificationBody,
        response: verificationResponse,
        detail: { tags: ['identity-verification'] },
        session: true,
      },
    )
}
