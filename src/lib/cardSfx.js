import takingCardUrl from '../assets/sfx/paper-taking-card.mp3'
import { initSounds, playSound, preloadSounds } from './audio'

const MIN_GAP_MS = 110
const OPTIONS = { volume: 0.35, lowpassHz: 6800, rateJitter: 0.03, fadeOut: 0.08 }

let lastPlay = 0

export const initCardSfx = () => initSounds([takingCardUrl])

export const preloadCardSfx = () => preloadSounds([takingCardUrl])

export function playCardSfx() {
  const now = performance.now()
  if (now - lastPlay < MIN_GAP_MS) return
  lastPlay = now
  playSound(takingCardUrl, OPTIONS)
}
