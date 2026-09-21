/**
 * Render a calendar date. The treaty parses any date-shaped string in a JSON
 * response into a `Date` (Eden `parseDate`), so date-ish fields arrive as
 * `string | Date` at runtime regardless of the declared schema — formatting
 * from the value itself keeps rendering total.
 */
export function formatDate(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value
}

/** Render a timestamp for secondary display (checked-in at, review dates). */
export function formatDateTime(value: string | Date): string {
  if (value instanceof Date) return value.toLocaleString()
  return new Date(value).toLocaleString()
}
