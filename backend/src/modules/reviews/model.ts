import { t } from 'elysia'
import { errorResponse } from '../errors'
import { idParams } from '../params'

const reviewRow = t.Object({
  id: t.Integer(),
  userId: t.String(),
  hotelId: t.Integer(),
  rating: t.Integer(),
  message: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

export const createReviewResponse = { 201: reviewRow, 403: errorResponse, 404: errorResponse, 409: errorResponse }
export const updateReviewResponse = { 200: reviewRow, 404: errorResponse }

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
