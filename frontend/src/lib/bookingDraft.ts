export type BookingDraft = {
  roomTypeId?: number
  guests?: number
  checkIn?: string
  nights?: number
}

/**
 * Reads a booking draft (and whether it targets a given Room Type) out of the
 * URL. The draft is how an unverified Guest's booking intent survives the
 * round-trip through `/verify` — the redirect back carries it, so verifying
 * needs no re-entry (Spec 0001, story 19).
 */
export function readDraft(params: URLSearchParams): BookingDraft {
  const roomTypeId = Number(params.get('book'))
  const guests = Number(params.get('guests'))
  const nights = Number(params.get('nights'))
  return {
    roomTypeId: Number.isInteger(roomTypeId) && roomTypeId > 0 ? roomTypeId : undefined,
    guests: Number.isInteger(guests) && guests >= 1 ? guests : undefined,
    nights: Number.isInteger(nights) && nights >= 1 ? nights : undefined,
    checkIn: params.get('checkIn') ?? undefined,
  }
}

export function draftParams(
  roomTypeId: number,
  guests: number,
  checkIn: string,
  nights: number,
): string {
  const params = new URLSearchParams({
    book: String(roomTypeId),
    guests: String(guests),
    checkIn,
    nights: String(nights),
  })
  return params.toString()
}
