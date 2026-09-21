import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ErrorState } from '../components/StateMessages'
import { api, errorMessage } from '../lib/api'
import { useSession } from '../lib/auth'
import { safeRedirect } from '../lib/redirect'
import type { DocumentType } from '../lib/types'

const HINTS: Record<DocumentType, { placeholder: string; hint: string }> = {
  id_card: {
    placeholder: '1234567890121',
    hint: 'Your national ID card number. Digits only is fine — spaces and dashes are ignored.',
  },
  passport: {
    placeholder: 'AB123456',
    hint: 'Passport number, 5–15 letters and digits. Letters are upper-cased by the server.',
  },
}

export default function VerifyPage() {
  const { data: session, refetch } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('redirect'))
  const [documentType, setDocumentType] = useState<DocumentType>('id_card')
  const [documentNumber, setDocumentNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const verified = Boolean(session?.user?.verifiedAt)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const response = await api['identity-verification'].post({ documentType, documentNumber })
    setPending(false)

    if (response.status === 401) {
      const here = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(here)}`, { replace: true })
      return
    }
    if (response.error) {
      setError(errorMessage(response.error, 'Verification failed'))
      return
    }
    setDocumentNumber('')
    await refetch()
    if (redirect !== '/') navigate(redirect, { replace: true })
  }

  const hint = HINTS[documentType]

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldCheck size={22} aria-hidden />
        <h1 className="text-2xl font-semibold">Verify your identity</h1>
      </div>

      {verified ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-4 text-emerald-300">
            <CheckCircle2 size={18} aria-hidden />
            <span>
              Your identity is verified
              {session?.user?.idDocumentType && session.user.idDocumentNumber
                ? ` (${session.user.idDocumentType === 'id_card' ? 'ID card' : 'Passport'} ending ${session.user.idDocumentNumber.slice(-4)})`
                : ''}
              .
            </span>
          </div>
          <Link
            to="/"
            className="rounded-md bg-white px-4 py-2 text-center font-medium text-neutral-900 hover:bg-neutral-200"
          >
            Browse hotels to book
          </Link>
          <p className="text-sm text-neutral-400">
            Need to re-submit? Enter a different document below — it replaces the verified record.
          </p>
        </div>
      ) : (
        <p className="text-neutral-400">
          Booking a room type requires a verified identity. Enter one document number — nothing is
          uploaded.
        </p>
      )}

      {error && <ErrorState message={error} />}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <fieldset className="flex gap-2">
          <legend className="sr-only">Document type</legend>
          {(Object.keys(HINTS) as DocumentType[]).map((type) => (
            <label
              key={type}
              className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm ${
                documentType === type
                  ? 'border-white bg-neutral-800 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              <input
                type="radio"
                name="documentType"
                className="sr-only"
                checked={documentType === type}
                onChange={() => setDocumentType(type)}
              />
              {type === 'id_card' ? 'ID card' : 'Passport'}
            </label>
          ))}
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">Document number</span>
          <input
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-neutral-100"
            value={documentNumber}
            onChange={(event) => setDocumentNumber(event.target.value)}
            placeholder={hint.placeholder}
            autoComplete="off"
            required
          />
          <span className="text-xs text-neutral-500">{hint.hint}</span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-white px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
        >
          {pending ? 'Verifying…' : verified ? 'Re-verify' : 'Verify identity'}
        </button>
      </form>
    </div>
  )
}