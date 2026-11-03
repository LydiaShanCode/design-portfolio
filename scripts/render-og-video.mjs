#!/usr/bin/env node
// Renders public/og-preview.mp4 (the looping link-preview video iMessage plays from og:video)
// and public/og-preview-video.png (its poster) from the koi ASCII frames.
// Requires ffmpeg with libx264 and the Courier New font installed. Re-run after changing the koi frames:
//   npm run og:video
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'

const WIDTH = 1200
const HEIGHT = 630
const SCALE = 2
// Matches FRAME_MS in KoiFish.jsx so the preview swims at the same speed as the hero
const FPS = 20

const FRAMES_DIR = path.resolve('src/assets/koi-frames')
const GEIST = path.resolve('node_modules/@fontsource/geist/files/geist-latin-400-normal.woff2')
const OUT_VIDEO = path.resolve('public/og-preview.mp4')
const OUT_POSTER = path.resolve('public/og-preview-video.png')

const frames = fs
  .readdirSync(FRAMES_DIR)
  .filter((f) => /^frame-\d+\.txt$/.test(f))
  .sort()
  .map((f) => fs.readFileSync(path.join(FRAMES_DIR, f), 'utf8'))

const html = `<!doctype html>
<html>
<head>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&display=block" rel="stylesheet">
<style>
  @font-face {
    font-family: 'Geist';
    font-weight: 400;
    src: url('data:font/woff2;base64,${fs.readFileSync(GEIST).toString('base64')}') format('woff2');
  }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #fafbfd; }
  .card {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #001dd9;
  }
  .wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 400; font-size: 56px; line-height: 1; letter-spacing: -0.5px;
  }
  .subtitle {
    margin-top: 12px;
    font-family: 'Geist', sans-serif; font-size: 20px; line-height: 1.2;
  }
  .koi-box { position: relative; width: 640px; height: 420px; margin-top: 4px; }
  .koi {
    position: absolute; top: 50%; left: 50%;
    font-family: 'Courier New', monospace; font-weight: 700;
    white-space: pre; font-size: 12px; line-height: 1;
    opacity: 0.9; transform-origin: center;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="wordmark">LYDIA SHAN</div>
    <div class="subtitle">Product designer</div>
    <div class="koi-box"><div class="koi" id="koi"></div></div>
  </div>
</body>
</html>`

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr.slice(-800)}`)
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-video-'))
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: SCALE })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  await page.evaluate((first) => {
    const koi = document.getElementById('koi')
    const box = koi.parentElement
    koi.textContent = first
    const scale = Math.min(box.clientWidth / koi.scrollWidth, box.clientHeight / koi.scrollHeight, 1)
    koi.style.transform = `translate(-50%, -50%) scale(${scale})`
  }, frames[0])

  for (let i = 0; i < frames.length; i++) {
    await page.evaluate((text) => { document.getElementById('koi').textContent = text }, frames[i])
    await page.screenshot({ path: path.join(tmp, `${String(i).padStart(4, '0')}.png`) })
  }

  run('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', String(FPS), '-i', path.join(tmp, '%04d.png'),
    // Tagged BT.709 so players don't guess the matrix and tint the near-white bg
    '-vf', `scale=${WIDTH}:${HEIGHT}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`,
    '-c:v', 'libx264', '-x264-params', 'colorprim=bt709:transfer=bt709:colormatrix=bt709:range=tv', '-profile:v', 'high', '-preset', 'veryslow', '-crf', '20', '-tune', 'animation',
    '-movflags', '+faststart', '-an',
    OUT_VIDEO,
  ])
  run('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', path.join(tmp, '0000.png'), '-vf', `scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
    OUT_POSTER,
  ])
} finally {
  await browser.close()
  fs.rmSync(tmp, { recursive: true, force: true })
}

const kb = (f) => `${Math.round(fs.statSync(f).size / 1024)} KB`
console.log(`${path.relative('.', OUT_VIDEO)} (${frames.length} frames, ${kb(OUT_VIDEO)})`)
console.log(`${path.relative('.', OUT_POSTER)} (${kb(OUT_POSTER)})`)
