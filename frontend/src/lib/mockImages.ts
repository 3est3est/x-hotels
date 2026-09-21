/**
 * Hotel photography resolution chain (Spec 0004):
 *
 * 1. Owner-supplied photos under `frontend/public/hotels/`
 *    (`{country}/{region}/{room}.jpg`, plus `exterior.jpg` per branch).
 * 2. Picsum mock when the local file is missing (HotelImage falls back
 *    automatically on 404, so newly added photos light up with no code change).
 *
 * The database is untouched: API images still win when present.
 */

const REGION_SLUG: Record<string, string> = {
  Northern: 'north',
  Northeastern: 'northeast',
  Central: 'central',
  Eastern: 'east',
  Western: 'west',
  Southern: 'south',
  Jerusalem: 'jerusalem',
  Haifa: 'haifa',
  'Tel Aviv': 'tel-aviv',
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function regionSlug(regionName: string): string {
  return REGION_SLUG[regionName] ?? slug(regionName)
}

function branchDir(countryName: string, regionName: string): string {
  return `/hotels/${slug(countryName)}/${regionSlug(regionName)}`
}

export function localRoomImage(
  countryName: string,
  regionName: string,
  roomTypeName: string,
): string[] {
  const base = `${branchDir(countryName, regionName)}/${slug(roomTypeName)}`
  // Both extensions the owner uses. Missing files 404 into the next candidate.
  return [`${base}.jpg`, `${base}.jpeg`]
}

/** Every room type the group sells (seed data). Used to probe branch photos. */
export const ALL_ROOM_TYPES = ['Deluxe', 'Suite', 'Family']

/**
 * Hotel cover chain: the branch exterior when the owner supplies it, then the
 * branch's own room photos (a real photo of the hotel beats the API demo
 * images and any mock), then the caller appends API + mock fallbacks.
 * Missing files 404 into the next candidate.
 */
export function localHotelImage(
  countryName: string,
  regionName: string,
  roomTypeNames: string[] = ALL_ROOM_TYPES,
): string[] {
  const dir = branchDir(countryName, regionName)
  const rooms = roomTypeNames.flatMap((name) => [`${dir}/${slug(name)}.jpg`, `${dir}/${slug(name)}.jpeg`])
  return [`${dir}/exterior.jpg`, `${dir}/exterior.jpeg`, ...rooms]
}

export function mockHotelImage(hotelId: number, width = 1200, height = 800): string {
  return `https://picsum.photos/seed/xhotel-${hotelId}/${width}/${height}`
}

export function mockRoomImage(hotelId: number, roomTypeId: number, width = 800, height = 500): string {
  return `https://picsum.photos/seed/xhotel-${hotelId}-room-${roomTypeId}/${width}/${height}`
}
