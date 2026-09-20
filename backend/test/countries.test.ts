import { describe, expect, it } from 'bun:test'
import { createTestApp } from './helpers'

describe('GET /countries', () => {
  async function countries() {
    const { app } = await createTestApp()
    const res = await app.handle(new Request('http://localhost/countries'))
    return { res, body: await res.json() }
  }

  it('returns each Country with the Regions inside it, ordered by name', async () => {
    const { res, body } = await countries()

    expect(res.status).toBe(200)
    expect(body.map((country: { name: string }) => country.name)).toEqual(['Israel', 'Thailand'])
    expect(body[0].regions.map((region: { name: string }) => region.name)).toEqual([
      'Central',
      'Haifa',
      'Jerusalem',
      'Northern',
      'Southern',
      'Tel Aviv',
    ])
    expect(body[1].regions.map((region: { name: string }) => region.name)).toEqual([
      'Central',
      'Eastern',
      'Northeastern',
      'Northern',
      'Southern',
      'Western',
    ])
  })

  it('nests each Region under exactly one Country', async () => {
    const { body } = await countries()

    const regionIds = body.flatMap((country: { regions: { id: number }[] }) =>
      country.regions.map((region) => region.id),
    )

    expect(regionIds).toHaveLength(12)
    expect(new Set(regionIds).size).toBe(regionIds.length)
  })

  it('keeps the same Region name inside its own Country', async () => {
    const { body } = await countries()

    const [israel, thailand] = body
    const israelCentral = israel.regions.find((region: { name: string }) => region.name === 'Central')
    const thailandCentral = thailand.regions.find((region: { name: string }) => region.name === 'Central')

    expect(israelCentral.id).not.toBe(thailandCentral.id)
  })

  it('no longer serves the flat Region listing', async () => {
    const { app } = await createTestApp()

    const res = await app.handle(new Request('http://localhost/regions'))

    expect(res.status).toBe(404)
  })
})


