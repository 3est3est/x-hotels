import { Elysia } from 'elysia'
import type { AppContext } from '../../context'
import * as service from './service'
import { idParams } from '../params'
import { hotelDetailResponse, hotelListQuery, hotelListResponse, regionListResponse } from './model'

export function catalog({ db }: AppContext) {
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
