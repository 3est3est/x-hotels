import { CalendarDays, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ErrorState } from './StateMessages'
import { HotelImage } from './HotelImage'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label, LabelText } from './ui/label'
import { createBooking } from '../lib/bookings'
import { useSession } from '../lib/auth'
import { draftParams, type BookingDraft } from '../lib/bookingDraft'
import { useT } from '../lib/i18n'
import { localRoomImage, mockRoomImage } from '../lib/mockImages'
import type { RoomType } from '../lib/types'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * The create-booking form for one Room Type. Unauthenticated guests register
 * first, with their intent encoded in the return path (Spec 0002, story 5).
 */
export function BookingForm({
  hotelId,
  roomType,
  draft,
  countryName = '',
  regionName = '',
}: {
  hotelId: number
  roomType: RoomType
  draft: BookingDraft
  countryName?: string
  regionName?: string
}) {
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const t = useT()
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
      // ADR 0005: booking takes a plain session — anonymous guests register,
      // no document step exists anywhere in the flow.
      navigate(`/register?redirect=${encodeURIComponent(returnPath())}`, { replace: true })
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
      setError(reason instanceof Error ? reason.message : t.bookings.cancelFailed)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <Button asChild variant="dark">
        <Link to={`?${draftParams({ roomTypeId: roomType.id, guests, checkIn, nights })}`}>
          {t.bookForm.open}
        </Link>
      </Button>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-hairline bg-paper p-4"
    >
      <HotelImage
        sources={[
          ...localRoomImage(countryName, regionName, roomType.name),
          roomType.images[0]?.url,
          mockRoomImage(hotelId, roomType.id, 600, 300),
        ]}
        alt={roomType.name}
        className="aspect-[16/8] w-full rounded-xl object-cover"
      />
      {error && <ErrorState message={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Label>
          <LabelText>
            <span className="flex items-center gap-1.5">
              <Users size={14} aria-hidden /> {t.bookForm.guests}
            </span>
          </LabelText>
          <Input
            type="number"
            min={1}
            required
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
          />
        </Label>
        <Label>
          <LabelText>{t.bookForm.nights}</LabelText>
          <Input
            type="number"
            min={1}
            required
            value={nights}
            onChange={(event) => setNights(Number(event.target.value))}
          />
        </Label>
      </div>
      <Label>
        <LabelText>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden /> {t.bookForm.checkIn}
          </span>
        </LabelText>
        <Input
          type="date"
          required
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />
      </Label>
      <Button type="submit" variant="primary" disabled={submitting || !canEnter}>
        {submitting ? t.bookForm.submitting : t.bookForm.confirm}
      </Button>
    </form>
  )
}
