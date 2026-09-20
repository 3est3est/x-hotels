import { eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { Db } from '../../db/types'
import { user as usersTable, type IdentityDocumentType } from '../../db/schema'
import { isValidPassportNumber, isValidThaiNationalId, isValidTeudatZehut } from './validators'

/** Normalize a submitted document number before validation and before storage. */
export function normalizeDocumentNumber(documentType: IdentityDocumentType, raw: string): string {
  if (documentType === 'id_card') return raw.trim().replaceAll(/[\s-]/g, '')
  return raw.trim().toUpperCase()
}

export async function verifyIdentity(
  db: Db,
  userId: string,
  rawDocumentType: IdentityDocumentType,
  rawDocumentNumber: string,
) {
  const documentNumber = normalizeDocumentNumber(rawDocumentType, rawDocumentNumber)
  const valid =
    rawDocumentType === 'id_card'
      ? isValidThaiNationalId(documentNumber) || isValidTeudatZehut(documentNumber)
      : isValidPassportNumber(documentNumber)
  if (!valid) {
    return status(422, { error: 'Invalid document number' })
  }

  await db
    .update(usersTable)
    .set({
      idDocumentType: rawDocumentType,
      idDocumentNumber: documentNumber,
      verifiedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))

  return { verified: true }
}

