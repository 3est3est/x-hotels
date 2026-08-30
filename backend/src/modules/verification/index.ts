import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import { authPlugin, type Auth } from '../auth'
import type { CloudinaryService } from '../../services/cloudinary'
import * as service from './service'
import { verificationBody, verificationSignatureBody } from './model'

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
        session: true,
      },
    )
    .post(
      '/identity-verification',
      ({ user, body }) =>
        service.verifyIdentity(db, cloudinary, user.id, body.documentType, body.publicId),
      {
        body: verificationBody,
        session: true,
      },
    )
}
