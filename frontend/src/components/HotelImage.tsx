import { useState } from 'react'

/**
 * Image with a guaranteed chain: each 404 steps to the next source, so
 * owner photos light up the moment they land in `public/` with no code
 * change. The last source is trusted (mock).
 */
export function HotelImage({
  sources,
  alt,
  className,
  eager = false,
}: {
  sources: (string | undefined)[]
  alt: string
  className?: string
  eager?: boolean
}) {
  const chain = sources.filter((s): s is string => Boolean(s))
  const [level, setLevel] = useState(0)
  const shown = chain[Math.min(level, chain.length - 1)]
  return (
    <img
      src={shown}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setLevel((l) => (l < chain.length - 1 ? l + 1 : l))}
    />
  )
}
