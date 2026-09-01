import { describe, expect, it } from 'bun:test'
import { createTestApp } from './helpers'

describe('OpenAPI (dev-only)', () => {
  it('serves an OpenAPI document when enabled', async () => {
    const { app } = await createTestApp({ openapi: true })

    const res = await app.handle(new Request('http://localhost/openapi/json'))

    expect(res.status).toBe(200)
    const doc = (await res.json()) as { paths: Record<string, unknown> }
    expect(Object.keys(doc.paths)).toContain('/health')
    expect(Object.keys(doc.paths)).toContain('/bookings')
  })

  it('is not exposed when disabled (production posture)', async () => {
    const { app } = await createTestApp()

    const res = await app.handle(new Request('http://localhost/openapi/json'))

    expect(res.status).toBe(404)
  })
})
