import { CalendarDays, MapPin, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { cancelBooking, useBookings } from '../lib/bookings'
import { formatDate, formatDateTime } from '../lib/format'
import { useT } from '../lib/i18n'
import type { Booking, BookingStatus } from '../lib/types'
import { Badge } from '../components/ui/badge'

function statusTone(status: BookingStatus): 'olive' | 'neutral' | 'slateblue' {
  if (status === 'CONFIRMED') return 'olive'
  if (status === 'CHECKED_IN') return 'slateblue'
  return 'neutral'
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
  const t = useT()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const cancellable = booking.status === 'CONFIRMED'
  const labels: Record<BookingStatus, string> = {
    CONFIRMED: t.bookings.confirmed,
    CANCELLED: t.bookings.cancelled,
    CHECKED_IN: t.bookings.checkedIn,
  }

  async function onCancel() {
    setError(null)
    setPending(true)
    try {
      await cancelBooking(booking.id)
      onChanged()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.bookings.cancelFailed)
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
        <Badge tone={statusTone(booking.status)}>{labels[booking.status]}</Badge>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-hairline pt-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-faint">{t.bookings.roomType}</dt>
          <dd className="mt-0.5 font-medium">{booking.roomTypeName}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">{t.bookings.guests}</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium">
            <Users size={14} aria-hidden /> {booking.numGuests}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-faint">{t.bookings.checkIn}</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium">
            <CalendarDays size={14} aria-hidden /> {formatDate(booking.checkInDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-faint">{t.bookings.nights}</dt>
          <dd className="mt-0.5 font-medium">
            {booking.nights} {t.bookings.out(formatDate(booking.checkOutDate))}
          </dd>
        </div>
      </dl>

      {booking.checkedInAt && (
        <p className="text-xs text-slateblue">
          {t.bookings.checkedInOn(formatDateTime(booking.checkedInAt))}
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
          <X size={15} aria-hidden /> {pending ? t.bookings.cancelling : t.bookings.cancel}
        </button>
      )}
    </li>
  )
}

export default function BookingsPage() {
  const t = useT()
  const { data, isPending, error, reload } = useBookings()

  return (
    <div className="flex flex-col gap-8">
      <div className="rise">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-balance">
          {t.bookings.title}
        </h1>
        <p className="mt-3 text-stone">{t.bookings.subtitle}</p>
      </div>

      {isPending ? (
        <LoadingState label={t.bookings.loading} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data && data.length === 0 ? (
        <EmptyState>
          {t.bookings.empty}{' '}
          <Link to="/hotels" className="font-medium text-ink underline">
            {t.bookings.browse}
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
