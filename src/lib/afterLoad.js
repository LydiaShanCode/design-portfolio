/** Runs `callback` once the page has finished loading and the main thread is idle. Returns a cancel fn. */
export function afterLoadIdle(callback, { timeout = 2000 } = {}) {
  let idleHandle = null
  let cancelled = false
  const requestIdle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200))
  const cancelIdle = window.cancelIdleCallback ?? clearTimeout

  const schedule = () => {
    if (cancelled) return
    idleHandle = requestIdle(() => { if (!cancelled) callback() }, { timeout })
  }

  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })

  return () => {
    cancelled = true
    window.removeEventListener('load', schedule)
    if (idleHandle !== null) cancelIdle(idleHandle)
  }
}
