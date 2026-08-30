import { eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { user as usersTable, type IdentityDocumentType } from '../../db/schema'
import type { CloudinaryService } from '../../services/cloudinary'

export function prepareVerificationUpload(cloudinary: CloudinaryService, userId: string) {
  return cloudinary.signUpload({ folder: `identity/${userId}` })
}

export async function verifyIdentity(
  db: Db,
  cloudinary: CloudinaryService,
  userId: string,
  documentType: IdentityDocumentType,
  publicId: string,
) {
  const asset = await cloudinary.findIdentityAsset(publicId)
  if (!asset || !publicId.startsWith(`identity/${userId}/`)) {
    return status(422, { error: 'Identity document not found' })
  }

  await db
    .update(usersTable)
    .set({
      idDocumentType: documentType,
      idDocumentUrl: asset.url,
      idDocumentPublicId: asset.publicId,
      verifiedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))

  return { verified: true }
}
