/** Last known pointer position in viewport coordinates, for UI that mounts under a stationary mouse. */
export const lastPointer = { x: null, y: null }

if (typeof window !== 'undefined') {
  const track = (e) => {
    lastPointer.x = e.clientX
    lastPointer.y = e.clientY
  }
  window.addEventListener('pointermove', track, { passive: true, capture: true })
  window.addEventListener('pointerdown', track, { passive: true, capture: true })
}
