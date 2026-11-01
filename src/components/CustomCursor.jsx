import { useEffect, useRef } from 'react'

// Only small targets snap (icon buttons, the logo, nav labels); big cards keep a free-following ring.
const SNAP_MAX_SIZE = 72
const SNAP_TIME_MS = 70
const SNAP_FOLLOW = 0.15

function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let isHovering = false
    let lastTarget = null
    let snapTarget = null
    let pointerX = 0
    let pointerY = 0
    // 0 = follows the pointer exactly, 1 = sits on the snap target. Eased so the dot glides between them.
    let snap = 0
    let lastFrame = 0
    let frameId = 0

    const paint = (now) => {
      frameId = 0
      const dt = lastFrame ? Math.min(now - lastFrame, 64) : 16
      lastFrame = now

      let x = pointerX
      let y = pointerY
      const goal = snapTarget?.isConnected ? 1 : 0
      snap += (goal - snap) * (1 - Math.exp(-dt / SNAP_TIME_MS))
      if (Math.abs(goal - snap) < 0.001) snap = goal

      if (snap > 0 && snapTarget?.isConnected) {
        const rect = snapTarget.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        // Keep a little of the pointer's offset so the snapped ring still feels attached to the hand
        const sx = cx + (pointerX - cx) * SNAP_FOLLOW
        const sy = cy + (pointerY - cy) * SNAP_FOLLOW
        x += (sx - x) * snap
        y += (sy - y) * snap
      }

      // Transform-only positioning stays on the compositor; left/top would force layout every frame.
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`

      // Keep animating while gliding or snapped (the target can move under a still pointer on scroll)
      if (snap !== goal || goal === 1) requestPaint()
      else lastFrame = 0
    }

    const requestPaint = () => {
      if (!frameId) frameId = requestAnimationFrame(paint)
    }

    const isSnappable = (el) => {
      const rect = el.getBoundingClientRect()
      return rect.width <= SNAP_MAX_SIZE && rect.height <= SNAP_MAX_SIZE
    }

    const updateState = (target) => {
      // Hidden state
      const shouldHide = !!target.closest('[data-hide-cursor]')
      cursor.classList.toggle('hidden', shouldHide)

      // Link-out state — glassmorphic arrow cursor for new-tab links
      const isLinkOut = !!target.closest('[data-cursor-link-out]')
      cursor.classList.toggle('link-out', isLinkOut)

      if (isLinkOut || shouldHide) {
        // link-out takes precedence over generic hover
        snapTarget = null
        if (isHovering) {
          isHovering = false
          cursor.classList.remove('hover')
        }
        return
      }

      // Generic hover state
      const hoverEl = target.closest('a, button, [data-hoverable]')
      const shouldHover = !!hoverEl
      snapTarget = hoverEl && isSnappable(hoverEl) ? hoverEl : null
      if (shouldHover !== isHovering) {
        isHovering = shouldHover
        cursor.classList.toggle('hover', shouldHover)
      }
    }

    // The cursor itself is pointer-events: none, so e.target is already the element under the pointer.
    const handleMouseMove = (e) => {
      pointerX = e.clientX
      pointerY = e.clientY
      requestPaint()
      cursor.classList.add('is-active')

      if (e.target !== lastTarget && e.target instanceof Element) {
        lastTarget = e.target
        updateState(e.target)
      }
    }

    const handleMouseLeave = () => {
      cursor.classList.remove('is-active')
      snapTarget = null
      lastTarget = null
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div ref={cursorRef} className="custom-cursor">
      <svg
        className="custom-cursor-link-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </div>
  )
}

export default CustomCursor
