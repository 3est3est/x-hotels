import { AlertCircle, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useT } from '../lib/i18n'

export function LoadingState({ label }: { label?: string }) {
  const t = useT()
  label ??= t.common.loading
  return (
    <div className="flex items-center gap-2 py-12 text-stone" role="status">
      <LoaderCircle size={18} className="animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-hairline bg-card p-5">
      <div className="flex items-center gap-2 text-ink">
        <AlertCircle size={18} aria-hidden />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-hairline px-4 py-1.5 text-sm font-medium transition hover:border-ink active:scale-[0.98]"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-card p-10 text-center text-stone">
      {children}
    </div>
  )
}

export function NotFoundState({ title = 'Not found', children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-hairline bg-card p-10 text-center">
      <h1 className="font-display text-4xl font-semibold">{title}</h1>
      {children && <div className="mt-3 text-stone">{children}</div>}
    </div>
  )
}
