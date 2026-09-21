import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ErrorState } from '../components/StateMessages'
import { authClient } from '../lib/auth'
import { safeRedirect } from '../lib/redirect'

const fieldClass =
  'rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink placeholder:text-faint focus:border-ink focus:outline-none'

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
    <div className="rise mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-stone">Sign in to manage your bookings.</p>
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-stone">Email</span>
          <input
            type="email"
            className={fieldClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-stone">Password</span>
          <input
            type="password"
            className={fieldClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-4 py-2.5 font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-stone">
        New here?{' '}
        <Link to={registerHref} className="font-medium text-ink underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
