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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Find a hotel</h1>
        <p className="mt-1 text-neutral-400">Browse the X Hotels group by country, region or name.</p>
      </div>

      <div className="grid gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">Country</span>
          <select
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
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

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">Region</span>
          <select
            className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 disabled:opacity-50"
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

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-400">Search</span>
          <div className="relative">
            <Search size={16} className="absolute top-2.5 left-3 text-neutral-500" aria-hidden />
            <input
              type="search"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 py-2 pr-3 pl-9 text-neutral-100"
              placeholder="Hotel name"
              value={filters.rawQ}
              onChange={(event) => filters.update({ q: event.target.value })}
            />
          </div>
        </label>
      </div>

      {countries.error && (
        <ErrorState message={countries.error} onRetry={countries.reload} />
      )}

      {hotels.isPending ? (
        <LoadingState label="Loading hotels…" />
      ) : hotels.error ? (
        <ErrorState message={hotels.error} onRetry={hotels.reload} />
      ) : hotels.data && hotels.data.length === 0 ? (
        <EmptyState>No hotels match your filters.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {hotels.data?.map((hotel) => (
            <li key={hotel.id}>
              <Link
                to={`/hotels/${hotel.id}`}
                className="block h-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600"
              >
                {hotel.images[0] ? (
                  <img
                    src={hotel.images[0].url}
                    alt={hotel.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-neutral-800 text-neutral-500">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-medium">{hotel.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-400">{hotel.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}