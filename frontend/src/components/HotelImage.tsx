import { useState } from 'react'

/**
 * Image with a guaranteed chain: API image first, owner photo second,
 * mock last. Each 404 steps down one level; the last fallback is trusted.
 */
export function HotelImage({
  src,
  fallback,
  finalFallback,
  alt,
  className,
  eager = false,
}: {
  src?: string
  fallback: string
  finalFallback?: string
  alt: string
  className?: string
  eager?: boolean
}) {
  const [level, setLevel] = useState(0)
  const shown = level === 0 && src ? src : level <= 1 ? fallback : (finalFallback ?? fallback)
  return (
    <img
      src={shown}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setLevel((l) => Math.min(l + 1, 2))}
    />
  )
}
