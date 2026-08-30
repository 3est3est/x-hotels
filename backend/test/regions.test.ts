import { describe, expect, it } from 'bun:test'
import { regions } from '../src/db/schema'
import { createTestApp } from './helpers'

describe('GET /regions', () => {
  it('returns seeded regions ordered by name', async () => {
    const { db, app } = await createTestApp()
    await db.insert(regions).values([{ name: 'Thailand' }, { name: 'Israel' }])

    const res = await app.handle(new Request('http://localhost/regions'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([
      { id: expect.any(Number), name: 'Israel' },
      { id: expect.any(Number), name: 'Thailand' },
    ])
  })

  it('returns an empty list when nothing is seeded', async () => {
    const { app } = await createTestApp()

    const res = await app.handle(new Request('http://localhost/regions'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})
