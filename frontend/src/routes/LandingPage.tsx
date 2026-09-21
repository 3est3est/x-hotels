import { ArrowRight, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { HotelImage } from '../components/HotelImage'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { useCountries, useHotels } from '../lib/hooks'
import { useT } from '../lib/i18n'
import { localHotelImage, mockHotelImage } from '../lib/mockImages'

/**
 * Destination + country only. Dates, nights and guests are entered again at
 * the booking form, so the search does not ask for them twice (Spec 0002, Q2).
 */
function SearchBar() {
  const navigate = useNavigate()
  const t = useT()
  const countries = useCountries()
  const [destination, setDestination] = useState('')
  const [countryId, setCountryId] = useState('')

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (countryId) params.set('countryId', countryId)
    if (destination.trim()) params.set('q', destination.trim())
    navigate(`/hotels?${params.toString()}`)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-2xl border border-hairline bg-card p-4 shadow-[0_16px_40px_rgb(24_24_27/0.10)] sm:grid-cols-[1.6fr_1fr_auto] sm:p-5 sm:items-end"
    >
      <Label>
        <LabelText>{t.landing.destination}</LabelText>
        <div className="relative">
          <Search size={16} className="absolute top-3 left-3 text-faint" aria-hidden />
          <Input
            className="w-full pr-3 pl-9"
            placeholder={t.landing.destinationPlaceholder}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </div>
      </Label>
      <Label>
        <LabelText>{t.landing.country}</LabelText>
        <select
          className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
          value={countryId}
          onChange={(event) => setCountryId(event.target.value)}
          disabled={countries.isPending}
        >
          <option value="">{t.landing.anywhere}</option>
          {countries.data?.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </Label>
      <Button type="submit" variant="primary">
        {t.landing.search}
      </Button>
    </form>
  )
}

export default function LandingPage() {
  const t = useT()
  const countries = useCountries()
  const hotels = useHotels({})
  const facts = [
    { title: t.landing.fact1Title, body: t.landing.fact1Body },
    { title: t.landing.fact2Title, body: t.landing.fact2Body },
    { title: t.landing.fact3Title, body: t.landing.fact3Body },
  ]

  return (
    <div className="flex flex-col gap-14">
      <section className="rise relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden">
        <HotelImage
          sources={[
            '/hotels/thailand/central/suite.jpg',
            'https://picsum.photos/seed/xhotel-hero/2400/1200',
          ]}
          alt={t.landing.heroAlt}
          eager
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
        <div className="relative mx-auto flex min-h-[82vh] w-full max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
          <p className="text-sm font-medium tracking-[0.2em] text-white/70 uppercase">
            Thailand · Israel
          </p>
          <h1 className="mt-4 max-w-[14ch] font-display text-6xl font-semibold tracking-tight text-balance text-white sm:text-8xl">
            {t.landing.title}
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-white/85">{t.landing.subtitle}</p>
          <div className="mt-8">
            <Button asChild variant="primary" className="bg-white px-7 py-3 text-ink hover:bg-zinc-200">
              <Link to="/hotels">
                {t.landing.browseAll} <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="rise rise-1 relative z-10 -mt-20 sm:-mt-24">
        <SearchBar />
      </div>

      <section className="flex flex-col gap-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold tracking-tight">{t.landing.stays}</h2>
          <Link to="/hotels" className="text-sm font-medium text-ink underline">
            {t.landing.viewAll}
          </Link>
        </div>
        {hotels.isPending || countries.isPending ? (
          <LoadingState label={t.common.loading} />
        ) : hotels.error ? (
          <ErrorState message={hotels.error} onRetry={hotels.reload} />
        ) : countries.error ? (
          <ErrorState message={countries.error} onRetry={countries.reload} />
        ) : (countries.data ?? []).length === 0 ? (
          <EmptyState>{t.landing.noFeatured}</EmptyState>
        ) : (
          (countries.data ?? []).map((country) => {
            const regionIds = new Set(country.regions.map((r) => r.id))
            const regionById = new Map(country.regions.map((r) => [r.id, r.name]))
            const stays = (hotels.data ?? []).filter((h) => regionIds.has(h.regionId))
            if (stays.length === 0) return null
            return (
              <div key={country.id} className="flex flex-col gap-5">
                <div className="flex items-baseline gap-3 border-b border-hairline pb-3">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">
                    {country.name}
                  </h3>
                  <span className="text-sm text-faint">{t.landing.stayCount(stays.length)}</span>
                </div>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {stays.map((hotel) => (
                    <li key={hotel.id}>
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="group block h-full overflow-hidden rounded-2xl border border-hairline bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(24_24_27/0.10)]"
                      >
                        <div className="overflow-hidden">
                          <HotelImage
                            sources={[
                              ...localHotelImage(country.name, regionById.get(hotel.regionId) ?? ''),
                              hotel.images[0]?.url,
                              mockHotelImage(hotel.id, 600, 400),
                            ]}
                            alt={hotel.name}
                            className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-display text-xl leading-tight font-semibold tracking-tight">
                            {hotel.name}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-sm text-stone">
                            {hotel.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </section>

      <section className="grid gap-8 rounded-2xl border border-hairline bg-card p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance">
          {t.landing.sellingTitle}
        </h2>
        <ul className="flex flex-col divide-y divide-hairline">
          {facts.map((fact) => (
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
