// Total length of the CSS intro in custom.css (nav: 400ms delay + 450ms drop), plus a small buffer
const INTRO_MS = 1000

/**
 * First-load intro on the home page: the koi fades in, then content blur-fades in, then the nav drops.
 * The class is removed afterwards so client-side navigations back home don't replay it.
 */
export function startIntro() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname.replace(/\/$/, '')
  if (path !== base) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const root = document.documentElement
  root.classList.add('is-intro')
  setTimeout(() => root.classList.remove('is-intro'), INTRO_MS)
}
