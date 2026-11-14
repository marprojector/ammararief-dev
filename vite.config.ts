import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; // Impor modul 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  assetsInclude: ['**/*.glb'],
  // /api/*.php runs on the Hostinger host; in dev, forward to it (override with API_PROXY=http://localhost:8000).
  server: {
    proxy: {
      '/api': { target: process.env.API_PROXY ?? 'https://adilasoma.cloud', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      // Gunakan path.resolve untuk mendapatkan path absolut ke folder 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
