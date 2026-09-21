import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

/** Small status pill. Original semantic tones; monochrome everywhere else. */
export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'emerald' | 'sky'
}) {
  const tones = {
    neutral: 'border-hairline bg-paper text-faint',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
  } as const
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
