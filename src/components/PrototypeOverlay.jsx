import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const EXIT_MS = 180
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function PrototypeOverlay({ open, onClose, title, Component, returnFocusRef }) {
  const rootRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setLeaving(false)
      return undefined
    }
    if (!mounted) return undefined
    setLeaving(true)
    const timer = window.setTimeout(() => {
      setMounted(false)
      setLeaving(false)
    }, EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [open, mounted])

  useEffect(() => {
    if (!open) return undefined
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const returnTarget = returnFocusRef?.current
    rootRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = overflow
      returnTarget?.focus({ preventScroll: true })
    }
  }, [open, returnFocusRef])

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const nodes = rootRef.current?.querySelectorAll(FOCUSABLE)
      if (!nodes?.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === rootRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose]
  )

  if (!mounted) return null

  return createPortal(
    <div
      ref={rootRef}
      className={`prototype-overlay${leaving ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} prototype`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="prototype-overlay__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="prototype-overlay__panel">
        <div className="prototype-overlay__bar">
          <span className="prototype-overlay__title">{title}</span>
          <button type="button" className="prototype-overlay__close" onClick={onClose} data-hoverable>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
              <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
            </svg>
            <span>Close</span>
            <kbd className="prototype-overlay__kbd">Esc</kbd>
          </button>
        </div>
        <div className="prototype-overlay__body">
          <Suspense fallback={null}>
            <Component fluid />
          </Suspense>
        </div>
      </div>
    </div>,
    document.body
  )
}
