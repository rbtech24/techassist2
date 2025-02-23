import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['*'],
      manifest: {
        name: 'SPARKY - Appliance Repair Assistant',
        short_name: 'SPARKY',
        id: '/',
        description: 'AI-powered appliance repair support for field technicians',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-narrow.jpg',
            sizes: '1170x2532',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'SPARKY Chat Interface'
          },
          {
            src: 'screenshot-wide.jpg',
            sizes: '2048x1536',
            type: 'image/jpeg',
            form_factor: 'wide',
            label: 'SPARKY Desktop Interface'
          }
        ],
        shortcuts: [
          {
            name: 'New Chat',
            url: '/',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Settings',
            url: '/admin',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offline-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
});
