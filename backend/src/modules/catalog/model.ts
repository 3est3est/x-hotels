import { t } from 'elysia'

export const hotelListQuery = t.Object({
  regionId: t.Optional(t.Numeric()),
  q: t.Optional(t.String()),
})

export const idParams = t.Object({ id: t.Integer({ minimum: 1 }) })
