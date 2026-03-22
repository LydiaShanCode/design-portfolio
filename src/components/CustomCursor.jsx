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
      // Smooth elastic motion - cursor trails behind actual position
      cursorDotRef.current.x = cursorPositionRef.current.x
      cursorDotRef.current.y = cursorPositionRef.current.y

      cursor.style.left = `${cursorDotRef.current.x}px`
      cursor.style.top = `${cursorDotRef.current.y}px`

      requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e) => {
      cursorPositionRef.current.x = e.clientX
      cursorPositionRef.current.y = e.clientY
    }

    const handleMouseEnter = (e) => {
      const target = e.target
      if (
        target instanceof Element &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.closest('a') ||
          target.closest('button') ||
          target.closest('[data-hoverable]'))
      ) {
        isHovering = true
        cursor.classList.add('hover')
      }
    }

    const handleMouseLeave = (e) => {
      isHovering = false
      cursor.classList.remove('hover')
    }

    // Check hover state on mouse move
    const handleMouseMoveWithHover = (e) => {
      handleMouseMove(e)
      const target = document.elementFromPoint(e.clientX, e.clientY)
      if (
        target instanceof Element &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.closest('a') ||
          target.closest('button') ||
          target.closest('[data-hoverable]'))
      ) {
        if (!isHovering) {
          isHovering = true
          cursor.classList.add('hover')
        }
      } else {
        if (isHovering) {
          isHovering = false
          cursor.classList.remove('hover')
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMoveWithHover)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    updateCursor()

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWithHover)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor" />
}

export default CustomCursor
