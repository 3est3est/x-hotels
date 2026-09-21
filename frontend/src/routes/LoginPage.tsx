import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ErrorState } from '../components/StateMessages'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { authClient } from '../lib/auth'
import { useT } from '../lib/i18n'
import { safeRedirect } from '../lib/redirect'

export default function LoginPage() {
  const navigate = useNavigate()
  const t = useT()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('redirect'), '/book')
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
      setError(response.error.message ?? t.auth.signInFailed)
      return
    }
    // Refresh the session store before leaving: RequireSession reads it
    // synchronously, and navigating on a stale null session bounces to login.
    await authClient.getSession()
    navigate(redirect, { replace: true })
  }

  return (
    <div className="rise mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{t.auth.loginTitle}</h1>
        <p className="mt-2 text-stone">{t.auth.loginSub}</p>
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Label>
          <LabelText>{t.auth.email}</LabelText>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </Label>
        <Label>
          <LabelText>{t.auth.password}</LabelText>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Label>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? t.auth.signingIn : t.auth.signInBtn}
        </Button>
      </form>

      <p className="text-sm text-stone">
        {t.auth.newHere}{' '}
        <Link to={registerHref} className="font-medium text-ink underline">
          {t.auth.createLink}
        </Link>
      </p>
    </div>
  )
}
