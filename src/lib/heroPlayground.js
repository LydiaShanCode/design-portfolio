// Runs a standalone page from explorations/hero-playground inside a shadow root, so the
// explorations stay the single source of truth and their CSS can't collide with the site's.
import * as heroKit from '../../explorations/hero-playground/hero.js'
import baseCss from '../../explorations/hero-playground/base.css?raw'

// Island (v1), dolphins (v3), fling (v4) and the type ring (v5) stay in
// explorations/hero-playground. They are not mounted.
const PAGES = {
  ripple: () => import('../../explorations/hero-playground/v2.html?raw'),
  xray: () => import('../../explorations/hero-playground/v6.html?raw'),
}

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
const HERO_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]\.\/hero\.js['"]/

const hostCss = `
  ${baseCss
    .replace(/@import[^;]+;/g, '')
    .replace(/html,\s*body\s*\{[^}]*\}/, '')
    .replace(/:root\b/g, ':host')
    .replace(/\bbody\s*\{/g, ':host {')}
  :host { display: block; position: relative; }
  .hero { height: calc(100svh - 110px); }
  /* The site nav owns the top corners */
  :host .toggle { top: auto; bottom: 24px; }
  @media (min-width: 1024px), (min-width: 768px) and (hover: hover) and (pointer: fine) {
    * { cursor: none !important; }
  }
`

function parse(html) {
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
  const body = html.match(/<body>([\s\S]*?)<script type="module">/)?.[1] ?? ''
  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1] ?? ''
  return { styles, body, script: script.replace(HERO_IMPORT, 'const {$1} = __hero') }
}

/** Mounts a playground hero into `host`. Aborting `signal` stops every loop, timer and listener it started. */
export async function mountHeroPlayground(host, key, signal) {
  const page = parse((await PAGES[key]()).default)
  if (signal.aborted) return
  const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>${hostCss}\n${page.styles}</style>${page.body}`

  const onAbort = (fn) => signal.addEventListener('abort', fn, { once: true })
  const scopedDocument = new Proxy(document, {
    get(target, prop) {
      if (prop === 'querySelector') return (s) => root.querySelector(s)
      if (prop === 'querySelectorAll') return (s) => root.querySelectorAll(s)
      if (prop === 'activeElement') return root.activeElement
      const value = Reflect.get(target, prop)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
  const kit = {
    ...heroKit,
    typewriter: (...args) => onAbort(heroKit.typewriter(...args)),
    playKoi: (...args) => onAbort(heroKit.playKoi(...args)),
  }
  const raf = (cb) => (signal.aborted ? 0 : requestAnimationFrame((t) => !signal.aborted && cb(t)))
  const interval = (fn, ms) => {
    const id = setInterval(fn, ms)
    onAbort(() => clearInterval(id))
    return id
  }
  const timeout = (fn, ms) => setTimeout(() => !signal.aborted && fn(), ms)
  const listen = (type, fn, opts) => window.addEventListener(type, fn, { ...(typeof opts === 'object' ? opts : { capture: !!opts }), signal })
  class ScopedResizeObserver extends ResizeObserver {
    constructor(cb) {
      super(cb)
      onAbort(() => this.disconnect())
    }
  }

  onAbort(() => {
    // Browsers cap live WebGL contexts, so release them instead of waiting for GC.
    root.querySelectorAll('canvas').forEach((c) => c.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext())
    root.innerHTML = ''
  })

  const run = new AsyncFunction(
    '__hero', 'document', 'requestAnimationFrame', 'setInterval', 'setTimeout', 'addEventListener', 'ResizeObserver',
    page.script,
  )
  try {
    await run(kit, scopedDocument, raf, interval, timeout, listen, ScopedResizeObserver)
  } catch (err) {
    // Versions throw on purpose to stop after showing their reduced-motion or no-WebGL fallback.
    if (import.meta.env.DEV && !signal.aborted) console.debug(`[hero-playground:${key}]`, err.message)
  }
}
