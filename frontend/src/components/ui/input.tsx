import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

/** Label sits above the input; helper/error text below it at the call site. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'rounded-xl border border-hairline bg-card px-3 py-2.5 text-ink placeholder:text-faint focus:border-ink focus:outline-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
