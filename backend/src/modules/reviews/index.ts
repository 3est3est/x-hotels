import { Elysia } from 'elysia'
import type { AppContext } from '../../context'
import { authPlugin } from '../auth'
import * as service from './service'
import { idParams } from '../params'
import { createReviewBody, createReviewResponse, updateReviewBody, updateReviewResponse } from './model'

export function reviewsModule({ db, auth }: AppContext) {
  return new Elysia({ name: 'reviews' })
    .use(authPlugin({ auth }))
    .post(
      '/hotels/:id/reviews',
      ({ user, params, body }) => service.createReview(db, user.id, params.id, body),
      {
        params: idParams,
        body: createReviewBody,
        response: createReviewResponse,
        detail: { tags: ['reviews'] },
        session: 'verified',
      },
    )
    .patch(
      '/reviews/:id',
      ({ user, params, body }) => service.updateReview(db, user.id, params.id, body),
      {
        params: idParams,
        body: updateReviewBody,
        response: updateReviewResponse,
        detail: { tags: ['reviews'] },
        session: 'verified',
      },
    )
}
