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

/**
 * Remote stand-ins for slots with no owner photo yet: real hotel photography
 * (verified live URLs), picked deterministically so a slot always shows the
 * same image. The owner replaces them by dropping files into `public/hotels/`.
 */
const REMOTE_HOTEL_PHOTOS = [
  '1566073771259-6a8506099945',
  '1445019980597-93fa8acb246c',
  '1542314831-068cd1dbfeeb',
  '1551882547-ff40c63fe5fa',
]

const REMOTE_ROOM_PHOTOS = [
  '1582719508461-905c673771fd',
  '1611892440504-42a792e24d32',
  '1590490360182-c33d57733427',
  '1578683010236-d716f9a3f461',
]

function remotePhoto(pool: string[], seed: number, width: number, height: number): string {
  const id = pool[Math.abs(seed) % pool.length]
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=70`
}

export function mockHotelImage(hotelId: number, width = 1200, height = 800): string {
  return remotePhoto(REMOTE_HOTEL_PHOTOS, hotelId, width, height)
}

export function mockRoomImage(hotelId: number, roomTypeId: number, width = 800, height = 500): string {
  return remotePhoto(REMOTE_ROOM_PHOTOS, hotelId * 31 + roomTypeId, width, height)
}
