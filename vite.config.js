import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: "/crmdemo/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Mediamatic Studio CRM',
        short_name: 'MMS CRM',
        description: 'Enterprise CRM Solution for Mediamatic Studio',
        theme_color: '#5b0f1b',
        background_color: '#fff9f0',
        display: 'standalone',
        icons: [
          {
            src: 'mms-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'mms-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'mms-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: "es2017",
  },
})
