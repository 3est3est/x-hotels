import { ArrowLeft, MapPin, Star, Users } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ErrorState, LoadingState, NotFoundState } from '../components/StateMessages'
import { formatDate } from '../lib/format'
import { useHotelDetail } from '../lib/hooks'

export default function HotelDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const valid = Number.isInteger(id) && id > 0
  const { data: hotel, isPending, error, notFound, reload } = useHotelDetail(id)

  if (!valid || notFound) {
    return (
      <NotFoundState title="Hotel not found">
        <Link to="/" className="underline hover:text-white">
          Back to all hotels
        </Link>
      </NotFoundState>
    )
  }

  if (isPending) return <LoadingState label="Loading hotel…" />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!hotel) return null

  return (
    <div className="flex flex-col gap-8">
      <Link to="/" className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white">
        <ArrowLeft size={16} aria-hidden /> All hotels
      </Link>

      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{hotel.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-neutral-400">
            <MapPin size={16} aria-hidden />
            {hotel.regionName}, {hotel.countryName}
          </p>
        </div>
        <p className="text-neutral-300">{hotel.description}</p>
        {hotel.images.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {hotel.images.map((image) => (
              <img
                key={image.url}
                src={image.url}
                alt={hotel.name}
                className="h-56 w-full rounded-lg object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Room types</h2>
        {hotel.roomTypes.length === 0 ? (
          <p className="text-neutral-400">No room types listed for this hotel yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {hotel.roomTypes.map((roomType) => (
              <li
                key={roomType.id}
                className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
              >
                {roomType.images[0] && (
                  <img
                    src={roomType.images[0].url}
                    alt={roomType.name}
                    className="h-36 w-full rounded-md object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <h3 className="font-medium">{roomType.name}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{roomType.description}</p>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-neutral-300">
                  <Users size={16} aria-hidden /> Sleeps {roomType.capacity}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Reviews</h2>
          {hotel.avgRating !== null ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Star size={16} fill="currentColor" aria-hidden />
              {hotel.avgRating.toFixed(1)} ({hotel.reviews.length})
            </span>
          ) : (
            <span className="text-sm text-neutral-500">No reviews yet</span>
          )}
        </div>
        {hotel.reviews.length > 0 && (
          <ul className="flex flex-col gap-3">
            {hotel.reviews.map((review) => (
              <li key={review.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <Star key={i} size={14} fill="currentColor" aria-hidden />
                  ))}
                  <span className="ml-1 text-xs text-neutral-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.message && <p className="mt-2 text-neutral-300">{review.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
