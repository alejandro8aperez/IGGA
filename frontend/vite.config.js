import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// =============================================================================
// vite.config.js — ERP-8AMPERIOS
// =============================================================================
// PROXY RULE (dev only):
//   During 'npm run dev', Vite intercepts /api/* and forwards to localhost:8000.
//   In PRODUCTION (Render), this proxy is IGNORED — axiosConfig.js baseURL
//   handles routing directly to the backend.
// =============================================================================

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    // ── Proxy: SOLO para desarrollo local ────────────────────────────────────
    // En producción (Render) estas reglas NO existen. axiosInstance en
    // axiosConfig.js envía las peticiones directamente a VITE_API_URL.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ── Build config for production (Render) ─────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
