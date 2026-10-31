#!/usr/bin/env node
// Generates web-ready video variants next to each source in src/assets and writes
// src/assets/media-manifest.json (dimensions for layout reservation).
// Requires ffmpeg/ffprobe with libx264 + libsvtav1 + libwebp. Re-run after adding videos:
//   npm run media
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ASSETS = path.resolve('src/assets')

// card:  small looping preview inside a ~340px card (2x DPR), trimmed so the loop stays short
// hero:  full-width player on project pages and in the preview modal (content max 1200px, 2x DPR)
const VARIANTS = {
  card: { maxW: 720, maxH: 1280, fps: 30, maxSeconds: 30, h264Crf: 28, av1Crf: 42 },
  // maxrate keeps long recordings streamable; sources are already ~1.6 Mbps, so CRF alone barely shrinks them
  hero: { maxW: 1920, maxH: 1600, fps: 60, maxSeconds: null, h264Crf: 26, av1Crf: 36, maxrate: '3M' },
}

const SOURCES = [
  { file: 'projects/payouts-uplift/payouts uplift final video.MP4', variants: ['card', 'hero'] },
  { file: 'projects/payouts-uplift/payouts uplift audit video compressed.mp4', variants: ['hero'] },
  { file: 'projects/design-system/Design System Final Video.MP4', variants: ['card', 'hero'] },
  { file: 'projects/smart-markets/International Commerce Final video.MP4', variants: ['card', 'hero'] },
  { file: 'projects/shop-balance/Shop Balance final video.MP4', variants: ['card', 'hero'] },
  { file: 'projects/Listening Room/Listening Room final video.MP4', variants: ['card', 'hero'] },
  { file: 'Playground-page/shader-experiment-one/Shader-experiment-one.mov', variants: ['card', 'hero'] },
  { file: 'projects/shop-balance/Video 1.mov', variants: ['hero'] },
  { file: 'projects/shop-balance/video 2.MOV', variants: ['hero'] },
  { file: 'projects/shop-balance/video 3.MOV', variants: ['hero'] },
  { file: 'projects/shop-balance/video 4.MOV', variants: ['hero'] },
  { file: 'projects/shop-balance/video 5.MOV', variants: ['hero'] },
]

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr.slice(-800)}`)
  return r.stdout
}

const probe = (file) => {
  const out = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file]))
  return { width: out.streams[0].width, height: out.streams[0].height, duration: Number(out.format.duration) }
}

const isFresh = (out, src) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs

const scaleFilter = ({ maxW, maxH, fps }) => [
  `scale=w='min(${maxW},iw)':h='min(${maxH},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos`,
  fps ? `fps=${fps}` : null,
].filter(Boolean).join(',')

const encode = (src, out, v, codec) => {
  if (isFresh(out, src)) return
  const common = ['-y', '-v', 'error', '-i', src, ...(v.maxSeconds ? ['-t', String(v.maxSeconds)] : []),
    '-an', '-vf', scaleFilter(v), '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
  const codecArgs = codec === 'av1'
    ? ['-c:v', 'libsvtav1', '-preset', '10', '-crf', String(v.av1Crf), '-g', '240']
    : ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(v.h264Crf), '-profile:v', 'high',
        ...(v.maxrate ? ['-maxrate', v.maxrate, '-bufsize', `${parseInt(v.maxrate) * 2}M`] : [])]
  console.log(`  ${codec.padEnd(4)} ${path.relative(ASSETS, out)}`)
  run('ffmpeg', [...common, ...codecArgs, out])
}

const manifest = {}
for (const { file, variants } of SOURCES) {
  const src = path.join(ASSETS, file)
  const base = src.replace(/\.[^.]+$/, '')
  console.log(file)
  const entry = { source: probe(src) }
  for (const name of variants) {
    const v = VARIANTS[name]
    encode(src, `${base}.${name}.mp4`, v, 'h264')
    encode(src, `${base}.${name}.av1.mp4`, v, 'av1')
    const { width, height } = probe(`${base}.${name}.mp4`)
    // Already-compressed screen recordings can come out larger in AV1; browsers pick the first playable source
    const av1Smaller = fs.statSync(`${base}.${name}.av1.mp4`).size < fs.statSync(`${base}.${name}.mp4`).size
    entry[name] = { width, height, ...(av1Smaller ? {} : { av1: false }) }
  }
  const poster = `${base}.poster.webp`
  const posterFrom = `${base}.${variants.includes('hero') ? 'hero' : 'card'}.mp4`
  if (!isFresh(poster, src)) {
    console.log(`  webp ${path.relative(ASSETS, poster)}`)
    const frame = spawnSync('ffmpeg', ['-v', 'error', '-i', posterFrom, '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', '-'], { maxBuffer: 64 * 1024 * 1024 })
    if (frame.status !== 0) throw new Error(`poster frame failed for ${file}`)
    await sharp(frame.stdout).webp({ quality: 78 }).toFile(poster)
  }
  manifest[file] = entry
}

fs.writeFileSync(path.join(ASSETS, 'media-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('wrote src/assets/media-manifest.json')
