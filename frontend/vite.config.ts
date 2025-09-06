r import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true
    }
  },
  preview: {
    host: true,
    port: parseInt(process.env.PORT || '3000'),
    allowedHosts: ['healthcheck.railway.app', 'line-up-frontend-production.up.railway.app']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // HTTPS 강제 설정
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
  },
  // 환경 변수 정의
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }
})
