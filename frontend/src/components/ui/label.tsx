import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('flex flex-col gap-2 text-sm font-medium', className)}
      {...props}
    />
  )
}

export function LabelText({ children }: { children: React.ReactNode }) {
  return <span className="text-stone">{children}</span>
}
