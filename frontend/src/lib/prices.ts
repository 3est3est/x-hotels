/**
 * Mock nightly prices until the system owns real rates (Spec 0002, Q1a: the
 * hotels are illustrative and the site only books — no backend price field
 * exists, so inventing a migration for fiction was refused). Keyed by room
 * type NAME, which is stable across databases; ids are not.
 */
const PRICE_BY_ROOM_TYPE: Record<string, number> = {
  Deluxe: 8900,
  Family: 15500,
  Suite: 24000,
}

export const CURRENCY = '฿'

export function pricePerNight(roomTypeName: string, hotelId = 0): number {
  const base = PRICE_BY_ROOM_TYPE[roomTypeName] ?? 6900
  // Deterministic per-hotel variance so rates differ branch to branch,
  // exactly like a real group pricelist. Stable for a given hotel id.
  const flux = ((hotelId * 7919) % 7) - 3
  return base + flux * 300
}

export function formatPrice(amount: number): string {
  return `${CURRENCY}${amount.toLocaleString('en-US')}`
}
