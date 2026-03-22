import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

function ProjectPreview({ project, cardRect, onClose }) {
  const overlayRef = useRef(null)
  const [phase, setPhase] = useState('flip-in')

  const handleClose = useCallback(() => {
    setPhase('flip-out')
    setTimeout(onClose, 400)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)

    const timer = setTimeout(() => setPhase('open'), 500)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
      clearTimeout(timer)
    }
  }, [handleClose])

  const {
    title,
    company,
    icon,
    slug,
    video,
    image,
    highlights,
    timeline,
    caseStudyReady,
  } = project

  const originStyle = cardRect ? {
    '--origin-x': `${cardRect.left + cardRect.width / 2}px`,
    '--origin-y': `${cardRect.top + cardRect.height / 2}px`,
  } : {}

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
          {/* Video / Image — top of card per Figma */}
          <div className="project-preview-video-wrap">
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
          </div>

          <div className="project-preview-info">
            <div className="project-preview-title-row">
              <h2 className="project-preview-title">{title}</h2>
              <span className="project-preview-company-name project-preview-company-name--mobile">
                {icon ? <img src={icon} alt="" aria-hidden="true" className="project-preview-company-icon" /> : null}
                {company}
              </span>
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
              <div className="project-preview-meta-col">
                {timeline ? <span className="project-preview-meta-label">{timeline}</span> : null}
              </div>
              {caseStudyReady ? (
                <div className="project-preview-meta-col project-preview-cta-col--desktop">
                  <Link
                    to={`/project/${slug}`}
                    className="project-preview-cta"
                    data-hoverable
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read full case study
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="12" height="12" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </Link>
                </div>
              ) : null}
            </div>
            {caseStudyReady ? (
              <Link
                to={`/project/${slug}`}
                className="project-preview-cta project-preview-cta--mobile"
                data-hoverable
                onClick={(e) => e.stopPropagation()}
              >
                Read full case study
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectPreview
