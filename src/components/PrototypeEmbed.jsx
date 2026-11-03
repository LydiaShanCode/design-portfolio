import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { PROTOTYPES } from '../data/prototypes'
import PrototypeOverlay from './PrototypeOverlay'

const COMPACT_QUERY = '(max-width: 767px)'
const PRELOAD_MARGIN = '300px 0px'

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />
    </svg>
  )
}

export default function PrototypeEmbed({ id }) {
  const prototype = PROTOTYPES[id]
  const rootRef = useRef(null)
  const frameRef = useRef(null)
  const triggerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [near, setNear] = useState(false)
  const [ready, setReady] = useState(false)
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY)
    const sync = () => setCompact(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || near) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: PRELOAD_MARGIN }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [near])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !prototype) return undefined
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / prototype.width))
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [prototype, compact])

  const handleReady = useCallback(() => setReady(true), [])
  const openOverlay = useCallback(() => setOpen(true), [])
  const closeOverlay = useCallback(() => setOpen(false), [])

  if (!prototype) return null
  const { Component, title, hint, width, height, poster } = prototype

  return (
    <div className="prototype-embed" ref={rootRef}>
      <div className="prototype-embed__bar">
        <div className="prototype-embed__meta">
          <span className="prototype-embed__label">Interactive prototype</span>
          <span className="prototype-embed__hint">{hint}</span>
        </div>
        <button
          ref={triggerRef}
          type="button"
          className="prototype-embed__open"
          onClick={openOverlay}
          data-hoverable
        >
          <ExpandIcon />
          <span>Open full prototype</span>
        </button>
      </div>

      {compact ? (
        <button
          type="button"
          className="prototype-embed__poster-button"
          onClick={openOverlay}
          aria-label={`Open ${title} prototype`}
          data-hoverable
        >
          <img className="prototype-embed__poster" src={poster} alt="" width={width} height={height} loading="lazy" />
          <span className="prototype-embed__poster-cta">
            <ExpandIcon />
            Tap to explore
          </span>
        </button>
      ) : (
        <div
          ref={frameRef}
          className="prototype-embed__frame"
          style={{ height: height * scale }}
          role="group"
          aria-label={`${title} interactive prototype`}
        >
          <div
            className="prototype-embed__stage"
            style={{ width, height, transform: `scale(${scale})` }}
          >
            {near ? (
              <Suspense fallback={null}>
                <Component onReady={handleReady} />
              </Suspense>
            ) : null}
            <img
              className={`prototype-embed__poster prototype-embed__poster--overlay${ready ? ' is-hidden' : ''}`}
              src={poster}
              alt=""
              width={width}
              height={height}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      <PrototypeOverlay
        open={open}
        onClose={closeOverlay}
        title={title}
        Component={Component}
        returnFocusRef={triggerRef}
      />
    </div>
  )
}
