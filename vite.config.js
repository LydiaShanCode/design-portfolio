import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/design-portfolio/' : '/',
  plugins: [react()],
  assetsInclude: ['**/*.MP4', '**/*.MOV', '**/*.mov', '**/*.PNG', '**/*.HEIC', '**/*.heic'],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-pdf': ['react-pdf', 'pdfjs-dist'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
}))
