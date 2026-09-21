import { ArrowLeft, MapPin, Star, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { BookingForm } from '../components/BookingForm'
import { ErrorState, LoadingState, NotFoundState } from '../components/StateMessages'
import { readDraft } from '../lib/bookingDraft'
import { formatDate } from '../lib/format'
import { useHotelDetail } from '../lib/hooks'

export default function HotelDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const valid = Number.isInteger(id) && id > 0
  const { data: hotel, isPending, error, notFound, reload } = useHotelDetail(id)
  const [searchParams] = useSearchParams()
  const draft = useMemo(() => readDraft(searchParams), [searchParams])

  if (!valid || notFound) {
    return (
      <NotFoundState title="Hotel not found">
        <Link to="/" className="font-medium text-ink underline">
          Back to all hotels
        </Link>
      </NotFoundState>
    )
  }

  if (isPending) return <LoadingState label="Loading hotel…" />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!hotel) return null

  const [hero, ...rest] = hotel.images

  return (
    <div className="flex flex-col gap-12">
      <div className="rise">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-stone hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden /> All hotels
        </Link>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
          {hotel.name}
        </h1>
        <p className="mt-3 flex items-center gap-1.5 text-stone">
          <MapPin size={16} aria-hidden />
          {hotel.regionName}, {hotel.countryName}
        </p>
      </div>

      {hero && (
        <div className="rise rise-1 grid gap-4 sm:grid-cols-3">
          <img
            src={hero.url}
            alt={hotel.name}
            className="aspect-[16/10] w-full rounded-2xl object-cover sm:col-span-2 sm:aspect-auto sm:h-full sm:min-h-80"
          />
          <div className="grid grid-rows-2 gap-4">
            {rest.slice(0, 2).map((image) => (
              <img
                key={image.url}
                src={image.url}
                alt={hotel.name}
                className="h-40 w-full rounded-2xl object-cover sm:h-full sm:min-h-0"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      <p className="rise rise-2 max-w-[65ch] text-lg leading-relaxed text-stone">
        {hotel.description}
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Room types</h2>
        {hotel.roomTypes.length === 0 ? (
          <p className="text-stone">No room types listed for this hotel yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-hairline">
            {hotel.roomTypes.map((roomType) => (
              <li key={roomType.id} className="grid gap-5 py-7 sm:grid-cols-5 sm:gap-8">
                {roomType.images[0] ? (
                  <img
                    src={roomType.images[0].url}
                    alt={roomType.name}
                    className="aspect-[16/10] w-full rounded-2xl object-cover sm:col-span-2"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-paper text-faint sm:col-span-2">
                    No image
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:col-span-3">
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">
                      {roomType.name}
                    </h3>
                    <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-stone">
                      {roomType.description}
                    </p>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-stone">
                    <Users size={15} aria-hidden /> Sleeps {roomType.capacity}
                  </p>
                  <div className="mt-1 max-w-sm">
                    <BookingForm hotelId={hotel.id} roomType={roomType} draft={draft} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Guest reviews</h2>
          {hotel.avgRating !== null ? (
            <span className="flex items-center gap-1.5 text-ink">
              <Star size={17} fill="currentColor" aria-hidden />
              <span className="font-display text-2xl font-semibold">
                {hotel.avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-faint">
                from {hotel.reviews.length} {hotel.reviews.length === 1 ? 'stay' : 'stays'}
              </span>
            </span>
          ) : (
            <span className="text-sm text-faint">No reviews yet</span>
          )}
        </div>
        {hotel.reviews.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {hotel.reviews.map((review) => (
              <li
                key={review.id}
                className="flex flex-col gap-2.5 rounded-2xl border border-hairline bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-0.5 text-ink" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, i) => (
                      <Star key={i} size={14} fill="currentColor" aria-hidden />
                    ))}
                  </span>
                  <span className="text-xs text-faint">{formatDate(review.createdAt)}</span>
                </div>
                {review.message ? (
                  <p className="text-[15px] leading-relaxed">{review.message}</p>
                ) : (
                  <p className="text-sm text-faint">Rated without a written review.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
