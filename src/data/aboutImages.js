import photo from '../assets/about page/lydia.png?responsive&w=480;960'
import photoPlaceholder from '../assets/about page/lydia.png?lqip'
import drawing1 from '../assets/about page/Untitled.png?responsive&w=480;960'
import drawing2 from '../assets/about page/Untitled (1).png?responsive&w=480;960'
import drawing3 from '../assets/about page/Untitled (2).png?responsive&w=480;960'
import drawing4 from '../assets/about page/Untitled (3).png?responsive&w=480;960'
import drawing5 from '../assets/about page/Untitled (4).png?responsive&w=480;960'
import drawing6 from '../assets/about page/Untitled (6).png?responsive&w=480;960'
import { dedupeSrcset } from '../lib/srcset'

export const PHOTO_SIZES = '320px'
export const DRAWING_SIZES = '260px'

export { photo, photoPlaceholder }
export const drawings = [drawing3, drawing4, drawing2, drawing1, drawing5, drawing6]

let preloaded = false

// AVIF only: hinting WebP too would double-fetch in browsers that support both, and
// browsers without AVIF skip the hint by `type` and fall back to <picture> discovery
function preloadPicture(image, sizes, fetchPriority) {
  if (!image.sources.avif) return
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.type = 'image/avif'
  link.setAttribute('imagesrcset', dedupeSrcset(image.sources.avif))
  link.setAttribute('imagesizes', sizes)
  link.setAttribute('fetchpriority', fetchPriority)
  document.head.appendChild(link)
}

/**
 * Starts the About chunk and its images before the route renders, so landing on /about
 * (or clicking the nav link) doesn't wait on JS → chunk → <img> discovery in series.
 */
export function preloadAboutPage() {
  if (preloaded || typeof document === 'undefined') return
  preloaded = true
  import('../components/About')
  preloadPicture(photo, PHOTO_SIZES, 'high')
  drawings.forEach((image) => preloadPicture(image, DRAWING_SIZES, 'auto'))
}

const ABOUT_LINK = 'a[href$="/about"]'
const INTENT_EVENTS = ['pointerover', 'focusin', 'touchstart']

/** Preloads right away when landing on /about, otherwise on first intent toward an About link. */
export function installAboutPreload() {
  if (/\/about\/?$/.test(window.location.pathname)) {
    preloadAboutPage()
    return
  }
  const onIntent = (event) => {
    if (!event.target.closest?.(ABOUT_LINK)) return
    INTENT_EVENTS.forEach((type) => document.removeEventListener(type, onIntent, true))
    preloadAboutPage()
  }
  INTENT_EVENTS.forEach((type) => document.addEventListener(type, onIntent, { capture: true, passive: true }))
}
