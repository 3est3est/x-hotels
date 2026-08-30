import { describe, expect, it } from 'bun:test'
import { seedDemoData } from '../src/db/seed'
import { createTestApp } from './helpers'

describe('catalog', () => {
  async function setup() {
    const { db, app } = await createTestApp()
    await seedDemoData(db)
    const regions = await (await app.handle(new Request('http://localhost/regions'))).json()
    const thailand = regions.find((r: { name: string }) => r.name === 'Thailand').id
    const israel = regions.find((r: { name: string }) => r.name === 'Israel').id
    return { db, app, thailand, israel }
  }

  it('lists regions ordered by name', async () => {
    const { app } = await setup()
    const res = await app.handle(new Request('http://localhost/regions'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.map((r: { name: string }) => r.name)).toEqual(['Israel', 'Thailand'])
  })

  it('lists all hotels ordered by name', async () => {
    const { app } = await setup()
    const res = await app.handle(new Request('http://localhost/hotels'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.map((h: { name: string }) => h.name)).toEqual([
      'X Hotel Bangkok',
      'X Hotel Jerusalem',
      'X Hotel Phuket',
      'X Hotel Tel Aviv',
    ])
  })

  it('filters hotels by region', async () => {
    const { app, israel } = await setup()
    const res = await app.handle(new Request(`http://localhost/hotels?regionId=${israel}`))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.map((h: { name: string }) => h.name)).toEqual(['X Hotel Jerusalem', 'X Hotel Tel Aviv'])
  })

  it('searches hotels by name case-insensitively', async () => {
    const { app } = await setup()
    const res = await app.handle(new Request('http://localhost/hotels?q=aviv'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.map((h: { name: string }) => h.name)).toEqual(['X Hotel Tel Aviv'])
  })

  it('shows hotel detail with room types', async () => {
    const { app } = await setup()
    const hotels = await (await app.handle(new Request('http://localhost/hotels'))).json()
    const bangkok = hotels.find((h: { name: string }) => h.name === 'X Hotel Bangkok')

    const res = await app.handle(new Request(`http://localhost/hotels/${bangkok.id}`))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.name).toBe('X Hotel Bangkok')
    expect(body.roomTypes).toHaveLength(3)
    expect(body.roomTypes[0]).toMatchObject({ name: 'Deluxe', capacity: 2 })
  })

  it('returns 404 for an unknown hotel', async () => {
    const { app } = await setup()
    const res = await app.handle(new Request('http://localhost/hotels/9999'))
    expect(res.status).toBe(404)
  })
})
