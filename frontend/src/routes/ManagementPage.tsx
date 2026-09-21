import { ArrowRight } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessages'
import { Card } from '../components/ui/card'
import { api } from '../lib/api'
import { useResource } from '../lib/hooks'
import { useT } from '../lib/i18n'

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
  const t = useT()
  return (
    <Card className="flex flex-col gap-1 p-5">
      <span className="text-sm text-stone">{title}</span>
      {entry ? (
        <>
          <span className="font-display text-3xl font-semibold tracking-tight">{entry.name}</span>
          <span className="text-sm text-faint">{t.management.bookingsCount(entry.bookings)}</span>
        </>
      ) : (
        <span className="font-display text-2xl font-semibold text-faint">{empty}</span>
      )}
    </Card>
  )
}

export default function ManagementPage() {
  const t = useT()
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
          {t.management.title}
        </h1>
        <p className="mt-3 text-stone">{t.management.subtitle}</p>
        <Link
          to="/management/bookings"
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98]"
        >
          {t.management.allBookings} <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      {isPending ? (
        <LoadingState label={t.management.loading} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !stats ? (
        <EmptyState>{t.management.noStats}</EmptyState>
      ) : (
        <>
          <div className="rise rise-1 grid gap-4 sm:grid-cols-3">
            <Card className="flex flex-col gap-1 p-5">
              <span className="text-sm text-stone">{t.management.total}</span>
              <span className="font-display text-4xl font-semibold">{stats.totalBookings}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-5">
              <span className="text-sm text-stone">{t.management.checkIns}</span>
              <span className="font-display text-4xl font-semibold">{stats.actualCheckIns}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-5">
              <span className="text-sm text-stone">{t.management.rate}</span>
              <span className="font-display text-4xl font-semibold">
                {stats.checkInPercentage.toFixed(0)}
                <span className="text-2xl">%</span>
              </span>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Ranked title={t.management.mostRoom} entry={stats.mostBookedRoomType} empty={t.management.none} />
            <Ranked title={t.management.mostHotel} entry={stats.mostBookedHotel} empty={t.management.none} />
            <Ranked title={t.management.mostRegion} entry={stats.mostBookedRegion} empty={t.management.none} />
            <Ranked title={t.management.mostCountry} entry={stats.mostBookedCountry} empty={t.management.none} />
          </div>
        </>
      )}
    </div>
  )
}
