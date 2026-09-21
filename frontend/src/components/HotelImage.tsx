import { useState } from 'react'

/** Image with a guaranteed fallback: API image first, mock second, never broken. */
export function HotelImage({
  src,
  fallback,
  alt,
  className,
  eager = false,
}: {
  src?: string
  fallback: string
  alt: string
  className?: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const shown = !failed && src ? src : fallback
  return (
    <img
      src={shown}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
    />
  )
}
