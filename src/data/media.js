import manifest from '../assets/media-manifest.json'

// Encoded by scripts/encode-media.mjs (`npm run media`). Originals are never bundled.
const h264 = import.meta.glob('../assets/**/*.{card,hero}.mp4', { eager: true, import: 'default' })
const av1 = import.meta.glob('../assets/**/*.{card,hero}.av1.mp4', { eager: true, import: 'default' })
const posters = import.meta.glob('../assets/**/*.poster.webp', { eager: true, import: 'default' })

// seq_level_idx by picture size; Safari only reports AV1 support where it can hardware-decode the level
const av1Level = (width, height) => {
  const pixels = width * height
  if (pixels <= 1065024) return '05'
  if (pixels <= 2359296) return '09'
  return '12'
}

const stripExtension = (file) => file.replace(/\.[^.]+$/, '')

/**
 * @param {string} file  source path relative to src/assets, e.g. 'projects/x/Final.MP4'
 * @param {'card'|'hero'} variant
 */
export function getVideo(file, variant = 'hero') {
  const entry = manifest[file]
  const dims = entry?.[variant]
  if (!dims) return null

  const base = `../assets/${stripExtension(file)}`
  const sources = []
  const av1Src = av1[`${base}.${variant}.av1.mp4`]
  if (av1Src) {
    sources.push({ src: av1Src, type: `video/mp4; codecs="av01.0.${av1Level(dims.width, dims.height)}M.08"` })
  }
  const h264Src = h264[`${base}.${variant}.mp4`]
  if (h264Src) sources.push({ src: h264Src, type: 'video/mp4' })
  if (!sources.length) return null

  return {
    sources,
    poster: posters[`${base}.poster.webp`] || null,
    width: dims.width,
    height: dims.height,
  }
}

const MARKDOWN_VIDEO = /\.(mp4|mov|webm)$/i

/** Resolves a markdown/frontmatter video path inside a project folder to its hero encode. */
export function getProjectVideo(slug, relativePath) {
  if (!relativePath || !MARKDOWN_VIDEO.test(relativePath)) return null
  const target = `projects/${slug}/${relativePath.replace(/^\.\//, '')}`.toLowerCase()
  const match = Object.keys(manifest).find((file) => file.toLowerCase() === target)
  return match ? getVideo(match, 'hero') : null
}
