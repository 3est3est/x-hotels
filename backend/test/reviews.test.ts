import { describe, expect, it } from 'bun:test'
import {
  createTestApp,
  verifiedUser,
  signUp,
  promoteToManagement,
  signIn,
  seedCatalog,
  type TestUser,
} from './helpers'
import type { App } from '../src/app'


async function guestWithCheckedInStay(app: App, db: Awaited<ReturnType<typeof createTestApp>>['db'], email: string) {
  const guest = await verifiedUser(app, email)
  const fixture = await seedCatalog(db)
  const created = await app.handle(
    new Request('http://localhost/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: guest.cookie },
      body: JSON.stringify({
        hotelId: fixture.hotelId,
        roomTypeId: fixture.roomTypeId,
        numGuests: 2,
        checkInDate: '2026-12-01',
        nights: 3,
      }),
    }),
  )
  const bookingId = ((await created.json()) as { id: number }).id
  const staff = await verifiedUser(app, 'mgmt@example.com')
  await promoteToManagement(db, staff.userId)
  const staffCookie = await signIn(app, staff.email, staff.password)
  const checkIn = await app.handle(
    new Request(`http://localhost/admin/bookings/${bookingId}/check-in`, {
      method: 'POST',
      headers: { cookie: staffCookie },
    }),
  )
  expect(checkIn.status).toBe(200)
  return { guest, fixture }
}

function postReview(app: App, session: TestUser, hotelId: number, body: Record<string, unknown>) {
  return app.handle(
    new Request(`http://localhost/hotels/${hotelId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: session.cookie },
      body: JSON.stringify(body),
    }),
  )
}

describe('reviews', () => {
  it('rejects a guest who never checked in', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const guest = await verifiedUser(app, 'driveBy@example.com')

    const res = await postReview(app, guest, fixture.hotelId, { rating: 5, comment: 'never been there' })

    expect(res.status).toBe(403)
  })

  it('accepts a review after an actual check-in', async () => {
    const { db, app } = await createTestApp()
    const { guest, fixture } = await guestWithCheckedInStay(app, db, 'stayed@example.com')

    const res = await postReview(app, guest, fixture.hotelId, { rating: 5, comment: 'great' })

    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ rating: 5, comment: 'great' })
  })

  it('accepts a 0-star rating', async () => {
    const { db, app } = await createTestApp()
    const { guest, fixture } = await guestWithCheckedInStay(app, db, 'angry@example.com')

    const res = await postReview(app, guest, fixture.hotelId, { rating: 0 })

    expect(res.status).toBe(201)
  })

  it('rejects out-of-range ratings', async () => {
    const { db, app } = await createTestApp()
    const { guest, fixture } = await guestWithCheckedInStay(app, db, 'rater@example.com')

    const below = await postReview(app, guest, fixture.hotelId, { rating: -1 })
    const above = await postReview(app, guest, fixture.hotelId, { rating: 6 })

    expect(below.status).toBe(422)
    expect(above.status).toBe(422)
  })

  it('allows only one review per hotel and offers editing instead', async () => {
    const { db, app } = await createTestApp()
    const { guest, fixture } = await guestWithCheckedInStay(app, db, 'once@example.com')
    const first = await postReview(app, guest, fixture.hotelId, { rating: 3, comment: 'ok' })
    const firstBody = (await first.json()) as { id: number }

    const second = await postReview(app, guest, fixture.hotelId, { rating: 4 })

    const edit = await app.handle(
      new Request(`http://localhost/reviews/${firstBody.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', cookie: guest.cookie },
        body: JSON.stringify({ rating: 5, comment: 'changed my mind' }),
      }),
    )

    expect(second.status).toBe(409)
    expect(edit.status).toBe(200)
    expect(await edit.json()).toMatchObject({ rating: 5, comment: 'changed my mind' })
  })

  it('rejects editing someone else review', async () => {
    const { db, app } = await createTestApp()
    const { guest, fixture } = await guestWithCheckedInStay(app, db, 'author@example.com')
    const created = await postReview(app, guest, fixture.hotelId, { rating: 3 })
    const reviewId = ((await created.json()) as { id: number }).id
    const stranger = await verifiedUser(app, 'stranger@example.com')

    const res = await app.handle(
      new Request(`http://localhost/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', cookie: stranger.cookie },
        body: JSON.stringify({ rating: 1 }),
      }),
    )

    expect(res.status).toBe(404)
  })

  it('rejects unverified reviewers and unknown hotels', async () => {
    const { db, app } = await createTestApp()
    const fixture = await seedCatalog(db)
    const unverified = await signUp(app, 'unverifiedReview@example.com')

    const unverifiedRes = await postReview(app, unverified, fixture.hotelId, { rating: 1 })
    const unknownRes = await verifiedUser(app, 'anywhere@example.com').then((g) =>
      postReview(app, g, 9999, { rating: 1 }),
    )

    expect(unverifiedRes.status).toBe(403)
    expect(unknownRes.status).toBe(404)
  })

  it('shows reviews and average rating on hotel detail', async () => {
    const { db, app } = await createTestApp()
    const { guest, fixture } = await guestWithCheckedInStay(app, db, 'detail@example.com')
    await postReview(app, guest, fixture.hotelId, { rating: 4, comment: 'nice' })

    const res = await app.handle(new Request(`http://localhost/hotels/${fixture.hotelId}`))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.reviews).toHaveLength(1)
    expect(body.reviews[0]).toMatchObject({ rating: 4, comment: 'nice' })
    expect(body.avgRating).toBe(4)
  })
})
