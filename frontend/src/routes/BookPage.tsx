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
import { mockRoomImage } from '../lib/mockImages'
import { formatPrice, pricePerNight } from '../lib/prices'
import type { Country, HotelDetail } from '../lib/types'

export type BookableRoom = {
  hotelId: number
  hotelName: string
  countryId: number
  countryName: string
  regionId: number
  regionName: string
  roomTypeId: number
  roomTypeName: string
  description: string
  capacity: number
  imageUrl?: string
  price: number
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

function useBookableRooms(): ReturnType<typeof useResource<BookableRoom[]>> {
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

    const rooms: BookableRoom[] = []
    for (const detail of details) {
      if (!detail) continue
      const geo = regionToCountry.get(detail.regionId)
      for (const room of detail.roomTypes) {
        rooms.push({
          hotelId: detail.id,
          hotelName: detail.name,
          countryId: geo?.countryId ?? 0,
          countryName: geo?.countryName ?? detail.countryName,
          regionId: detail.regionId,
          regionName: detail.regionName,
          roomTypeId: room.id,
          roomTypeName: room.name,
          description: room.description,
          capacity: room.capacity,
          imageUrl: room.images[0]?.url,
          price: pricePerNight(room.name),
        })
      }
    }
    return rooms
  }, [])
  return useResource(load)
}

export default function BookPage() {
  const t = useT()
  const filters = useBookFilters()
  const countries = useCountries()
  const rooms = useBookableRooms()

  const selectedCountry = countries.data?.find((c) => String(c.id) === filters.countryId)
  const regions = selectedCountry?.regions ?? []

  const visible = (rooms.data ?? [])
    .filter((room) => {
      if (filters.countryId && String(room.countryId) !== filters.countryId) return false
      if (filters.regionId && String(room.regionId) !== filters.regionId) return false
      if (filters.q) {
        const hay = `${room.hotelName} ${room.roomTypeName}`.toLowerCase()
        if (!hay.includes(filters.q.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => {
      if (filters.sort === 'asc') return a.price - b.price
      if (filters.sort === 'desc') return b.price - a.price
      return a.hotelId - b.hotelId || a.price - b.price
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

      {rooms.isPending ? (
        <LoadingState label={t.book.loading} />
      ) : rooms.error ? (
        <ErrorState message={rooms.error} onRetry={rooms.reload} />
      ) : visible.length === 0 ? (
        <EmptyState>{t.book.noMatch}</EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((room, index) => (
            <li
              key={`${room.hotelId}-${room.roomTypeId}`}
              className={`rise ${index % 3 === 1 ? 'rise-1' : index % 3 === 2 ? 'rise-2' : ''}`}
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(24_24_27/0.10)]">
                <div className="overflow-hidden">
                  <HotelImage
                    src={room.imageUrl}
                    fallback={mockRoomImage(room.hotelId, room.roomTypeId, 600, 400)}
                    alt={room.roomTypeName}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <p className="flex items-center gap-1.5 text-xs text-faint">
                    <MapPin size={13} aria-hidden />
                    {room.regionName}, {room.countryName}
                  </p>
                  <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight">
                    {room.hotelName} · {room.roomTypeName}
                  </h2>
                  <p className="text-sm text-stone">
                    {t.bookings.guests}: {room.capacity} · {formatPrice(room.price)} {t.common.perNight}
                  </p>
                  <Link
                    to={`/hotels/${room.hotelId}?book=${room.roomTypeId}`}
                    className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink transition hover:brightness-95 active:scale-[0.98]"
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
