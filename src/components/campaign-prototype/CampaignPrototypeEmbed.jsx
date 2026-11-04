import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ScaledStage from './ScaledStage'
import { useCampaignStore } from './store'

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
    <figure className="cp-embed" data-no-sfx>
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
            <div className="cp-fullscreen" role="dialog" aria-modal="true" aria-label="Training campaign prototype" data-no-sfx>
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
