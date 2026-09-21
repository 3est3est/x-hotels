import { CalendarDays, MapPin, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { cancelBooking, useBookings } from '../lib/bookings'
import { formatDate, formatDateTime } from '../lib/format'
import type { Booking, BookingStatus } from '../lib/types'

const STATUS_STYLES: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-emerald-950/60 text-emerald-300 border-emerald-900',
  CANCELLED: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  CHECKED_IN: 'bg-sky-950/60 text-sky-300 border-sky-900',
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  CHECKED_IN: 'Checked in',
}

function BookingCard({ booking, onChanged }: { booking: Booking; onChanged: () => void }) {
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
    <li className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">{booking.hotelName}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-400">
            <MapPin size={15} aria-hidden />
            {booking.regionName}, {booking.countryName}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
        >
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm text-neutral-300 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-neutral-500">Room type</dt>
          <dd>{booking.roomTypeName}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Guests</dt>
          <dd className="flex items-center gap-1">
            <Users size={14} aria-hidden /> {booking.numGuests}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Check-in</dt>
          <dd className="flex items-center gap-1">
            <CalendarDays size={14} aria-hidden /> {formatDate(booking.checkInDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Nights</dt>
          <dd>
            {booking.nights} · until {formatDate(booking.checkOutDate)}
          </dd>
        </div>
      </dl>

      {booking.checkedInAt && (
        <p className="text-xs text-sky-300">
          Checked in on {formatDateTime(booking.checkedInAt)}
        </p>
      )}

      {error && <ErrorState message={error} />}

      {cancellable && (
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="flex w-fit items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:border-red-800 hover:text-red-300 disabled:opacity-50"
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My bookings</h1>
        <p className="mt-1 text-neutral-400">Every stay you have reserved with X Hotels.</p>
      </div>

      {isPending ? (
        <LoadingState label="Loading your bookings…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data && data.length === 0 ? (
        <EmptyState>
          No bookings yet.{' '}
          <Link to="/" className="text-white underline">
            Browse hotels
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {data?.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onChanged={reload} />
          ))}
        </ul>
      )}
    </div>
  )
}