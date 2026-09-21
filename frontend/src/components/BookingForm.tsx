import { CalendarDays, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ErrorState } from './StateMessages'
import { createBooking } from '../lib/bookings'
import { useSession } from '../lib/auth'
import { draftParams, type BookingDraft } from '../lib/bookingDraft'
import type { RoomType } from '../lib/types'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * The create-booking form for one Room Type. Unauthenticated or unverified guests
 * are redirected with their intent encoded in the return path, so verifying and
 * coming back needs no re-entry (Spec 0001, story 19).
 */
export function BookingForm({
  hotelId,
  roomType,
  draft,
}: {
  hotelId: number
  roomType: RoomType
  draft: BookingDraft
}) {
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const open = draft.roomTypeId === roomType.id

  const [guests, setGuests] = useState(draft.guests ?? 1)
  const [checkIn, setCheckIn] = useState(draft.checkIn ?? today())
  const [nights, setNights] = useState(draft.nights ?? 1)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canEnter = guests >= 1 && nights >= 1 && /^\d{4}-\d{2}-\d{2}$/.test(checkIn)

  function returnPath(): string {
    const query = draftParams({ roomTypeId: roomType.id, guests, checkIn, nights })
    return `${location.pathname}?${query}`
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (sessionPending) return
    if (!session?.user) {
      navigate(`/login?redirect=${encodeURIComponent(returnPath())}`, { replace: true })
      return
    }
    if (!session.user.verifiedAt) {
      navigate(`/verify?redirect=${encodeURIComponent(returnPath())}`, { replace: true })
      return
    }

    setSubmitting(true)
    try {
      await createBooking({
        hotelId,
        roomTypeId: roomType.id,
        numGuests: guests,
        checkInDate: checkIn,
        nights,
      })
      navigate('/bookings')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <Link
        to={`?${draftParams({ roomTypeId: roomType.id, guests, checkIn, nights })}`}
        className="rounded-md border border-neutral-700 px-3 py-2 text-center text-sm hover:border-neutral-500"
      >
        Book this room type
      </Link>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-md border border-neutral-700 p-3">
      {error && <ErrorState message={error} />}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Users size={14} aria-hidden /> Guests
          </span>
          <input
            type="number"
            min={1}
            required
            className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          <span>Nights</span>
          <input
            type="number"
            min={1}
            required
            className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
            value={nights}
            onChange={(event) => setNights(Number(event.target.value))}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <CalendarDays size={14} aria-hidden /> Check-in
        </span>
        <input
          type="date"
          required
          className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={submitting || !canEnter}
        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
      >
        {submitting ? 'Booking…' : 'Confirm booking'}
      </button>
    </form>
  )
}