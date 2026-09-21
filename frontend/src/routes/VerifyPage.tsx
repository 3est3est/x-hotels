import { CheckCircle2 } from 'lucide-react'
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
    hint: 'Your national ID card number. Digits only is fine. Spaces and dashes are ignored.',
  },
  passport: {
    placeholder: 'AB123456',
    hint: 'Passport number, 5 to 15 letters and digits. Letters are upper-cased by the server.',
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
    <div className="rise mx-auto flex w-full max-w-md flex-col gap-6 py-6">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Verify your identity</h1>
        <p className="mt-2 text-stone">
          {verified
            ? 'Your stay can be booked. Details below.'
            : 'Booking requires a verified identity. Enter one document number. Nothing is uploaded.'}
        </p>
      </div>

      {verified && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-olive/30 bg-olive-bg p-4 text-sm">
          <CheckCircle2 size={18} className="shrink-0 text-olive" aria-hidden />
          <span>
            Identity verified
            {session?.user?.idDocumentType && session.user.idDocumentNumber
              ? ` (${session.user.idDocumentType === 'id_card' ? 'ID card' : 'Passport'} ending ${session.user.idDocumentNumber.slice(-4)})`
              : ''}
            .
          </span>
        </div>
      )}

      {error && <ErrorState message={error} />}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Document type</legend>
          {(Object.keys(HINTS) as DocumentType[]).map((type) => (
            <label
              key={type}
              className={`cursor-pointer rounded-full border px-3 py-2.5 text-center text-sm font-medium transition ${
                documentType === type
                  ? 'border-ink bg-ink text-white'
                  : 'border-hairline bg-card text-stone hover:border-stone'
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

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-stone">Document number</span>
          <input
            className="rounded-xl border border-hairline bg-card px-3 py-2.5 tracking-wider text-ink placeholder:text-faint focus:border-ink focus:outline-none"
            value={documentNumber}
            onChange={(event) => setDocumentNumber(event.target.value)}
            placeholder={hint.placeholder}
            autoComplete="off"
            required
          />
          <span className="text-xs font-normal text-faint">{hint.hint}</span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-4 py-2.5 font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? 'Verifying…' : verified ? 'Re-verify' : 'Verify identity'}
        </button>
      </form>

      {verified && (
        <div className="flex flex-col gap-2 border-t border-hairline pt-5 text-sm text-stone">
          <p>Need to use a different document? Submit a new number above. It replaces the verified record.</p>
          <Link to="/" className="font-medium text-ink underline">
            Browse hotels to book
          </Link>
        </div>
      )}
    </div>
  )
}
