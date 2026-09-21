import { Link } from 'react-router'
import { NotFoundState } from '../components/StateMessages'

export default function NotFoundPage() {
  return (
    <div className="rise py-10">
      <NotFoundState title="Page not found">
        <p>
          That link leads nowhere.{' '}
          <Link to="/" className="font-medium text-ink underline">
            Back to all hotels
          </Link>
        </p>
      </NotFoundState>
    </div>
  )
}
