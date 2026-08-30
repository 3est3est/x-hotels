import { t } from 'elysia'

export const idParams = t.Object({ id: t.Integer({ minimum: 1 }) })
