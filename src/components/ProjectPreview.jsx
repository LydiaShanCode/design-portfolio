import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const CORRECT_PASSWORD = 'design is awesome'

function sessionKey(slug) {
  return `case-study-unlocked-${slug}`
}

function ProjectPreview({ project, cardRect, onClose }) {
  const overlayRef = useRef(null)
  const inputRef = useRef(null)
  const videoWrapRef = useRef(null)
  const btnRef = useRef(null)
  const rafId = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const navigate = useNavigate()
  const [phase, setPhase] = useState('flip-in')
  const [passwordPhase, setPasswordPhase] = useState('idle') // idle | input | error
  const [passwordValue, setPasswordValue] = useState('')

  const handleClose = useCallback(() => {
    setPhase('flip-out')
    setTimeout(onClose, 400)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (passwordPhase === 'input' || passwordPhase === 'error') {
          setPasswordPhase('idle')
          setPasswordValue('')
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', handleKey)

    const timer = setTimeout(() => setPhase('open'), 500)

    return () => {
      window.removeEventListener('keydown', handleKey)
      clearTimeout(timer)
    }
  }, [handleClose, passwordPhase])

  // Fallback focus in case autoFocus is suppressed (e.g. inside a modal/overlay).
  useEffect(() => {
    if (passwordPhase === 'input') {
      const id = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [passwordPhase])

  // Track mouse inside video wrap — position the pill as a custom cursor
  useEffect(() => {
    const wrap = videoWrapRef.current
    if (!wrap) return
    // For protected projects, stop tracking once the password form is open
    if (project.protected && passwordPhase !== 'idle') return

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      mousePos.current.x = e.clientX - rect.left
      mousePos.current.y = e.clientY - rect.top

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          if (btnRef.current) {
            btnRef.current.style.transform =
              `translate(${mousePos.current.x}px, ${mousePos.current.y}px) translate(-50%, -50%)`
          }
          rafId.current = null
        })
      }
    }

    wrap.addEventListener('mousemove', onMove)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [project.protected, passwordPhase])

  const {
    title,
    slug,
    video,
    image,
    highlights,
    caseStudyReady,
    protected: isProtected,
    prototypeUrl,
    siteUrl,
  } = project

  const resetMobileZoom = () => {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) return
    const original = viewport.getAttribute('content')
    viewport.setAttribute('content', original + ', maximum-scale=1')
    setTimeout(() => viewport.setAttribute('content', original), 300)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordValue === CORRECT_PASSWORD) {
      sessionStorage.setItem(sessionKey(slug), '1')
      setPasswordPhase('unlocked')
      resetMobileZoom()
      setTimeout(() => navigate(`/project/${slug}`), 600)
    } else {
      setPasswordPhase('error')
      setTimeout(() => setPasswordPhase('input'), 500)
    }
  }

  const originStyle = cardRect ? {
    '--origin-x': `${cardRect.left + cardRect.width / 2}px`,
    '--origin-y': `${cardRect.top + cardRect.height / 2}px`,
  } : {}

  // CTA rendering helpers
  function renderCta(mobile = false) {
    const mobileClass = mobile ? ' project-preview-cta--mobile' : ''
    const arrowIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="12" height="12" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    )

    const externalHref = prototypeUrl || siteUrl
    const externalLabel = prototypeUrl ? 'Try it out' : 'Visit site'

    // Mobile-only: password entry shown inline at the bottom of the card
    if (mobile && isProtected) {
      const lockIcon = (
        <svg className="project-preview-password-lock" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14" aria-hidden="true">
          {passwordPhase === 'unlocked' ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          )}
        </svg>
      )

      if (passwordPhase === 'idle') {
        return (
          <button
            type="button"
            className={`project-preview-cta btn-hover${mobileClass}`}
            data-hoverable
            onClick={(e) => {
              e.stopPropagation()
              setPasswordPhase('input')
            }}
          >
            {lockIcon}
            Enter password
          </button>
        )
      }

      return (
        <form
          className={`project-preview-password-form project-preview-password-form--mobile${passwordPhase === 'error' ? ' project-preview-password-form--shake' : ''}${passwordPhase === 'unlocked' ? ' project-preview-password-form--unlocked' : ''}`}
          onSubmit={handlePasswordSubmit}
          noValidate
          onClick={(e) => e.stopPropagation()}
        >
          {lockIcon}
          <input
            ref={inputRef}
            type="text"
            className="project-preview-password-input"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            autoComplete="current-password"
            aria-label="Case study password"
            disabled={passwordPhase === 'unlocked'}
          />
          <button
            type="submit"
            className="project-preview-password-submit"
            data-hoverable
            aria-label="Submit password"
            disabled={passwordPhase === 'unlocked'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="14" height="14" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </form>
      )
    }

    if (externalHref) {
      return (
        <a
          href={externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`project-preview-cta btn-hover${mobileClass}`}
          data-hoverable
          onClick={(e) => e.stopPropagation()}
        >
          {externalLabel}
          {arrowIcon}
        </a>
      )
    }

    if (caseStudyReady) {
      return (
        <Link
          to={`/project/${slug}`}
          className={`project-preview-cta btn-hover${mobileClass}`}
          data-hoverable
          onClick={(e) => e.stopPropagation()}
        >
          Read full case study
          {arrowIcon}
        </Link>
      )
    }

    // Mobile-only: show disabled pill when no case study is available
    if (mobile) {
      return (
        <span className={`project-preview-cta project-preview-cta--disabled btn-hover${mobileClass}`}>
          Case study coming soon
        </span>
      )
    }

    return null
  }

  return (
    <div
      ref={overlayRef}
      className={`project-preview-overlay project-preview--${phase}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose()
      }}
      style={originStyle}
    >
      <div className="project-preview-card">
        <button
          type="button"
          className="project-preview-close"
          onClick={handleClose}
          aria-label="Close preview"
          data-hoverable
        >
          ✕
        </button>

        <div className="project-preview-body">
          {/* Video / Image with password overlay for protected projects */}
          <div
            ref={videoWrapRef}
            className={`project-preview-video-wrap${(isProtected && passwordPhase === 'idle') || !isProtected ? ' project-preview-video-wrap--hide-cursor' : ''}`}
            {...((isProtected && passwordPhase === 'idle') || !isProtected ? { 'data-hide-cursor': true } : {})}
          >
            {video ? (
              <video
                src={video}
                autoPlay
                loop
                muted
                playsInline
                className="project-preview-video"
              />
            ) : image ? (
              <img src={image} alt={`${title} preview`} className="project-preview-video" />
            ) : (
              <div className="project-preview-placeholder">
                <span>Preview coming soon</span>
              </div>
            )}

            {!isProtected && (
              <div className="project-preview-password-overlay">
                {caseStudyReady ? (
                  <button
                    ref={btnRef}
                    type="button"
                    className="project-preview-password-btn"
                    onClick={() => navigate(`/project/${slug}`)}
                  >
                    Read full case study
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </button>
                ) : (
                  <div
                    ref={btnRef}
                    className="project-preview-password-btn project-preview-password-btn--disabled"
                    aria-disabled="true"
                  >
                    Case study coming soon
                  </div>
                )}
              </div>
            )}

            {isProtected && (
              <div className={`project-preview-password-overlay${passwordPhase !== 'idle' ? ' project-preview-password-overlay--active' : ''}`}>
                {passwordPhase === 'idle' ? (
                  <button
                    ref={btnRef}
                    type="button"
                    className="project-preview-password-btn"
                    onClick={() => {
                      setPasswordPhase('input')
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Enter password
                  </button>
                ) : (
                  <div
                    className="project-preview-password-anchor"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: `translate(${mousePos.current.x}px, ${mousePos.current.y}px) translate(-50%, -50%)`,
                    }}
                  >
                    <form
                      className={`project-preview-password-form${passwordPhase === 'error' ? ' project-preview-password-form--shake' : ''}${passwordPhase === 'unlocked' ? ' project-preview-password-form--unlocked' : ''}`}
                      onSubmit={handlePasswordSubmit}
                      noValidate
                    >
                      <svg className="project-preview-password-lock" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14" aria-hidden="true">
                        {passwordPhase === 'unlocked' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        )}
                      </svg>
                      <input
                        ref={inputRef}
                        type="text"
                        className="project-preview-password-input"
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        autoComplete="current-password"
                        aria-label="Case study password"
                        autoFocus
                        disabled={passwordPhase === 'unlocked'}
                      />
                      <button
                        type="submit"
                        className="project-preview-password-submit"
                        data-hoverable
                        aria-label="Submit password"
                        disabled={passwordPhase === 'unlocked'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="14" height="14" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="project-preview-info">
            <div className="project-preview-title-row">
              <h2 className="project-preview-title">{title}</h2>
            </div>

            <div className="project-preview-footer">
              {highlights && highlights.length > 0 ? (
                <div className="project-preview-meta-col project-preview-highlights">
                  {highlights.map((tag) => (
                    <span key={tag} className="project-preview-meta-label">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="project-preview-mobile-cta">
              {renderCta(true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectPreview
