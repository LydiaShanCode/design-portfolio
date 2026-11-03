// Total length of the CSS intro in custom.css (nav: 400ms delay + 450ms drop), plus a small buffer
const INTRO_MS = 1000
// When the hero content finishes its blur-fade (200ms delay + 400ms reveal)
const HERO_MS = 600
const HERO_READY_EVENT = 'portfolio:hero-ready'

let heroReady = false

function markHeroReady() {
  if (heroReady) return
  heroReady = true
  window.dispatchEvent(new Event(HERO_READY_EVENT))
}

/** Runs callback once the hero has landed (immediately if it already has). Returns unsubscribe. */
export function onHeroReady(callback) {
  if (heroReady) {
    callback()
    return () => {}
  }
  window.addEventListener(HERO_READY_EVENT, callback)
  return () => window.removeEventListener(HERO_READY_EVENT, callback)
}

/**
 * First-load intro on the home page: the koi fades in, then content blur-fades in, then the nav drops.
 * The class is removed afterwards so client-side navigations back home don't replay it.
 */
export function startIntro() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname.replace(/\/$/, '')
  if (path !== base || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    markHeroReady()
    return
  }

  const root = document.documentElement
  root.classList.add('is-intro')
  setTimeout(markHeroReady, HERO_MS)
  setTimeout(() => root.classList.remove('is-intro'), INTRO_MS)
}
