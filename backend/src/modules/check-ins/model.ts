import { t } from 'elysia'

export const bookingIdParams = t.Object({ id: t.Integer({ minimum: 1 }) })
