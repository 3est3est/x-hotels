import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

/** Small status pill. Semantic tones only (muted olive/slate); gold never appears here. */
export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'olive' | 'slateblue'
}) {
  const tones = {
    neutral: 'border-hairline bg-paper text-faint',
    olive: 'border-olive/30 bg-olive-bg text-olive',
    slateblue: 'border-slateblue/30 bg-slateblue-bg text-slateblue',
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
