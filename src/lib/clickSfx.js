import stereoUrl from '../assets/sfx/water-drop-stereo.mp3'
import brightUrl from '../assets/sfx/water-drop-bright.mp3'
import plipUrl from '../assets/sfx/water-drop-plip.mp3'
import { initSounds, playSound } from './audio'

export const CLICK_SFX_VERSIONS = [
  { key: 'v1', label: 'Stereo drop' },
  { key: 'v2', label: 'Bright drop' },
  { key: 'v3', label: 'Plip' },
]

const SOUNDS = {
  v1: { url: stereoUrl, volume: 0.4 },
  v2: { url: brightUrl, volume: 0.28 },
  v3: { url: plipUrl, volume: 0.3 },
}

const RATE_JITTER = 0.04
const MIN_GAP_MS = 60

let lastPlay = 0

export const initClickSfx = () => initSounds(Object.values(SOUNDS).map((sound) => sound.url))

export function playClickSfx(version) {
  const now = performance.now()
  if (now - lastPlay < MIN_GAP_MS) return
  lastPlay = now
  const { url, volume } = SOUNDS[version] || SOUNDS.v1
  playSound(url, { volume, rateJitter: RATE_JITTER, fadeOut: 0.05 })
}
