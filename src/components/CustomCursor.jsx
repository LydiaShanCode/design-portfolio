import { useEffect, useRef } from 'react'

function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let isHovering = false
    let lastTarget = null
    let x = 0
    let y = 0
    let frameId = 0

    // Transform-only positioning stays on the compositor; left/top would force layout every frame.
    const paint = () => {
      frameId = 0
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }

    const updateState = (target) => {
      // Hidden state
      const shouldHide = !!target.closest('[data-hide-cursor]')
      cursor.classList.toggle('hidden', shouldHide)

      // Link-out state — glassmorphic arrow cursor for new-tab links
      const isLinkOut = !!target.closest('[data-cursor-link-out]')
      cursor.classList.toggle('link-out', isLinkOut)

      if (isLinkOut) {
        // link-out takes precedence over generic hover
        if (isHovering) {
          isHovering = false
          cursor.classList.remove('hover')
        }
        return
      }

      // Generic hover state
      const shouldHover = !!(
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-hoverable]')
      )
      if (shouldHover !== isHovering) {
        isHovering = shouldHover
        cursor.classList.toggle('hover', shouldHover)
      }
    }

    // The cursor itself is pointer-events: none, so e.target is already the element under the pointer.
    const handleMouseMove = (e) => {
      x = e.clientX
      y = e.clientY
      if (!frameId) frameId = requestAnimationFrame(paint)
      cursor.classList.add('is-active')

      if (e.target !== lastTarget && e.target instanceof Element) {
        lastTarget = e.target
        updateState(e.target)
      }
    }

    const handleMouseLeave = () => cursor.classList.remove('is-active')

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
