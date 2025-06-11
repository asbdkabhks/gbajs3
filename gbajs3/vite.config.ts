/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { coverageConfigDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const withCOIServiceWorker = mode === 'with-coi-serviceworker';

  return {
    base: './',
    plugins: [
      react(),
      withCOIServiceWorker
        ? [
            createHtmlPlugin({
              inject: {
                tags: [
                  {
                    tag: 'script',
                    attrs: { src: 'coi-sw.js' },
                    injectTo: 'head-prepend'
                  }
                ]
              }
            })
          ]
        : [],
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['./img/favicon.ico'],
        manifest: {
          name: 'Gbajs3',
          short_name: 'GJ3',
          description: 'GBA emulator online in the Browser',
          theme_color: '#979597',
          background_color: '#212529',
          icons: [
            {
              src: './img/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: './img/icon-256x256.png',
              sizes: '256x256',
              type: 'image/png'
            },
            {
              src: './img/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: './img/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: './img/maskable-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: './img/maskable-icon-256x256.png',
              sizes: '256x256',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: './img/maskable-icon-384x384.png',
              sizes: '384x384',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: './img/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: 'img/desktop.png',
              sizes: '2054x1324',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Desktop Gbajs3'
            },
            {
              src: 'img/mobile.png',
              sizes: '1170x2532',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Mobile Gbajs3'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,wasm,data,map}'],
          navigateFallbackDenylist: [/^\/admin/]
        },
        ...(withCOIServiceWorker
          ? {
              injectRegister: null,
              strategies: 'injectManifest',
              srcDir: 'src/service-worker',
              filename: 'coi-sw.ts',
              injectManifest: {
                injectionPoint: undefined
              }
            }
          : {})
      }),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/@thenick775/mgba-wasm/dist/*.{wasm.map,data}',
            dest: ''
          }
        ]
      }),
      visualizer({ gzipSize: true })
    ],
    optimizeDeps: {
      exclude: ['@thenick775/mgba-wasm']
    },
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            const vendorPrefix = 'vendor';
            if (id.indexOf('node_modules') > -1) {
              if (id.indexOf('@mui') > -1 || id.indexOf('reselect') > -1) {
                // vendor mui
                return vendorPrefix + '_@mui';
              }

              if (id.indexOf('@thenick775/mgba-wasm') > -1) {
                // vendor mGBA
                return vendorPrefix + '_mgba-wasm';
              }

              if (
                id.indexOf('react-joyride') > -1 ||
                id.indexOf('react-floater') > -1 ||
                id.indexOf('popper.js') > -1
              ) {
                // vendor react joyride + large deps
                return vendorPrefix + '_react-joyride';
              }

              return vendorPrefix;
            }
          }
        }
      }
    },
    test: {
      globals: true,
      restoreMocks: true,
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts', 'jest-styled-components'],
      coverage: {
        provider: 'v8',
        include: ['src'],
        exclude: [
          ...coverageConfigDefaults.exclude,
          'test/**',
          'src/emulator/mgba/wasm/**',
          '**/*.d.ts',
          '**/*eslint*',
          '**/service-worker/**'
        ]
      }
    }
  };
});
