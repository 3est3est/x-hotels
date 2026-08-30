import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import { authPlugin, type Auth } from '../auth'
import * as service from './service'
import { createReviewBody, hotelIdParams, reviewIdParams, updateReviewBody } from './model'

export function reviewsModule({ db, auth }: { db: Db; auth: Auth }) {
  return new Elysia({ name: 'reviews' })
    .use(authPlugin({ auth }))
    .post(
      '/hotels/:id/reviews',
      ({ user, params, body }) => service.createReview(db, user.id, params.id, body),
      {
        params: hotelIdParams,
        body: createReviewBody,
        verified: true,
      },
    )
    .patch(
      '/reviews/:id',
      ({ user, params, body }) => service.updateReview(db, user.id, params.id, body),
      {
        params: reviewIdParams,
        body: updateReviewBody,
        verified: true,
      },
    )
}
