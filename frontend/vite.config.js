import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The frontend talks to the Laravel backend through the REST API only.
// In development, requests to /api are proxied to the Laravel dev server
// (php artisan serve) so the browser never needs to deal with CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    css: false,
    // The live backend tests in src/tests/liveApi.test.jsx do real requests.
    testTimeout: 20000,
  },
})
