import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from './api'
import type { Country, HotelDetail, HotelFilters, HotelSummary } from './types'

export type Resource<T> = {
  data: T | null
  isPending: boolean
  error: string | null
  reload: () => void
}

/**
 * Runs a typed-client call on mount and whenever `load` changes, tracking
 * pending/error state. `load` must be memoized (`useCallback`) — it is the
 * effect's dependency, so identity change is what re-fetches.
 */
export function useResource<T>(load: () => Promise<T>): Resource<T> {
  const [data, setData] = useState<T | null>(null)
  const [isPending, setIsPending] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsPending(true)
    setError(null)
    load()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(errorMessage(reason))
      })
      .finally(() => {
        if (!cancelled) setIsPending(false)
      })
    return () => {
      cancelled = true
    }
  }, [load, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { data, isPending, error, reload }
}

export function useCountries(): Resource<Country[]> {
  const load = useCallback(async () => {
    const response = await api.countries.get()
    if (response.error) throw response.error
    return response.data ?? []
  }, [])
  return useResource(load)
}

export function useHotels(filters: HotelFilters): Resource<HotelSummary[]> {
  const { countryId, regionId, q } = filters
  const load = useCallback(async () => {
    const response = await api.hotels.get({ query: { countryId, regionId, q } })
    if (response.error) throw response.error
    return response.data ?? []
  }, [countryId, regionId, q])
  return useResource(load)
}

export type HotelDetailState = Resource<HotelDetail> & { notFound: boolean }

export function useHotelDetail(id: number): HotelDetailState {
  const [notFound, setNotFound] = useState(false)
  const valid = Number.isInteger(id) && id > 0
  const load = useCallback(async () => {
    if (!valid) {
      setNotFound(true)
      return null
    }
    const response = await api.hotels({ id }).get()
    if (response.error) {
      if (response.status === 404) {
        setNotFound(true)
        return null
      }
      throw response.error
    }
    setNotFound(false)
    return response.data
  }, [id, valid])
  const resource = useResource(load)
  return { ...resource, notFound }
}