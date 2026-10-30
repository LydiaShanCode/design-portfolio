import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RESPONSIVE_WIDTHS = '480;960;1600'

// `?responsive` → <picture> data (AVIF + WebP + JPEG/PNG fallback at RESPONSIVE_WIDTHS)
// `?lqip`       → tiny inline WebP used as a blur-up placeholder
async function imageDirectives(url, loadMetadata) {
  if (url.searchParams.has('responsive')) {
    const { hasAlpha } = await loadMetadata()
    return new URLSearchParams({
      w: url.searchParams.get('w') || RESPONSIVE_WIDTHS,
      format: `avif;webp;${hasAlpha ? 'png' : 'jpg'}`,
      as: 'picture',
    })
  }
  if (url.searchParams.has('lqip')) {
    return new URLSearchParams({ w: '24', format: 'webp', quality: '40', inline: '', as: 'url' })
  }
  return new URLSearchParams()
}

// Fontsource faces are only discovered once the CSS applies; nav labels then reflow when
// they swap in. Preloading the above-the-fold faces lets them arrive before first paint.
const PRELOAD_FONTS = [/geist-latin-400-normal-.*\.woff2$/, /geist-mono-latin-400-normal-.*\.woff2$/]

function preloadFonts() {
  let base = '/'
  return {
    name: 'preload-fonts',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml(html, { bundle }) {
      return Object.keys(bundle || {})
        .filter((file) => PRELOAD_FONTS.some((pattern) => pattern.test(file)))
        .map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `${base}${file}`, crossorigin: '' },
          injectTo: 'head-prepend',
        }))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Vercel serves from the domain root; GitHub Pages serves from /design-portfolio/
  base: command === 'build' && !process.env.VERCEL ? '/design-portfolio/' : '/',
  plugins: [
    imagetools({
      include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/i,
      defaultDirectives: imageDirectives,
    }),
    react(),
    preloadFonts(),
  ],
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
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
}))
