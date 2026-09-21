import { useCallback } from 'react'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { Card } from '../components/ui/card'
import { api } from '../lib/api'
import { useResource } from '../lib/hooks'

type Stats = NonNullable<Awaited<ReturnType<typeof api.management.stats.get>>['data']>
type RankedEntry = { id: number; name: string; bookings: number }

function Ranked({
  title,
  entry,
  empty,
}: {
  title: string
  entry: RankedEntry | null
  empty: string
}) {
  return (
    <Card className="flex flex-col gap-1 p-5">
      <span className="text-sm text-stone">{title}</span>
      {entry ? (
        <>
          <span className="font-display text-3xl font-semibold tracking-tight">{entry.name}</span>
          <span className="text-sm text-faint">
            {entry.bookings} {entry.bookings === 1 ? 'booking' : 'bookings'}
          </span>
        </>
      ) : (
        <span className="font-display text-2xl font-semibold text-faint">{empty}</span>
      )}
    </Card>
  )
}

export default function ManagementPage() {
  const load = useCallback(async () => {
    const response = await api.management.stats.get()
    if (response.error) throw response.error
    return response.data
  }, [])
  const { data: stats, isPending, error, reload } = useResource<Stats | null>(load)

  return (
    <div className="flex flex-col gap-8">
      <div className="rise">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-balance">
          Business dashboard
        </h1>
        <p className="mt-3 text-stone">Bookings and check-ins across the group.</p>
      </div>

      {isPending ? (
        <LoadingState label="Loading statistics…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !stats ? (
        <EmptyState>No statistics available.</EmptyState>
      ) : (
        <>
          <div className="rise rise-1 grid gap-4 sm:grid-cols-3">
            <Card className="flex flex-col gap-1 p-5">
              <span className="text-sm text-stone">Total bookings</span>
              <span className="font-display text-4xl font-semibold">{stats.totalBookings}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-5">
              <span className="text-sm text-stone">Actual check-ins</span>
              <span className="font-display text-4xl font-semibold">{stats.actualCheckIns}</span>
            </Card>
            <Card className="flex flex-col gap-1 border-gold/40 bg-gold-bg p-5">
              <span className="text-sm text-stone">Check-in rate</span>
              <span className="font-display text-4xl font-semibold">
                {stats.checkInPercentage.toFixed(0)}
                <span className="text-2xl">%</span>
              </span>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Ranked title="Most booked room type" entry={stats.mostBookedRoomType} empty="No bookings" />
            <Ranked title="Most booked hotel" entry={stats.mostBookedHotel} empty="No bookings" />
            <Ranked title="Most booked region" entry={stats.mostBookedRegion} empty="No bookings" />
            <Ranked title="Most booked country" entry={stats.mostBookedCountry} empty="No bookings" />
          </div>
        </>
      )}
    </div>
  )
}
