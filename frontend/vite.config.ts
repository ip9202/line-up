import { defineConfig } from 'vite'
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
    },
    // 개발서버에서는 Mixed Content 정책 비활성화
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'self' http://localhost:* ws://localhost:*;"
    }
  },
  preview: {
    host: true,
    port: parseInt(process.env.PORT || '3000'),
    allowedHosts: ['healthcheck.railway.app', 'line-up-frontend-production.up.railway.app'],
    // Mixed Content 방지를 위한 강화된 보안 헤더
    headers: {
      'Content-Security-Policy': "upgrade-insecure-requests; block-all-mixed-content",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
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
