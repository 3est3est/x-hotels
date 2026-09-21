import { Search } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { useCountries, useHotels } from '../lib/hooks'

/** Filter state lives in the URL so a filtered view is reloadable and shareable. */
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

  return {
    countryId: countryId ? Number(countryId) : undefined,
    regionId: regionId ? Number(regionId) : undefined,
    q: q || undefined,
    rawCountryId: countryId ?? '',
    rawRegionId: regionId ?? '',
    rawQ: q,
    update,
  }
}

const inputClass =
  'rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink focus:border-ink focus:outline-none disabled:opacity-50'

export default function CatalogPage() {
  const filters = useFilters()
  const countries = useCountries()
  const hotels = useHotels({
    countryId: filters.countryId,
    regionId: filters.regionId,
    q: filters.q,
  })

  const selectedCountry = countries.data?.find((c) => c.id === filters.countryId)
  const regions = selectedCountry?.regions ?? []

  return (
    <div className="flex flex-col gap-8">
      <div className="rise max-w-xl">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-balance">
          Find your hotel
        </h1>
        <p className="mt-3 max-w-[52ch] text-stone">
          Every X Hotels branch, from Bangkok to Tel Aviv. Choose a country to begin.
        </p>
      </div>

      <div className="rise rise-1 grid gap-4 rounded-2xl border border-hairline bg-card p-4 shadow-[0_1px_2px_rgb(24_24_27/0.04)] sm:grid-cols-3 sm:p-5">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-stone">Country</span>
          <select
            className={inputClass}
            value={filters.rawCountryId}
            onChange={(event) => {
              filters.update({ countryId: event.target.value, regionId: '' })
            }}
            disabled={countries.isPending}
          >
            <option value="">All countries</option>
            {countries.data?.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-stone">Region</span>
          <select
            className={inputClass}
            value={filters.rawRegionId}
            onChange={(event) => filters.update({ regionId: event.target.value })}
            disabled={!filters.countryId || regions.length === 0}
          >
            <option value="">All regions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-stone">Search</span>
          <div className="relative">
            <Search size={16} className="absolute top-3 left-3 text-faint" aria-hidden />
            <input
              type="search"
              className={`${inputClass} w-full pr-3 pl-9`}
              placeholder="Hotel name"
              value={filters.rawQ}
              onChange={(event) => filters.update({ q: event.target.value })}
            />
          </div>
        </label>
      </div>

      {countries.error && <ErrorState message={countries.error} onRetry={countries.reload} />}

      {hotels.isPending ? (
        <LoadingState label="Loading hotels…" />
      ) : hotels.error ? (
        <ErrorState message={hotels.error} onRetry={hotels.reload} />
      ) : hotels.data && hotels.data.length === 0 ? (
        <EmptyState>
          No hotels match your filters.{' '}
          <Link to="/" className="font-medium text-ink underline">
            Clear the search
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {hotels.data?.map((hotel, index) => (
            <li key={hotel.id} className={`rise ${index % 3 === 1 ? 'rise-1' : index % 3 === 2 ? 'rise-2' : ''}`}>
              <Link
                to={`/hotels/${hotel.id}`}
                className="group block h-full overflow-hidden rounded-2xl border border-hairline bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(24_24_27/0.10)]"
              >
                {hotel.images[0] ? (
                  <div className="overflow-hidden">
                    <img
                      src={hotel.images[0].url}
                      alt={hotel.name}
                      className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-paper text-faint">
                    No image
                  </div>
                )}
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
