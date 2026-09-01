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
  })
})
