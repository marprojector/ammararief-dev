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
  // /api/*.php is the Spotify proxy. GitHub Pages cannot run PHP, so the Spotify app stays off
  // (VITE_SHOW_SPOTIFY=false by default). Serve public/api with any PHP host and point API_PROXY at it.
  server: {
    proxy: {
      '/api': { target: process.env.API_PROXY ?? 'http://localhost:8000', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      // Gunakan path.resolve untuk mendapatkan path absolut ke folder 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
