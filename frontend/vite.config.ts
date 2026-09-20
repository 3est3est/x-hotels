import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The backend runs on 8787 in its production-parity dev mode
// (`backend/scripts/dev-wrangler.sh` → `bunx wrangler dev --port 8787`); the
// plain Bun path (`backend bun run dev`) listens on 3000 instead. Override with
// BACKEND_ORIGIN when pointing at that. Proxying keeps the session cookie
// same-origin, mirroring the Cloudflare Pages `_redirects` proxy in production.
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': process.env.BACKEND_ORIGIN ?? 'http://localhost:8787',
    },
  },
})
