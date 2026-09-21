import { ArrowRight, MapPin } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { HotelImage } from '../components/HotelImage'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { api } from '../lib/api'
import { useCountries, useResource } from '../lib/hooks'
import { useT } from '../lib/i18n'
import { localHotelImage, mockHotelImage } from '../lib/mockImages'
import { formatPrice, pricePerNight } from '../lib/prices'
import type { Country, HotelDetail, HotelSummary } from '../lib/types'

export type BookableHotel = {
  hotel: HotelSummary
  countryId: number
  countryName: string
  regionName: string
  fromPrice: number
}

type Sort = 'recommended' | 'asc' | 'desc'

function useBookFilters() {
  const [params, setParams] = useSearchParams()
  const get = (key: string) => params.get(key) ?? ''

  const update = useCallback(
    (next: Record<string, string>) => {
      const merged = new URLSearchParams(params)
      for (const [key, value] of Object.entries(next)) {
        if (value) merged.set(key, value)
        else merged.delete(key)
      }
      setParams(merged, { replace: true })
    },
    [params, setParams],
  )

  return {
    countryId: get('countryId'),
    regionId: get('regionId'),
    q: get('q'),
    sort: (get('sort') || 'recommended') as Sort,
    update,
  }
}

function useBookableHotels(): ReturnType<typeof useResource<BookableHotel[]>> {
  const load = useCallback(async () => {
    const [countriesRes, hotelsRes] = await Promise.all([api.countries.get(), api.hotels.get()])
    if (countriesRes.error) throw countriesRes.error
    if (hotelsRes.error) throw hotelsRes.error
    const countries: Country[] = countriesRes.data ?? []
    const hotels = hotelsRes.data ?? []

    const regionToCountry = new Map<number, { countryId: number; countryName: string }>()
    for (const country of countries) {
      for (const region of country.regions) {
        regionToCountry.set(region.id, { countryId: country.id, countryName: country.name })
      }
    }

    const details = await Promise.all(
      hotels.map(async (hotel) => {
        const res = await api.hotels({ id: hotel.id }).get()
        if (res.error || !res.data) return null
        return res.data as HotelDetail
      }),
    )

    const rows: BookableHotel[] = []
    hotels.forEach((hotel, i) => {
      const detail = details[i]
      if (!detail || detail.roomTypes.length === 0) return
      const geo = regionToCountry.get(hotel.regionId)
      const fromPrice = Math.min(
        ...detail.roomTypes.map((room) => pricePerNight(room.name, hotel.id)),
      )
      rows.push({
        hotel,
        countryId: geo?.countryId ?? 0,
        countryName: geo?.countryName ?? detail.countryName,
        regionName: detail.regionName,
        fromPrice,
      })
    })
    return rows
  }, [])
  return useResource(load)
}

export default function BookPage() {
  const t = useT()
  const filters = useBookFilters()
  const countries = useCountries()
  const rows = useBookableHotels()

  const selectedCountry = countries.data?.find((c) => String(c.id) === filters.countryId)
  const regions = selectedCountry?.regions ?? []

  const visible = (rows.data ?? [])
    .filter((row) => {
      if (filters.countryId && String(row.countryId) !== filters.countryId) return false
      if (filters.regionId && String(row.hotel.regionId) !== filters.regionId) return false
      if (filters.q && !row.hotel.name.toLowerCase().includes(filters.q.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (filters.sort === 'asc') return a.fromPrice - b.fromPrice
      if (filters.sort === 'desc') return b.fromPrice - a.fromPrice
      return a.hotel.id - b.hotel.id
    })

  return (
    <div className="flex flex-col gap-8">
      <div className="rise">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-balance">
          {t.book.title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-stone">{t.book.subtitle}</p>
      </div>

      <Card className="rise rise-1 grid gap-4 p-4 shadow-[0_1px_2px_rgb(24_24_27/0.04)] sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
        <Label>
          <LabelText>{t.book.country}</LabelText>
          <select
            className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
            value={filters.countryId}
            onChange={(event) => filters.update({ countryId: event.target.value, regionId: '' })}
            disabled={countries.isPending}
          >
            <option value="">{t.book.allCountries}</option>
            {countries.data?.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </Label>
        <Label>
          <LabelText>{t.book.region}</LabelText>
          <select
            className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
            value={filters.regionId}
            onChange={(event) => filters.update({ regionId: event.target.value })}
            disabled={!filters.countryId || regions.length === 0}
          >
            <option value="">{t.book.allRegions}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </Label>
        <Label>
          <LabelText>{t.book.search}</LabelText>
          <Input
            type="search"
            placeholder={t.book.hotelName}
            value={filters.q}
            onChange={(event) => filters.update({ q: event.target.value })}
          />
        </Label>
        <Label className="lg:col-span-2">
          <LabelText>{t.book.sort}</LabelText>
          <select
            className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none"
            value={filters.sort}
            onChange={(event) => filters.update({ sort: event.target.value })}
          >
            <option value="recommended">{t.book.recommended}</option>
            <option value="asc">{t.book.priceAsc}</option>
            <option value="desc">{t.book.priceDesc}</option>
          </select>
        </Label>
      </Card>

      {rows.isPending ? (
        <LoadingState label={t.book.loading} />
      ) : rows.error ? (
        <ErrorState message={rows.error} onRetry={rows.reload} />
      ) : visible.length === 0 ? (
        <EmptyState>{t.book.noMatch}</EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((row, index) => (
            <li
              key={row.hotel.id}
              className={`rise ${index % 3 === 1 ? 'rise-1' : index % 3 === 2 ? 'rise-2' : ''}`}
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(24_24_27/0.10)]">
                <div className="overflow-hidden">
                  <HotelImage
                    src={row.hotel.images[0]?.url}
                    fallback={localHotelImage(row.countryName, row.regionName)}
                    finalFallback={mockHotelImage(row.hotel.id, 600, 400)}
                    alt={row.hotel.name}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <p className="flex items-center gap-1.5 text-xs text-faint">
                    <MapPin size={13} aria-hidden />
                    {row.regionName}, {row.countryName}
                  </p>
                  <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight">
                    {row.hotel.name}
                  </h2>
                  <p className="text-sm text-stone">
                    {t.book.from} {formatPrice(row.fromPrice)} {t.common.perNight}
                  </p>
                  <Link
                    to={`/hotels/${row.hotel.id}`}
                    className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98]"
                  >
                    {t.book.select} <ArrowRight size={15} aria-hidden />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
