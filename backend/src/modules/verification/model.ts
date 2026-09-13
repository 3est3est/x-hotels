import { t } from 'elysia'
import { errorResponse } from '../errors'

export const identityDocumentTypeSchema = t.Union([
  t.Literal('id_card'),
  t.Literal('passport'),
])

export const verificationBody = t.Object({
  documentType: identityDocumentTypeSchema,
  publicId: t.String(),
})

export const signatureResponse = t.Object({
  cloudName: t.String(),
  apiKey: t.String(),
  folder: t.String(),
  timestamp: t.Integer(),
  signature: t.String(),
})

export const verificationResponse = {
  200: t.Object({ verified: t.Boolean() }),
  422: errorResponse,
}
