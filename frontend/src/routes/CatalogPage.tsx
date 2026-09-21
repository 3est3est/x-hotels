import { Search } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { HotelImage } from '../components/HotelImage'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { useCountries, useHotels } from '../lib/hooks'
import { useT } from '../lib/i18n'
import { localHotelImage, mockHotelImage } from '../lib/mockImages'

/** Filter state lives in the URL so a filtered view is reloadable and shareable.
 *  checkIn/nights/guests ride along from the landing search and are carried
 *  into each detail link so the booking form opens prefilled. */
function useFilters() {
  const [params, setParams] = useSearchParams()

  const countryId = params.get('countryId')
  const regionId = params.get('regionId')
  const q = params.get('q') ?? ''

  const update = useCallback(
    (next: { countryId?: string; regionId?: string; q?: string }) => {
      const merged = new URLSearchParams(params)
      for (const [key, value] of Object.entries(next)) {
        if (value) merged.set(key, value)
        else merged.delete(key)
      }
      setParams(merged, { replace: true })
    },
    [params, setParams],
  )

  const carry = new URLSearchParams()
  for (const key of ['checkIn', 'nights', 'guests']) {
    const value = params.get(key)
    if (value) carry.set(key, value)
  }
  const carrySuffix = carry.toString()

  return {
    countryId: countryId ? Number(countryId) : undefined,
    regionId: regionId ? Number(regionId) : undefined,
    q: q || undefined,
    rawCountryId: countryId ?? '',
    rawRegionId: regionId ?? '',
    rawQ: q,
    carrySuffix,
    update,
  }
}

export default function CatalogPage() {
  const t = useT()
  const filters = useFilters()
  const countries = useCountries()
  const hotels = useHotels({
    countryId: filters.countryId,
    regionId: filters.regionId,
    q: filters.q,
  })

  const selectedCountry = countries.data?.find((c) => c.id === filters.countryId)
  const regions = selectedCountry?.regions ?? []

  const regionGeo = new Map<number, { countryName: string; regionName: string }>()
  for (const country of countries.data ?? []) {
    for (const region of country.regions) {
      regionGeo.set(region.id, { countryName: country.name, regionName: region.name })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rise">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-balance">
          {t.hotels.title}
        </h1>
        <p className="mt-3 text-stone">
          {selectedCountry ? t.hotels.subtitleCountry(selectedCountry.name) : t.hotels.subtitleAll}
        </p>
      </div>

      <Card className="rise rise-1 grid gap-4 p-4 shadow-[0_1px_2px_rgb(24_24_27/0.04)] sm:grid-cols-3 sm:p-5">
        <Label>
          <LabelText>{t.hotels.country}</LabelText>
          <select
            className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
            value={filters.rawCountryId}
            onChange={(event) => {
              filters.update({ countryId: event.target.value, regionId: '' })
            }}
            disabled={countries.isPending}
          >
            <option value="">{t.hotels.allCountries}</option>
            {countries.data?.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </Label>

        <Label>
          <LabelText>{t.hotels.region}</LabelText>
          <select
            className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
            value={filters.rawRegionId}
            onChange={(event) => filters.update({ regionId: event.target.value })}
            disabled={!filters.countryId || regions.length === 0}
          >
            <option value="">{t.hotels.allRegions}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </Label>

        <Label>
          <LabelText>{t.hotels.search}</LabelText>
          <div className="relative">
            <Search size={16} className="absolute top-3 left-3 text-faint" aria-hidden />
            <Input
              type="search"
              className="w-full pr-3 pl-9"
              placeholder={t.hotels.hotelName}
              value={filters.rawQ}
              onChange={(event) => filters.update({ q: event.target.value })}
            />
          </div>
        </Label>
      </Card>

      {countries.error && <ErrorState message={countries.error} onRetry={countries.reload} />}

      {hotels.isPending ? (
        <LoadingState label={t.hotels.loading} />
      ) : hotels.error ? (
        <ErrorState message={hotels.error} onRetry={hotels.reload} />
      ) : hotels.data && hotels.data.length === 0 ? (
        <EmptyState>
          {t.hotels.noMatch}{' '}
          <Link to="/hotels" className="font-medium text-ink underline">
            {t.hotels.clearSearch}
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {hotels.data?.map((hotel, index) => (
            <li
              key={hotel.id}
              className={`rise ${index % 3 === 1 ? 'rise-1' : index % 3 === 2 ? 'rise-2' : ''}`}
            >
              <Link
                to={`/hotels/${hotel.id}${filters.carrySuffix ? `?${filters.carrySuffix}` : ''}`}
                className="group block h-full overflow-hidden rounded-2xl border border-hairline bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(24_24_27/0.10)]"
              >
                <div className="overflow-hidden">
                  <HotelImage
                    sources={[
                      hotel.images[0]?.url,
                      ...localHotelImage(
                        regionGeo.get(hotel.regionId)?.countryName ?? '',
                        regionGeo.get(hotel.regionId)?.regionName ?? '',
                      ),
                      mockHotelImage(hotel.id, 800, 500),
                    ]}
                    alt={hotel.name}
                    className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-display text-[26px] leading-tight font-semibold tracking-tight">
                    {hotel.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-[15px] text-stone">{hotel.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
