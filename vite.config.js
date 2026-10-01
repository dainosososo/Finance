import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-vLiveDate.js`,
        chunkFileNames: `assets/[name]-[hash]-vLiveDate.js`,
        assetFileNames: `assets/[name]-[hash]-vLiveDate.[ext]`
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/twse-open': {
        target: 'https://openapi.twse.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twse-open/, '')
      },
      '/api/twse-mis': {
        target: 'https://mis.twse.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twse-mis/, '')
      }
    }
  }
})
