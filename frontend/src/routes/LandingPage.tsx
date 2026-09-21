import { ArrowRight, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { HotelImage } from '../components/HotelImage'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { useCountries, useHotels } from '../lib/hooks'
import { mockHotelImage } from '../lib/mockImages'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Destination + dates + guests, carried to /hotels in the query. Dates and
 * guests prefill the booking form downstream; nothing here claims to filter
 * by availability (the system has none by design).
 */
function SearchBar() {
  const navigate = useNavigate()
  const countries = useCountries()
  const [destination, setDestination] = useState('')
  const [countryId, setCountryId] = useState('')
  const [checkIn, setCheckIn] = useState(today())
  const [nights, setNights] = useState(1)
  const [guests, setGuests] = useState(2)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (countryId) params.set('countryId', countryId)
    if (destination.trim()) params.set('q', destination.trim())
    params.set('checkIn', checkIn)
    params.set('nights', String(nights))
    params.set('guests', String(guests))
    navigate(`/hotels?${params.toString()}`)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-2xl border border-hairline bg-card p-4 shadow-[0_16px_40px_rgb(24_24_27/0.10)] sm:p-5 lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.7fr_auto] lg:items-end"
    >
      <Label>
        <LabelText>Destination</LabelText>
        <div className="relative">
          <Search size={16} className="absolute top-3 left-3 text-faint" aria-hidden />
          <Input
            className="w-full pr-3 pl-9"
            placeholder="City or hotel name"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </div>
      </Label>
      <Label>
        <LabelText>Country</LabelText>
        <select
          className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
          value={countryId}
          onChange={(event) => setCountryId(event.target.value)}
          disabled={countries.isPending}
        >
          <option value="">Anywhere</option>
          {countries.data?.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </Label>
      <Label>
        <LabelText>Check-in</LabelText>
        <Input
          type="date"
          required
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />
      </Label>
      <Label>
        <LabelText>Nights</LabelText>
        <Input
          type="number"
          min={1}
          required
          value={nights}
          onChange={(event) => setNights(Number(event.target.value))}
        />
      </Label>
      <Label>
        <LabelText>Guests</LabelText>
        <Input
          type="number"
          min={1}
          required
          value={guests}
          onChange={(event) => setGuests(Number(event.target.value))}
        />
      </Label>
      <Button type="submit" variant="primary">
        Search
      </Button>
    </form>
  )
}

const FACTS = [
  {
    title: 'Pay at the hotel',
    body: 'No online prepayment. Every booking settles on-site.',
  },
  {
    title: 'Twelve branches, two countries',
    body: 'One X Hotel per region across Thailand and Israel.',
  },
  {
    title: 'Free cancellation',
    body: 'Plans change. Cancel any booking with no penalty.',
  },
]

export default function LandingPage() {
  const hotels = useHotels({})
  const featured = hotels.data?.slice(0, 4) ?? []

  return (
    <div className="flex flex-col gap-14">
      <section className="rise grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Twelve hotels. Two countries. One key.
          </h1>
          <p className="mt-4 max-w-[48ch] text-lg text-stone">
            X Hotels branches across Thailand and Israel, bookable in a minute.
          </p>
          <Button asChild variant="dark" className="mt-6">
            <Link to="/hotels">
              Browse all hotels <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-hairline">
          <HotelImage
            fallback="https://picsum.photos/seed/xhotel-hero/1200/800"
            alt="X Hotel lobby at dusk"
            className="aspect-[4/3] w-full object-cover"
            eager
          />
        </div>
      </section>

      <div className="rise rise-1">
        <SearchBar />
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Featured stays</h2>
          <Link to="/hotels" className="text-sm font-medium text-ink underline">
            View all
          </Link>
        </div>
        {hotels.isPending ? (
          <LoadingState label="Loading hotels…" />
        ) : hotels.error ? (
          <ErrorState message={hotels.error} onRetry={hotels.reload} />
        ) : featured.length === 0 ? (
          <EmptyState>No hotels to feature yet.</EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((hotel) => (
              <li key={hotel.id}>
                <Link
                  to={`/hotels/${hotel.id}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-hairline bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(24_24_27/0.10)]"
                >
                  <div className="overflow-hidden">
                    <HotelImage
                      src={hotel.images[0]?.url}
                      fallback={mockHotelImage(hotel.id, 600, 400)}
                      alt={hotel.name}
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-xl leading-tight font-semibold tracking-tight">
                      {hotel.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-stone">{hotel.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-8 rounded-2xl border border-hairline bg-card p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance">
          Booked in a minute. Paid at the door.
        </h2>
        <ul className="flex flex-col divide-y divide-hairline">
          {FACTS.map((fact) => (
            <li key={fact.title} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
              <span className="font-medium">{fact.title}</span>
              <span className="text-[15px] text-stone">{fact.body}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
