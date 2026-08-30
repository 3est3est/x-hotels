import { t } from 'elysia'

export const createReviewBody = t.Object({
  rating: t.Integer({ minimum: 0, maximum: 5 }),
  comment: t.Optional(t.String()),
})

export const updateReviewBody = t.Object({
  rating: t.Optional(t.Integer({ minimum: 0, maximum: 5 })),
  comment: t.Optional(t.String()),
})

export const reviewIdParams = t.Object({ id: t.Integer({ minimum: 1 }) })
export const hotelIdParams = t.Object({ id: t.Integer({ minimum: 1 }) })
