import { t } from 'elysia'
import { errorResponse } from '../errors'

export const identityDocumentTypeSchema = t.Union([
  t.Literal('id_card'),
  t.Literal('passport'),
])

export const verificationBody = t.Object({
  documentType: identityDocumentTypeSchema,
  documentNumber: t.String(),
})

export const verificationResponse = {
  200: t.Object({ verified: t.Boolean() }),
  422: errorResponse,
}

