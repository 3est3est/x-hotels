import { AlertCircle, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-12 text-neutral-400">
      <LoaderCircle size={18} className="animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-4">
      <div className="flex items-center gap-2 text-red-300">
        <AlertCircle size={18} aria-hidden />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-red-800 px-3 py-1.5 text-sm text-red-200 hover:bg-red-900/40"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-neutral-400">
      {children}
    </div>
  )
}

export function NotFoundState({ title = 'Not found', children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children && <div className="mt-2 text-neutral-400">{children}</div>}
    </div>
  )
}