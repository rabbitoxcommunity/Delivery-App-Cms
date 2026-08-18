import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The R2 bucket's CORS policy allowlists this exact origin, and image upload
  // is a direct browser PUT to R2 (§16 — bytes never pass through Express).
  // Vite's default is to hop to the next free port when this one is taken,
  // which lands the app on an origin the bucket rejects: every upload then
  // fails preflight while the rest of the app works normally. strictPort makes
  // the collision fail loudly at startup instead.
  server: { port: 5173, strictPort: true },
})
