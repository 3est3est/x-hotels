/**
 * Mock hotel photography until the owner supplies generated photos (Spec 0002,
 * Q8a). Keyed by hotel id so swaps are URL-only later; the database is untouched.
 * Every <img> in the app resolves through `HotelImage`, which falls back here
 * when the API image is missing or fails to load.
 */
export function mockHotelImage(hotelId: number, width = 1200, height = 800): string {
  return `https://picsum.photos/seed/xhotel-${hotelId}/${width}/${height}`
}

export function mockRoomImage(hotelId: number, roomTypeId: number, width = 800, height = 500): string {
  return `https://picsum.photos/seed/xhotel-${hotelId}-room-${roomTypeId}/${width}/${height}`
}
