import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Make sure these files exist in your /public folder
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Hive Studio',
        short_name: 'HiveStudio',
        description: 'Professional Hive Editor with AI',
        theme_color: '#0F1117',
        background_color: '#0F1117',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/android-chrome-192x192.png', // Note: starts with /
            sizes: '192x192',
            type: 'image/png', // Changed to png
            purpose: 'any maskable'
          },
          {
            src: '/android-chrome-512x512.png', // Note: starts with /
            sizes: '512x512',
            type: 'image/png', // Changed to png
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})