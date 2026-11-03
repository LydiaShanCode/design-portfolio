const START_LEAD = 0.005
// A sound that finished decoding long after its trigger would sound out of sync
const MAX_LATE_MS = 150
// Browsers only let an AudioContext run after one of these; hover alone never unlocks it
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchend']

let ctx = null
const dataCache = new Map()
const bufferCache = new Map()

function getContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  return ctx
}

function fetchData(url) {
  if (!dataCache.has(url)) {
    dataCache.set(url, fetch(url)
      .then((response) => response.arrayBuffer())
      .catch(() => {
        dataCache.delete(url)
        return null
      }))
  }
  return dataCache.get(url)
}

function loadBuffer(audio, url) {
  if (!bufferCache.has(url)) {
    bufferCache.set(url, fetchData(url)
      .then((data) => (data ? audio.decodeAudioData(data.slice(0)) : null))
      .catch(() => null)
      .then((buffer) => {
        if (!buffer) bufferCache.delete(url)
        return buffer
      }))
  }
  return bufferCache.get(url)
}

/** Downloads sounds now and decodes them once audio is unlocked. */
export function preloadSounds(urls) {
  urls.forEach((url) => {
    fetchData(url)
    if (ctx) loadBuffer(ctx, url)
  })
}

/** Fetches sounds while idle and wakes audio on the first real gesture. Returns cleanup. */
export function initSounds(urls) {
  const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 200))
  const cancelIdle = window.cancelIdleCallback || window.clearTimeout
  const idleId = idle(() => urls.forEach(fetchData))

  const onGesture = () => {
    const audio = getContext()
    if (audio) {
      if (audio.state === 'suspended') audio.resume().catch(() => {})
      urls.forEach((url) => loadBuffer(audio, url))
    }
    UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, onGesture, true))
  }
  UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, onGesture, true))

  return () => {
    cancelIdle(idleId)
    UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, onGesture, true))
  }
}

/**
 * Plays a short one-shot. Options: volume, lowpassHz, rateJitter (±fraction), fadeOut (seconds).
 */
export async function playSound(url, { volume = 0.35, lowpassHz = null, rateJitter = 0, fadeOut = 0.08 } = {}) {
  const triggeredAt = performance.now()
  const audio = getContext()
  if (!audio) return
  if (audio.state === 'suspended') {
    await audio.resume().catch(() => {})
    if (audio.state !== 'running') return
  }
  const buffer = await loadBuffer(audio, url)
  if (!buffer || performance.now() - triggeredAt > MAX_LATE_MS) return

  const t = audio.currentTime + START_LEAD
  const rate = 1 - rateJitter + Math.random() * rateJitter * 2
  const duration = buffer.duration / rate
  const fadeOutAt = Math.max(0.001, duration - fadeOut)

  const gain = audio.createGain()
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.001)
  gain.gain.setValueAtTime(volume, t + fadeOutAt)
  gain.gain.setTargetAtTime(0, t + fadeOutAt, fadeOut / 4)
  gain.connect(audio.destination)

  let output = gain
  if (lowpassHz) {
    const soften = audio.createBiquadFilter()
    soften.type = 'lowpass'
    soften.frequency.value = lowpassHz
    soften.Q.value = 0.5
    soften.connect(gain)
    output = soften
  }

  const source = audio.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = rate
  source.connect(output)
  source.start(t)
  source.stop(t + duration)
}
