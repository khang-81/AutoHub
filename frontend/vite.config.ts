import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApiProxy =
    (env.VITE_DEV_PROXY_TARGET || '').trim() || 'http://127.0.0.1:8088'

  return {
    plugins: [react()],
    server: {
      /* Dev: http://localhost:3000 — nếu cổng bận, chạy: npm run dev -- --port 5173 */
      port: 3000,
      strictPort: false,
      proxy: {
        '/api': {
          target: devApiProxy,
          changeOrigin: true,
          secure: false,
        },
        '/files': {
          target: devApiProxy,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
