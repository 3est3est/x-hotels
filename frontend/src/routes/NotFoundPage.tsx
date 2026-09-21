import { Link } from 'react-router'
import { NotFoundState } from '../components/StateMessages'
import { useT } from '../lib/i18n'

export default function NotFoundPage() {
  const t = useT()
  return (
    <div className="rise py-10">
      <NotFoundState title={t.notFound.title}>
        <p>
          {t.notFound.body}{' '}
          <Link to="/" className="font-medium text-ink underline">
            {t.notFound.back}
          </Link>
        </p>
      </NotFoundState>
    </div>
  )
}
