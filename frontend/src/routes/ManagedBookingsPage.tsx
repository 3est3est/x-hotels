import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { Badge } from '../components/ui/badge'
import { useManagementBookings, type ManagementBooking } from '../lib/bookings'
import { formatDate } from '../lib/format'
import { useT } from '../lib/i18n'
import type { BookingStatus } from '../lib/types'

function statusTone(status: BookingStatus): 'emerald' | 'neutral' | 'sky' {
  if (status === 'CONFIRMED') return 'emerald'
  if (status === 'CHECKED_IN') return 'sky'
  return 'neutral'
}

function ManagedRow({ booking }: { booking: ManagementBooking }) {
  const t = useT()
  const labels: Record<BookingStatus, string> = {
    CONFIRMED: t.bookings.confirmed,
    CANCELLED: t.bookings.cancelled,
    CHECKED_IN: t.bookings.checkedIn,
  }
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-hairline bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-faint">{t.managed.guest}</p>
          <h2 className="mt-0.5 font-medium">{booking.guestName}</h2>
          <p className="text-sm text-faint">{booking.guestEmail}</p>
        </div>
        <Badge tone={statusTone(booking.status)}>{labels[booking.status]}</Badge>
      </div>
      <div className="border-t border-hairline pt-3 text-sm">
        <p className="font-medium">{booking.hotelName}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-stone">
          <MapPin size={14} aria-hidden />
          {booking.regionName}, {booking.countryName}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-stone">
          <span>{booking.roomTypeName}</span>
          <span className="flex items-center gap-1">
            <Users size={14} aria-hidden /> {booking.numGuests}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={14} aria-hidden /> {formatDate(booking.checkInDate)}
          </span>
          <span>
            {booking.nights} {t.bookings.nights.toLowerCase()}
          </span>
        </p>
      </div>
    </li>
  )
}

export default function ManagedBookingsPage() {
  const t = useT()
  const { data, isPending, error, reload } = useManagementBookings()

  return (
    <div className="flex flex-col gap-8">
      <div className="rise">
        <Link
          to="/management"
          className="flex items-center gap-1.5 text-sm font-medium text-stone hover:text-ink"
        >
          <ArrowRight size={16} className="rotate-180" aria-hidden /> {t.management.title}
        </Link>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-balance">
          {t.managed.title}
        </h1>
        <p className="mt-3 text-stone">{t.managed.subtitle}</p>
      </div>

      {isPending ? (
        <LoadingState label={t.managed.loading} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState>{t.managed.empty}</EmptyState>
      ) : (
        <ul className="flex max-w-3xl flex-col gap-4">
          {data.map((booking) => (
            <ManagedRow key={booking.id} booking={booking} />
          ))}
        </ul>
      )}
    </div>
  )
}
