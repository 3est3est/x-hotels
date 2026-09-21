import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ErrorState } from '../components/StateMessages'
import { authClient } from '../lib/auth'
import { safeRedirect } from '../lib/redirect'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('redirect'))
  const registerHref = `/register?redirect=${encodeURIComponent(redirect)}`
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const response = await authClient.signIn.email({ email, password })
    setPending(false)
    if (response.error) {
      setError(response.error.message ?? 'Sign-in failed')
      return
    }
    navigate(redirect, { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-neutral-400">Access your bookings and identity verification.</p>
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">Email</span>
          <input
            type="email"
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">Password</span>
          <input
            type="password"
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-white px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-neutral-400">
        New here?{' '}
        <Link to={registerHref} className="text-white underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}