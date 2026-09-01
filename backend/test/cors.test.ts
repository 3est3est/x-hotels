import { describe, expect, it } from 'bun:test'
import { createTestApp } from './helpers'

const ALLOWED = 'http://localhost:5173'

describe('CORS', () => {
  it('answers preflight from an allowed origin with credentials', async () => {
    const { app } = await createTestApp({ corsOrigins: [ALLOWED] })

    const res = await app.handle(
      new Request('http://localhost/bookings', {
        method: 'OPTIONS',
        headers: { Origin: ALLOWED, 'Access-Control-Request-Method': 'POST' },
      }),
    )

    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED)
    expect(res.headers.get('access-control-allow-credentials')).toBe('true')
  })

  it('marks allowed origins on actual requests', async () => {
    const { app } = await createTestApp({ corsOrigins: [ALLOWED] })

    const res = await app.handle(
      new Request('http://localhost/health', { headers: { Origin: ALLOWED } }),
    )

    expect(res.status).toBe(200)
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED)
  })

  it('does not bless unknown origins', async () => {
    const { app } = await createTestApp({ corsOrigins: [ALLOWED] })

    const preflight = await app.handle(
      new Request('http://localhost/bookings', {
        method: 'OPTIONS',
        headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' },
      }),
    )
    expect(preflight.headers.get('access-control-allow-origin')).toBeNull()

    const actual = await app.handle(
      new Request('http://localhost/health', { headers: { Origin: 'https://evil.example' } }),
    )
    expect(actual.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('keeps same-origin API usable without CORS origins', async () => {
    const { app } = await createTestApp({ corsOrigins: [] })

    const res = await app.handle(new Request('http://localhost/health'))

    expect(res.status).toBe(200)
  })
})
