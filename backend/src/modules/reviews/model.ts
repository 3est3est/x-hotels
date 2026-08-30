import { t } from 'elysia'
import { idParams } from '../params'

export const createReviewBody = t.Object({
  rating: t.Integer({ minimum: 0, maximum: 5 }),
  message: t.Optional(t.String()),
})

export const updateReviewBody = t.Object({
  rating: t.Optional(t.Integer({ minimum: 0, maximum: 5 })),
  message: t.Optional(t.Union([t.String(), t.Null()])),
})

export const reviewIdParams = idParams
export const hotelIdParams = idParams
