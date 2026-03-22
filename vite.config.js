import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [react()],
  assetsInclude: ['**/*.MP4', '**/*.PNG'],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
}))
