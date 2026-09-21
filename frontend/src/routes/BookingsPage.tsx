import { CalendarDays, MapPin, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { cancelBooking, useBookings } from '../lib/bookings'
import { formatDate, formatDateTime } from '../lib/format'
import type { Booking, BookingStatus } from '../lib/types'

const STATUS: Record<BookingStatus, { label: string; style: string }> = {
  CONFIRMED: { label: 'Confirmed', style: 'border-olive/30 bg-olive-bg text-olive' },
  CANCELLED: { label: 'Cancelled', style: 'border-hairline bg-paper text-faint' },
  CHECKED_IN: { label: 'Checked in', style: 'border-slateblue/30 bg-slateblue-bg text-slateblue' },
}

function BookingCard({
  booking,
  onChanged,
  stagger = '',
}: {
  booking: Booking
  onChanged: () => void
  stagger?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const cancellable = booking.status === 'CONFIRMED'

  async function onCancel() {
    setError(null)
    setPending(true)
    try {
      await cancelBooking(booking.id)
      onChanged()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Cancellation failed')
      onChanged()
    } finally {
      setPending(false)
    }
  }

  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border border-hairline bg-card p-5 sm:p-6 ${stagger}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {booking.hotelName}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone">
            <MapPin size={14} aria-hidden />
            {booking.regionName}, {booking.countryName}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS[booking.status].style}`}
        >
          {STATUS[booking.status].label}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-faint">Room type</dt>
          <dd className="mt-0.5 font-medium">{booking.roomTypeName}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Guests</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium">
            <Users size={14} aria-hidden /> {booking.numGuests}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Check-in</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium">
            <CalendarDays size={14} aria-hidden /> {formatDate(booking.checkInDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Nights</dt>
          <dd className="mt-0.5 font-medium">
            {booking.nights} ({formatDate(booking.checkOutDate)} out)
          </dd>
        </div>
      </dl>

      {booking.checkedInAt && (
        <p className="text-xs text-slateblue">
          Checked in on {formatDateTime(booking.checkedInAt)}
        </p>
      )}

      {error && <ErrorState message={error} />}

      {cancellable && (
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="flex w-fit items-center gap-1.5 rounded-full border border-hairline px-4 py-1.5 text-sm font-medium transition hover:border-ink active:scale-[0.98] disabled:opacity-50"
        >
          <X size={15} aria-hidden /> {pending ? 'Cancelling…' : 'Cancel booking'}
        </button>
      )}
    </li>
  )
}

export default function BookingsPage() {
  const { data, isPending, error, reload } = useBookings()

  return (
    <div className="flex flex-col gap-8">
      <div className="rise">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-balance">
          My bookings
        </h1>
        <p className="mt-3 text-stone">Every stay you have booked with X Hotels.</p>
      </div>

      {isPending ? (
        <LoadingState label="Loading your bookings…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data && data.length === 0 ? (
        <EmptyState>
          No bookings yet.{' '}
          <Link to="/" className="font-medium text-ink underline">
            Browse hotels
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex max-w-3xl flex-col gap-5">
          {data?.map((booking, index) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onChanged={reload}
              stagger={`rise ${index === 1 ? 'rise-1' : index === 2 ? 'rise-2' : ''}`}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
