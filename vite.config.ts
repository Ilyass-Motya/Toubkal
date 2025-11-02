import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@': path.resolve(__dirname, './src'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@/features': path.resolve(__dirname, './src/toubkal/app/features'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@/shared': path.resolve(__dirname, './src/toubkal/app/shared'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@/core': path.resolve(__dirname, './src/toubkal/app/core'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@/components': path.resolve(__dirname, './src/toubkal/components'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@/browser': path.resolve(__dirname, './src/toubkal/browser'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
