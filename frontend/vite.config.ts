import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The backend runs on 8787 in its production-parity dev mode
// (`backend/scripts/dev-wrangler.sh` → `bunx wrangler dev --port 8787`); the
// plain Bun path (`backend bun run dev`) listens on 3000 instead. Override with
// BACKEND_ORIGIN when pointing at that.
//
// Path shape mirrors the deployed backend exactly: Better Auth lives under
// `/api/auth/*` (its `basePath`), while every business route is served at the
// root (`/countries`, `/hotels`, `/bookings`, `/identity-verification`). The
// app still speaks one origin — `/api/*` — so the `/api` prefix is stripped for
// business routes and kept for auth. Production's Cloudflare Pages `_redirects`
// does the same with `:splat`.
const target = process.env.BACKEND_ORIGIN ?? 'http://localhost:8787'
const proxyOptions = { target, changeOrigin: true }

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      // Auth keeps its prefix (order matters: first match wins).
      '/api/auth': proxyOptions,
      // Business routes lose the app-facing `/api` prefix.
      '/api': {
        ...proxyOptions,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
