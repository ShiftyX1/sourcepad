import { defineConfig } from 'vite'
import { resolve } from 'path'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    electron([
      {
        entry: 'src/main/main.ts',
        onstart(options) {
          if (options.startup) {
            options.startup()
          } else {
            options.reload()
          }
        },
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: 'src/main/preload.ts',
        onstart(options) {
          // Notify the Renderer process to reload the page when the Preload scripts build is complete
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist/preload',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        start: resolve(__dirname, 'src/renderer/start-page/index.html'),
        editor: resolve(__dirname, 'src/renderer/editor/index.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.includes('worker')) {
            return 'workers/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 2000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@main': resolve(__dirname, 'src/main')
    }
  },
  server: {
    port: 5173,
    host: 'localhost'
  },
  optimizeDeps: {
    include: ['monaco-editor'],
    exclude: ['monaco-editor/esm/vs/editor/editor.worker']
  },
  worker: {
    format: 'es'
  }
})