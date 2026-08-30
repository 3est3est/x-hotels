import { t } from 'elysia'

export const identityDocumentTypeSchema = t.Union([
  t.Literal('id_card'),
  t.Literal('passport'),
])

export const verificationSignatureBody = t.Object({
  documentType: identityDocumentTypeSchema,
})

export const verificationBody = t.Object({
  documentType: identityDocumentTypeSchema,
  publicId: t.String(),
})
