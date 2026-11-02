// Shared hero content and helpers, mirrored from src/components/Hero.jsx + DynamicTitle.jsx.

export const VERBS = ['DESIGNING', 'BUILDING', 'DEPLOYING', 'DRAWING', 'DANCING', 'MAKING MUSIC']

export const SHOPIFY_ICON = new URL('../../src/assets/shopify-icon.svg', import.meta.url).href
export const SHOPIFY_URL = 'https://www.shopify.com/editions/winter2026#marketing'
export const DJ_URL = 'https://djae.vercel.app/'

// `?rm=1` previews the reduced-motion fallback without changing OS settings.
export function prefersReduced() {
  if (new URLSearchParams(location.search).get('rm') === '1') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function subtextHTML() {
  return `<span>Designing and tinkering... prev. at</span>
    <a href="${SHOPIFY_URL}" target="_blank" rel="noreferrer"><img src="${SHOPIFY_ICON}" alt="" aria-hidden="true" />Shopify</a>`
}

export function chipHTML() {
  return `<a class="chip" href="${DJ_URL}" target="_blank" rel="noreferrer">Recently: building a dj app
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/></svg></a>`
}

/**
 * Types and deletes the verbs like DynamicTitle. `onChange(text)` fires on every keystroke.
 * Under reduced motion the full word swaps in place every few seconds.
 */
export function typewriter(onChange, { reduced = prefersReduced(), verbs = VERBS } = {}) {
  let verb = 0
  let timer = 0
  let stopped = false

  if (reduced) {
    onChange(verbs[0], 0)
    timer = setInterval(() => {
      verb = (verb + 1) % verbs.length
      onChange(verbs[verb], verb)
    }, 3200)
    return () => clearInterval(timer)
  }

  const type = (i) => {
    if (stopped) return
    const word = verbs[verb]
    onChange(word.slice(0, i), verb)
    if (i < word.length) timer = setTimeout(() => type(i + 1), 100)
    else timer = setTimeout(() => erase(word.length), 2000)
  }
  const erase = (i) => {
    if (stopped) return
    onChange(verbs[verb].slice(0, i), verb)
    if (i > 0) timer = setTimeout(() => erase(i - 1), 50)
    else {
      verb = (verb + 1) % verbs.length
      timer = setTimeout(() => type(1), 200)
    }
  }
  type(1)
  return () => {
    stopped = true
    clearTimeout(timer)
  }
}

const FALLBACK_KOI = `
        ,-~~:;;==:::~~-,
   ,:=!=!!=======;===!!==;:~-,
 -;!*=!*!====!!!!****!*#*####**!!=
 ~==;~ ,;!!=**==!*=;=!!*$#=~-~~~~,
-=;;;=;;=!===!******!!**#=,
 ;==;=**!!!===;;=!**##***~
  ~!!!!#**!;;:;;=!!##$$*==;,
     ====!*=;;;;==!!*#$$*====;,
         ;=;;=;==*!=====!=,
`

/** Loads the real ASCII koi frames through the site's lazy frames chunk. */
export async function loadKoiFrames(step = 2) {
  try {
    const { default: all } = await import('../../src/data/koiFrames.js')
    if (!all.length) throw new Error('no frames')
    return all.filter((_, i) => i % step === 0).map(trimFrame)
  } catch {
    return [FALLBACK_KOI]
  }
}

// Frames carry a lot of blank margin; crop to a shared bounding box so they stay aligned.
function trimFrame(frame) {
  return frame
    .split('\n')
    .slice(8, 53)
    .map((line) => line.slice(10, 102).replace(/\s+$/, ''))
    .join('\n')
}

/** Plays koi frames into a <pre>. Reduced motion holds the first frame. */
export function playKoi(pre, frames, { reduced = prefersReduced(), fps = 20 } = {}) {
  pre.textContent = frames[0]
  if (reduced || frames.length < 2) return () => {}
  let i = 0
  const id = setInterval(() => {
    i = (i + 1) % frames.length
    pre.textContent = frames[i]
  }, 1000 / fps)
  return () => clearInterval(id)
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const lerp = (a, b, t) => a + (b - a) * t
