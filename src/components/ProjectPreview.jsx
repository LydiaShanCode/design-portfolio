import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Picture from './Picture'
import Video from './Video'
import { lastPointer } from '../lib/pointer'

const CORRECT_PASSWORD = 'design is awesome'
const SPRING = { type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }

function sessionKey(slug) {
  return `case-study-unlocked-${slug}`
}

function ProjectPreview({ project, cardRect, onClose }) {
  const overlayRef = useRef(null)
  const inputRef = useRef(null)
  const videoWrapRef = useRef(null)
  const btnRef = useRef(null)
  const formRef = useRef(null)
  const pillSize = useRef(null)
  const reduceMotion = useReducedMotion()
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

  // Grow the pill into the form instead of swapping it, so the click reads as one object opening up
  useLayoutEffect(() => {
    const form = formRef.current
    const from = pillSize.current
    if (passwordPhase !== 'input' || !form || !from) return
    pillSize.current = null
    if (reduceMotion) return

    const to = { width: form.offsetWidth, height: form.offsetHeight }
    form.style.width = `${from.width}px`
    form.style.height = `${from.height}px`
    form.classList.add('project-preview-password-form--morphing')
    const settle = () => {
      form.style.width = ''
      form.style.height = ''
      form.classList.remove('project-preview-password-form--morphing')
    }
    const controls = animate(form, { width: [from.width, to.width], height: [from.height, to.height] }, {
      ...SPRING,
      onComplete: settle,
    })
    return () => {
      controls.stop()
      settle()
    }
  }, [passwordPhase, reduceMotion])

  // Track mouse inside video wrap — position the pill as a custom cursor
  useEffect(() => {
    const wrap = videoWrapRef.current
    if (!wrap) return
    // For protected projects, stop tracking once the password form is open
    if (project.protected && passwordPhase !== 'idle') return

    // Measures where the wrap sits once the card has settled. offsetLeft/offsetTop ignore transforms,
    // so the pill lands under the pointer even while the flip-in still has the card edge-on.
    const settledOrigin = () => {
      const overlay = overlayRef.current
      const overlayRect = overlay.getBoundingClientRect()
      let x = overlayRect.left + overlay.clientLeft
      let y = overlayRect.top + overlay.clientTop
      for (let node = wrap; node && node !== overlay; node = node.offsetParent) {
        x += node.offsetLeft
        y += node.offsetTop
        if (node.offsetParent && node.offsetParent !== overlay) {
          x += node.offsetParent.clientLeft
          y += node.offsetParent.clientTop
        }
      }
      for (let node = wrap.parentElement; node && node !== overlay; node = node.parentElement) {
        x -= node.scrollLeft
        y -= node.scrollTop
      }
      return { x, y }
    }

    const place = (clientX, clientY) => {
      const origin = settledOrigin()
      mousePos.current.x = clientX - origin.x
      mousePos.current.y = clientY - origin.y
    }

    const paintPill = () => {
      if (btnRef.current) {
        btnRef.current.style.transform =
          `translate(${mousePos.current.x}px, ${mousePos.current.y}px) translate(-50%, -50%)`
      }
    }

    // The preview usually opens under a mouse that hasn't moved yet, so start the pill where the pointer already is
    if (lastPointer.x !== null) {
      place(lastPointer.x, lastPointer.y)
      paintPill()
    }

    const onMove = (e) => {
      place(e.clientX, e.clientY)

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          paintPill()
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

      const isIdle = passwordPhase === 'idle'
      return (
        <div className="project-preview-mobile-password">
          <button
            type="button"
            className={`project-preview-cta project-preview-cta--password btn-hover${mobileClass}${!isIdle ? ' project-preview-mobile-password__item--out' : ''}`}
            data-hoverable
            tabIndex={isIdle ? undefined : -1}
            onClick={(e) => {
              e.stopPropagation()
              setPasswordPhase('input')
            }}
          >
            {lockIcon}
            Enter password
          </button>
          <form
            className={`project-preview-password-form project-preview-password-form--mobile${isIdle ? ' project-preview-mobile-password__item--out' : ''}${passwordPhase === 'error' ? ' project-preview-password-form--shake' : ''}${passwordPhase === 'unlocked' ? ' project-preview-password-form--unlocked' : ''}`}
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
              tabIndex={isIdle ? -1 : undefined}
              disabled={passwordPhase === 'unlocked'}
            />
            <button
              type="submit"
              className="project-preview-password-submit"
              data-hoverable
              aria-label="Submit password"
              tabIndex={isIdle ? -1 : undefined}
              disabled={passwordPhase === 'unlocked'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="14" height="14" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>
        </div>
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
              <Video media={video} preload="auto" className="project-preview-video" />
            ) : image ? (
              <Picture
                image={image}
                sizes="(min-width: 1100px) 1100px, 100vw"
                priority
                alt={`${title} preview`}
                className="project-preview-video"
              />
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
                    onClick={(e) => {
                      pillSize.current = { width: e.currentTarget.offsetWidth, height: e.currentTarget.offsetHeight }
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
                      ref={formRef}
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
                        placeholder="Password"
                        spellCheck={false}
                        autoFocus
                        disabled={passwordPhase === 'unlocked'}
                      />
                      <button
                        type="submit"
                        className={`project-preview-password-submit${passwordValue ? ' project-preview-password-submit--ready' : ''}`}
                        data-hoverable
                        aria-label="Submit password"
                        disabled={passwordPhase === 'unlocked'}
                      >
                        <svg className="project-preview-password-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="14" height="14" aria-hidden="true">
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
