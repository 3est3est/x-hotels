import { t } from 'elysia'
import { errorResponse } from '../errors'

export const hotelListQuery = t.Object({
  regionId: t.Optional(t.Numeric()),
  q: t.Optional(t.String()),
})

export { idParams } from '../params'

const imageRef = t.Object({
  url: t.String(),
  publicId: t.Optional(t.String()),
})

export const regionListResponse = t.Array(
  t.Object({
    id: t.Integer(),
    name: t.String(),
  }),
)

export const hotelListResponse = t.Array(
  t.Object({
    id: t.Integer(),
    regionId: t.Integer(),
    name: t.String(),
    description: t.String(),
    images: t.Array(imageRef),
  }),
)

export const hotelDetailResponse = {
  200: t.Object({
    id: t.Integer(),
    regionId: t.Integer(),
    name: t.String(),
    description: t.String(),
    images: t.Array(imageRef),
    createdAt: t.Date(),
    roomTypes: t.Array(
      t.Object({
        id: t.Integer(),
        name: t.String(),
        description: t.String(),
        capacity: t.Integer(),
        images: t.Array(imageRef),
      }),
    ),
    reviews: t.Array(
      t.Object({
        id: t.Integer(),
        rating: t.Integer(),
        message: t.Union([t.String(), t.Null()]),
        createdAt: t.Date(),
      }),
    ),
    avgRating: t.Union([t.Number(), t.Null()]),
  }),
  404: errorResponse,
}
