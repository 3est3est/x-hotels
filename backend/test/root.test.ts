import { describe, expect, it } from 'bun:test'
import { createTestApp } from './helpers'

describe('GET /', () => {
  it('returns hello elysia', async () => {
    const { app } = await createTestApp()

    const res = await app.handle(new Request('http://localhost/'))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('hello elysia')
  })
})
