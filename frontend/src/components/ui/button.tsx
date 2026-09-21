import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // The single gold accent: primary actions only.
        primary: 'bg-gold px-5 py-2.5 text-ink hover:brightness-95',
        dark: 'bg-ink px-5 py-2.5 text-white hover:bg-zinc-700',
        outline: 'border border-hairline bg-card px-4 py-2 hover:border-ink',
        ghost: 'px-3 py-1.5 text-stone hover:text-ink',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, className }))} {...props} />
}
