import { describe, expect, it } from 'bun:test'
import { and, eq } from 'drizzle-orm'
import { seedDemoData } from '../src/db/seed'
import { countries, regions } from '../src/db/schema'
import { createTestApp } from './helpers'

type App = Awaited<ReturnType<typeof createTestApp>>['app']

const HOTEL_NAMES = [
  'X Hotel Bangkok',
  'X Hotel Chiang Mai',
  'X Hotel Eilat',
  'X Hotel Haifa',
  'X Hotel Jerusalem',
  'X Hotel Kanchanaburi',
  'X Hotel Khon Kaen',
  'X Hotel Netanya',
  'X Hotel Pattaya',
  'X Hotel Phuket',
  'X Hotel Tel Aviv',
  'X Hotel Tiberias',
]

const THAILAND_HOTELS = [
  'X Hotel Bangkok',
  'X Hotel Chiang Mai',
  'X Hotel Kanchanaburi',
  'X Hotel Khon Kaen',
  'X Hotel Pattaya',
  'X Hotel Phuket',
]

const ISRAEL_HOTELS = [
  'X Hotel Eilat',
  'X Hotel Haifa',
  'X Hotel Jerusalem',
  'X Hotel Netanya',
  'X Hotel Tel Aviv',
  'X Hotel Tiberias',
]

describe('catalog', () => {
  async function setup() {
    const { db, app } = await createTestApp()
    await seedDemoData(db)
    const [thailand] = await db.select().from(countries).where(eq(countries.name, 'Thailand'))
    const [israel] = await db.select().from(countries).where(eq(countries.name, 'Israel'))
    const [central] = await db
      .select()
      .from(regions)
      .where(and(eq(regions.countryId, thailand.id), eq(regions.name, 'Central')))
    return { db, app, thailand, israel, central }
  }

  async function hotelNames(app: App, query: string) {
    const res = await app.handle(new Request(`http://localhost/hotels${query}`))
    expect(res.status).toBe(200)
    return (await res.json()).map((hotel: { name: string }) => hotel.name)
  }

  it('lists all hotels ordered by name', async () => {
    const { app } = await setup()
    expect(await hotelNames(app, '')).toEqual(HOTEL_NAMES)
  })

  it('filters hotels by region', async () => {
    const { app, central } = await setup()
    expect(await hotelNames(app, `?regionId=${central.id}`)).toEqual(['X Hotel Bangkok'])
  })

  it('filters hotels by country', async () => {
    const { app, thailand, israel } = await setup()

    expect(await hotelNames(app, `?countryId=${thailand.id}`)).toEqual(THAILAND_HOTELS)
    expect(await hotelNames(app, `?countryId=${israel.id}`)).toEqual(ISRAEL_HOTELS)
  })

  it('agrees with filtering by each Region of a Country', async () => {
    const { db, app, thailand } = await setup()
    const byCountry = await hotelNames(app, `?countryId=${thailand.id}`)

    const thaiRegions = await db.select().from(regions).where(eq(regions.countryId, thailand.id))
    const byRegions: string[] = []
    for (const region of thaiRegions) {
      byRegions.push(...(await hotelNames(app, `?regionId=${region.id}`)))
    }

    expect(byRegions.sort()).toEqual(byCountry.sort())
  })

  it('combines a country filter with a region filter and a name search', async () => {
    const { app, thailand, israel, central } = await setup()

    expect(await hotelNames(app, `?countryId=${thailand.id}&regionId=${central.id}&q=bang`)).toEqual([
      'X Hotel Bangkok',
    ])
    expect(await hotelNames(app, `?countryId=${israel.id}&q=bang`)).toEqual([])
  })

  it('returns an empty list for an unknown country', async () => {
    const { app } = await setup()
    expect(await hotelNames(app, '?countryId=9999')).toEqual([])
  })

  it('searches hotels by name case-insensitively', async () => {
    const { app } = await setup()
    expect(await hotelNames(app, '?q=aviv')).toEqual(['X Hotel Tel Aviv'])
  })

  it('names the Country and Region of a hotel in each Country', async () => {
    const { app } = await setup()
    const hotels = await (await app.handle(new Request('http://localhost/hotels'))).json()
    const detailOf = async (name: string) => {
      const hotel = hotels.find((h: { name: string }) => h.name === name)
      const res = await app.handle(new Request(`http://localhost/hotels/${hotel.id}`))
      expect(res.status).toBe(200)
      return res.json()
    }

    expect(await detailOf('X Hotel Bangkok')).toMatchObject({
      name: 'X Hotel Bangkok',
      regionName: 'Central',
      countryName: 'Thailand',
    })
    expect(await detailOf('X Hotel Tel Aviv')).toMatchObject({
      name: 'X Hotel Tel Aviv',
      regionName: 'Tel Aviv',
      countryName: 'Israel',
    })
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


