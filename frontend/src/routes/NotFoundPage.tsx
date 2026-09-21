import { Link } from 'react-router'
import { NotFoundState } from '../components/StateMessages'

export default function NotFoundPage() {
  return (
    <NotFoundState title="Page not found">
      <p>
        That link doesn't lead anywhere.{' '}
        <Link to="/" className="underline hover:text-white">
          Back to all hotels
        </Link>
      </p>
    </NotFoundState>
  )
}