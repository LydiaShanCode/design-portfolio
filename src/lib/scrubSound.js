import soundUrl from '../assets/sounds/juniorsoundays-ui-sound-73.mp3'

// The file opens with ~15ms of encoder silence; skipping it keeps the blip in sync with the hover
const START_OFFSET_S = 0.015
const VOLUME = 0.8
const FADE_OUT_S = 0.06
const MIN_GAP_MS = 60

let ctx = null
let buffer = null
let current = null
let lastPlayedAt = 0

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Browsers only allow audio after a click, tap or key press, so the context waits for the first one
function unlock() {
  window.removeEventListener('pointerdown', unlock, true)
  window.removeEventListener('keydown', unlock, true)
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return
  ctx = new AudioCtx()
  ctx.resume()
  fetch(soundUrl)
    .then((res) => res.arrayBuffer())
    .then((data) => ctx.decodeAudioData(data))
    .then((decoded) => { buffer = decoded })
    .catch(() => {})
}

if (canHover()) {
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('keydown', unlock, true)
}

export function stopScrubSound() {
  if (!current || !ctx) return
  const { source, gain } = current
  current = null
  gain.gain.setTargetAtTime(0, ctx.currentTime, FADE_OUT_S / 3)
  source.stop(ctx.currentTime + FADE_OUT_S)
}

export function playScrubSound() {
  if (!ctx || !buffer || ctx.state !== 'running') return
  const now = performance.now()
  if (now - lastPlayedAt < MIN_GAP_MS) return
  lastPlayedAt = now

  stopScrubSound()
  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  source.buffer = buffer
  gain.gain.value = VOLUME
  source.connect(gain).connect(ctx.destination)
  source.start(0, START_OFFSET_S)
  current = { source, gain }
  source.onended = () => { if (current?.source === source) current = null }
}
