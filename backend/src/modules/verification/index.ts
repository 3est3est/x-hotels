import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import { authPlugin, type Auth } from '../auth'
import type { CloudinaryService } from '../../services/cloudinary'
import * as service from './service'
import { verificationBody, verificationSignatureBody, signatureResponse, verificationResponse } from './model'

export function verification({
  db,
  cloudinary,
  auth,
}: {
  db: Db
  cloudinary: CloudinaryService
  auth: Auth
}) {
  return new Elysia({ name: 'verification' })
    .use(authPlugin({ auth }))
    .post(
      '/identity-verification/signature',
      ({ user }) => service.prepareVerificationUpload(cloudinary, user.id),
      {
        body: verificationSignatureBody,
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
