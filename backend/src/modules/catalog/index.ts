import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import * as service from './service'
import { hotelDetailResponse, hotelListQuery, hotelListResponse, idParams, regionListResponse } from './model'

export function catalog({ db }: { db: Db }) {
  return new Elysia({ name: 'catalog' })
    .get('/regions', () => service.listRegions(db), {
      response: regionListResponse,
      detail: { tags: ['catalog'] },
    })
    .get('/hotels', ({ query }) => service.listHotels(db, query), {
      query: hotelListQuery,
      response: hotelListResponse,
      detail: { tags: ['catalog'] },
    })
    .get('/hotels/:id', ({ params }) => service.getHotelDetail(db, params.id), {
      params: idParams,
      response: hotelDetailResponse,
      detail: { tags: ['catalog'] },
    })
}
