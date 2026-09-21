/** The stored return path, if it points into the app (never an external URL). */
export function safeRedirect(raw: string | null): string {
  if (!raw) return '/'
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
}
