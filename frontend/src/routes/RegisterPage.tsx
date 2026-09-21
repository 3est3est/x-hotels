import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ErrorState } from '../components/StateMessages'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { authClient } from '../lib/auth'
import { useT } from '../lib/i18n'
import { safeRedirect } from '../lib/redirect'

export default function RegisterPage() {
  const navigate = useNavigate()
  const t = useT()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('redirect'), '/book')
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const response = await authClient.signUp.email({ name, email, password })
    setPending(false)
    if (response.error) {
      setError(response.error.message ?? t.auth.registrationFailed)
      return
    }
    // Same session-store race as sign-in: refresh before navigating on.
    await authClient.getSession()
    navigate(redirect, { replace: true })
  }

  return (
    <div className="rise mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{t.auth.createTitle}</h1>
        <p className="mt-2 text-stone">{t.auth.createSub}</p>
      </div>

      {error && <ErrorState message={error} />}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Label>
          <LabelText>{t.auth.fullName}</LabelText>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        </Label>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Label>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? t.auth.creating : t.auth.create}
        </Button>
      </form>

      <p className="text-sm text-stone">
        {t.auth.haveAccount}{' '}
        <Link to={loginHref} className="font-medium text-ink underline">
          {t.auth.signInLink}
        </Link>
      </p>
    </div>
  )
}
