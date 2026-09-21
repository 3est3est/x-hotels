/** The stored return path, if it points into the app (never an external URL). */
export function safeRedirect(raw: string | null, fallback = '/'): string {
  if (!raw) return fallback
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : fallback
}
