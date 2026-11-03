import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CampaignPrototype from './CampaignPrototype'
import { STAGE_HEIGHT, STAGE_WIDTH } from './data'
import { useCampaignStore } from './store'

const MIN_FULLSCREEN_SCALE = 0.55

function ScaledStage({ store, mode }) {
  const hostRef = useRef(null)
  const [scale, setScale] = useState(mode === 'fit' ? 0.5 : 1)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const measure = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width) return
      if (mode === 'fit') {
        setScale(Math.max(Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT), MIN_FULLSCREEN_SCALE))
      } else {
        setScale(width / STAGE_WIDTH)
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => observer.disconnect()
  }, [mode])

  return (
    <div ref={hostRef} className={`cp-embed__host cp-embed__host--${mode}`}>
      <div className="cp-embed__sizer" style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}>
        <div className="cp-embed__stage" style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}>
          <CampaignPrototype store={store} />
        </div>
      </div>
    </div>
  )
}

function ExpandIcon({ expanded }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {expanded ? (
        <path d="M6 2.5v3.5H2.5M10 2.5v3.5h3.5M6 13.5V10H2.5M10 13.5V10h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export default function CampaignPrototypeEmbed() {
  const store = useCampaignStore()
  const [expanded, setExpanded] = useState(false)
  const { dialog, contentModal, created } = store.state
  const modalOpen = dialog || contentModal

  const collapse = useCallback(() => setExpanded(false), [])

  useEffect(() => {
    if (!expanded) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !modalOpen) collapse()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expanded, modalOpen, collapse])

  return (
    <figure className="cp-embed">
      <div className="cp-embed__frame">
        {expanded ? (
          <div className="cp-embed__placeholder">
            <p>Prototype is open in full view</p>
            <button type="button" className="cp-embed__return" onClick={collapse}>
              Bring it back here
            </button>
          </div>
        ) : (
          <ScaledStage store={store} mode="fill" />
        )}
        {expanded ? null : (
          <button type="button" className="cp-embed__tap" aria-label="Open prototype in full view" onClick={() => setExpanded(true)} />
        )}
        {expanded ? null : (
          <button type="button" className="cp-embed__expand" aria-label="Open prototype in full view" onClick={() => setExpanded(true)} data-hoverable>
            <ExpandIcon expanded={false} />
            <span>Full view</span>
          </button>
        )}
      </div>
      <figcaption className={`cp-embed__caption ${created ? 'cp-embed__caption--quiet' : ''}`}>
        <span className="cp-embed__pulse" aria-hidden="true" />
        {created ? 'Interactive prototype. Everything on the page responds.' : 'Interactive prototype. Click New Campaign to start.'}
      </figcaption>

      {expanded
        ? createPortal(
            <div className="cp-fullscreen" role="dialog" aria-modal="true" aria-label="Training campaign prototype">
              <div className="cp-fullscreen__backdrop" onPointerDown={() => !modalOpen && collapse()} />
              <div className="cp-fullscreen__panel">
                <ScaledStage store={store} mode="fit" />
              </div>
              <button type="button" className="cp-fullscreen__close" aria-label="Close full view" onClick={collapse}>
                <ExpandIcon expanded />
                <span>Exit</span>
              </button>
            </div>,
            document.body,
          )
        : null}
    </figure>
  )
}
