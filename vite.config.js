import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/movieflix/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'MovieFlix',
        short_name: 'MovieFlix',
        description: 'Discover and stream your favorite movies and TV shows with a beautiful, modern interface',
        theme_color: '#7C3AED',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/movieflix/',
        scope: '/movieflix/',
        icons: [
          {
            src: '/favicon.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: '/favicon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/movieflix-og-image.png',
            sizes: '1200x630',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        categories: ['entertainment', 'video'],
        shortcuts: [
          {
            name: 'Home',
            short_name: 'Home',
            description: 'Go to the home page',
            url: '/movieflix/',
            icons: [
              {
                src: '/favicon.jpg',
                sizes: '192x192',
                type: 'image/jpeg'
              }
            ]
          },
          {
            name: 'Movies',
            short_name: 'Movies',
            description: 'Browse movies',
            url: '/movieflix/movies',
            icons: [
              {
                src: '/favicon.jpg',
                sizes: '192x192',
                type: 'image/jpeg'
              }
            ]
          },
          {
            name: 'TV Shows',
            short_name: 'TV',
            description: 'Browse TV shows',
            url: '/movieflix/tv-shows',
            icons: [
              {
                src: '/favicon.jpg',
                sizes: '192x192',
                type: 'image/jpeg'
              }
            ]
          },
          {
            name: 'My List',
            short_name: 'List',
            description: 'View your watchlist',
            url: '/movieflix/my-list',
            icons: [
              {
                src: '/favicon.jpg',
                sizes: '192x192',
                type: 'image/jpeg'
              }
            ]
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2,ttf,eot}']
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
