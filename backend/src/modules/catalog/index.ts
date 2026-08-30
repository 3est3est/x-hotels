import { Elysia } from 'elysia'
import type { Db } from '../../db/types'
import * as service from './service'
import { hotelListQuery, idParams } from './model'

export function catalog({ db }: { db: Db }) {
  return new Elysia({ name: 'catalog' })
    .get('/regions', () => service.listRegions(db))
    .get('/hotels', ({ query }) => service.listHotels(db, query), {
      query: hotelListQuery,
    })
    .get('/hotels/:id', ({ params }) => service.getHotelDetail(db, params.id), {
      params: idParams,
    })
}
