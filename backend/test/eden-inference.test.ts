import { describe, expect, it } from 'bun:test'
import { edenTreaty } from '@elysiajs/eden/treaty'
import { createApp, type App } from '../src/app'
import { stubCloudinary } from './helpers'

// Compile-time proof that the exported App type works with Eden treaty:
// route paths, request bodies, and response types must infer from `App`.
// At runtime the treaty is wired to the app in-process via a custom fetcher,
// so no server needs to be listening.
describe('Eden treaty inference', () => {
  it('exposes typed business routes end-to-end in-process', async () => {
    const app = createApp({
      db: {
        select: () => {
          throw new Error('not needed')
        },
      } as never,
      cloudinary: stubCloudinary,
      authSecret: 'test-secret-at-least-32-characters-long',
      authUrl: 'http://localhost:3000',
      corsOrigins: [],
    })

    const api = edenTreaty<App>('http://localhost', {
      fetcher: ((input, init) => app.handle(new Request(input, init))) as typeof fetch,
    })

    const health = await api.health.get()
    expect(health.status).toBe(200)
    if (health.data) {
      const ok: boolean = health.data.ok
      expect(ok).toBe(true)
    }

    // Compile-time-only assertions on business routes (never executed).
    if (false) {
      const regions = await api.regions.get()
      const firstName: string | undefined = (regions.data ?? [])[0]?.name
      void firstName

      const bookings = await api.bookings.get({ $headers: { cookie: 'x=1' }, $query: {} })
      const list = bookings.data as Array<{
        checkInDate: string
        status: 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN'
      }>
      if (list && list[0]) {
        const checkInDate: string = list[0].checkInDate
        const status: 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' = list[0].status
        void checkInDate
        void status
      }

      // Body is fully typed — wrong shape must fail typecheck.
      await api.bookings.post(
        {
          hotelId: 1,
          roomTypeId: 1,
          numGuests: 2,
          checkInDate: '2026-12-01',
          nights: 3,
          $headers: { cookie: 'x=1' },
          $query: {},
        },
      )
    }
  })
})
