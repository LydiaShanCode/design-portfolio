import takingCardUrl from '../assets/sfx/paper-taking-card.mp3'
import { initSounds, playSound, preloadSounds, whenDecoded } from './audio'

const STORAGE_KEY = 'card-sfx-params'
const MIN_GAP_MS = 110

export const CARD_SFX_DEFAULTS = {
  volume: 0.95,
  rate: 1,
  rateJitter: 0.03,
  lowpassHz: 6800,
  lowpassQ: 0.5,
  attack: 0.001,
  fadeOut: 0.08,
}

export const CARD_SFX_RANGES = {
  volume: { min: 0, max: 1, step: 0.01, label: 'Level', format: (v) => `${Math.round(v * 100)}` },
  rate: { min: 0.5, max: 1.5, step: 0.01, label: 'Pitch', format: (v) => v.toFixed(2) },
  rateJitter: { min: 0, max: 0.2, step: 0.005, label: 'Drift', format: (v) => `${Math.round(v * 100)}` },
  lowpassHz: { min: 400, max: 12000, step: 10, scale: 'log', label: 'Tone', format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`) },
  lowpassQ: { min: 0.2, max: 8, step: 0.05, label: 'Body', format: (v) => v.toFixed(1) },
  attack: { min: 0.001, max: 0.12, step: 0.001, label: 'Attack', format: (v) => `${Math.round(v * 1000)}` },
  fadeOut: { min: 0.01, max: 0.45, step: 0.005, label: 'Tail', format: (v) => `${Math.round(v * 1000)}` },
}

const paramListeners = new Set()
const playListeners = new Set()

let params = loadParams()
let buffer = null
let lastPlay = 0

function loadParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...CARD_SFX_DEFAULTS }
    const parsed = JSON.parse(raw)
    const next = { ...CARD_SFX_DEFAULTS }
    for (const key of Object.keys(CARD_SFX_DEFAULTS)) {
      const value = parsed[key]
      if (typeof value === 'number' && Number.isFinite(value)) next[key] = value
    }
    // Earlier shipped levels were 0.35 and 0.85. Lift those exact takes without touching a level set by hand.
    if (Math.abs(next.volume - 0.35) < 0.001 || Math.abs(next.volume - 0.85) < 0.001) {
      next.volume = CARD_SFX_DEFAULTS.volume
    }
    return next
  } catch {
    return { ...CARD_SFX_DEFAULTS }
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  } catch {
    // Private mode can reject storage. The live params still apply.
  }
}

function emitParams() {
  paramListeners.forEach((listener) => listener())
}

export const initCardSfx = () => {
  const cleanup = initSounds([takingCardUrl])
  whenDecoded(takingCardUrl).then((decoded) => {
    buffer = decoded
    emitParams()
  })
  return cleanup
}

export const preloadCardSfx = () => preloadSounds([takingCardUrl])

export function getCardBuffer() {
  return buffer
}

export function getCardParams() {
  return params
}

export function subscribeCardParams(listener) {
  paramListeners.add(listener)
  return () => paramListeners.delete(listener)
}

export function subscribeCardPlays(listener) {
  playListeners.add(listener)
  return () => playListeners.delete(listener)
}

export function setCardParam(key, value) {
  if (!(key in CARD_SFX_DEFAULTS) || typeof value !== 'number') return
  params = { ...params, [key]: value }
  persist()
  emitParams()
}

export function resetCardParams() {
  params = { ...CARD_SFX_DEFAULTS }
  persist()
  emitParams()
}

export function playCardSfx() {
  const now = performance.now()
  if (now - lastPlay < MIN_GAP_MS) return
  lastPlay = now
  const duration = buffer ? buffer.duration / Math.max(0.25, params.rate) : 0.4
  playListeners.forEach((listener) => listener({ at: now, duration }))
  playSound(takingCardUrl, params)
}
