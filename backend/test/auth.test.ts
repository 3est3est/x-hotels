import { describe, expect, it } from 'bun:test'
import { createTestApp, signUp, verifyIdentity, signIn } from './helpers'
import type { App } from '../src/app'

async function getSession(app: App, cookie: string) {
  const res = await app.handle(
    new Request('http://localhost/api/auth/get-session', { headers: { cookie } }),
  )
  return { status: res.status, body: await res.json() }
}

describe('auth', () => {
  it('signs up, signs in, and exposes the session', async () => {
    const { app } = await createTestApp()
    const user = await signUp(app, 'guest@example.com')

    const session = await getSession(app, user.cookie)
    expect(session.status).toBe(200)
    expect(session.body.user.email).toBe('guest@example.com')
    expect(session.body.user.role).toBe('guest')
    expect(session.body.user.verifiedAt).toBeNull()
  })

  it('signs in with the same credentials later', async () => {
    const { app } = await createTestApp()
    const user = await signUp(app, 'returning@example.com')

    const cookie = await signIn(app, user.email, user.password)
    const session = await getSession(app, cookie)
    expect(session.status).toBe(200)
    expect(session.body.user.email).toBe(user.email)
  })

  it('rejects a wrong password', async () => {
    const { app } = await createTestApp()
    const user = await signUp(app, 'wrongpw@example.com')

    const res = await app.handle(
      new Request('http://localhost/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: 'WrongPass999' }),
      }),
    )
    expect(res.status).toBe(401)
  })

  it('requires authentication for verification endpoints', async () => {
    const { app } = await createTestApp()

    const res = await app.handle(
      new Request('http://localhost/identity-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: 'id_card', publicId: 'identity/x/doc' }),
      }),
    )
    expect(res.status).toBe(401)
  })

  it('verifies identity and records the document', async () => {
    const { app } = await createTestApp()
    const user = await signUp(app, 'verify@example.com')
    await verifyIdentity(app, user, 'passport')

    const session = await getSession(app, user.cookie)
    expect(session.body.user.verifiedAt).not.toBeNull()
    expect(session.body.user.idDocumentType).toBe('passport')
    expect(session.body.user.idDocumentUrl).toContain('identity/')
    expect(session.body.user.idDocumentPublicId).toContain('identity/')
  })

  it('rejects verification when the uploaded asset cannot be found', async () => {
    const { app } = await createTestApp()
    const user = await signUp(app, 'missing-doc@example.com')

    const res = await app.handle(
      new Request('http://localhost/identity-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: user.cookie },
        body: JSON.stringify({ documentType: 'id_card', publicId: 'missing' }),
      }),
    )
    expect(res.status).toBe(422)
  })
})
