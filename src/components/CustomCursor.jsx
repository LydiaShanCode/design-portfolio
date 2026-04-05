import { useEffect, useRef } from 'react'

function CustomCursor() {
  const cursorRef = useRef(null)
  const cursorDotRef = useRef({ x: 0, y: 0 })
  const cursorPositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let isHovering = false

    const updateCursor = () => {
      cursorDotRef.current.x = cursorPositionRef.current.x
      cursorDotRef.current.y = cursorPositionRef.current.y
      cursor.style.left = `${cursorDotRef.current.x}px`
      cursor.style.top = `${cursorDotRef.current.y}px`
      requestAnimationFrame(updateCursor)
    }

    const handleMouseMoveWithHover = (e) => {
      cursorPositionRef.current.x = e.clientX
      cursorPositionRef.current.y = e.clientY

      const target = document.elementFromPoint(e.clientX, e.clientY)
      if (!(target instanceof Element)) return

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

    window.addEventListener('mousemove', handleMouseMoveWithHover)
    updateCursor()

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWithHover)
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
