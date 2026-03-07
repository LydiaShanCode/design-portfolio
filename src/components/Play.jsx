import { useEffect, useMemo, useState } from 'react'
import KoiFish from './KoiFish'
import TextScrub from './TextScrub'
import shaderVideo from '../assets/Playground-page/shader-experiment-one/Shader-experiment-one.mov'

function Play() {
  const playItems = useMemo(
    () => [
      {
        id: 'koi',
        title: 'Koi Fish',
        type: 'koi',
        size: 'large',
        typeLabel: 'Animation',
        previewNote: 'ASCII fish',
      },
      {
        id: 'shader-experiment',
        title: 'Shader Experiment One',
        type: 'shader-experiment',
        size: 'wide',
        typeLabel: 'Shader',
        href: 'https://shush-manage-12467479.figma.site/',
        videoSrc: shaderVideo,
      },
      {
        id: 'text-scrub',
        title: 'Text Scrub Animation',
        type: 'text-scrub',
        size: 'wide',
        typeLabel: 'Interaction',
        previewNote: 'Hover reveal',
      },
    ],
    []
  )
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    if (!activeItem) {
      document.body.style.overflow = ''
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveItem(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeItem])

  const renderPreview = (item) => {
    switch (item.type) {
      case 'koi':
        return (
          <div className="play-card-koi">
            <KoiFish />
          </div>
        )
      case 'text-scrub':
        return (
          <div className="play-card-text-scrub">
            <TextScrub />
          </div>
        )
      case 'shader-experiment':
        return (
          <div className="play-card-video">
            <video
              src={item.videoSrc}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        )
      case 'image':
        return <img src={item.previewSrc} alt={item.title} />
      case 'video':
        return (
          <div className="play-placeholder">
            <span>{item.previewNote || 'Video preview'}</span>
          </div>
        )
      case 'code':
        return (
          <pre className="play-code-preview">
            <code>{item.previewCode}</code>
          </pre>
        )
      case 'link':
        return (
          <div className="play-link-preview">
            <span>{item.href}</span>
          </div>
        )
      default:
        return null
    }
  }

  const renderModalContent = (item) => {
    switch (item.type) {
      case 'koi':
        return (
          <div className="play-modal-koi">
            <KoiFish />
          </div>
        )
      case 'text-scrub':
        return (
          <div className="play-modal-text-scrub">
            <TextScrub />
          </div>
        )
      case 'shader-experiment':
        return (
          <div className="play-modal-shader">
            <video
              src={item.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="play-modal-video"
            />
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="play-modal-link-btn"
              data-hoverable
            >
              View live experiment
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-4.5-6H18m0 0v4.5m0-4.5-7.5 7.5" />
              </svg>
            </a>
          </div>
        )
      case 'image':
        return <img src={item.fullSrc || item.previewSrc} alt={item.title} />
      case 'video':
        return (
          <div className="play-placeholder play-placeholder--modal">
            <span>{item.previewNote || 'MP4 goes here'}</span>
          </div>
        )
      case 'code':
        return (
          <pre className="play-code-full">
            <code>{item.code}</code>
          </pre>
        )
      case 'link':
        return (
          <div className="play-link-full">
            <p>Open the experiment in a new tab.</p>
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.href}
            </a>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section id="play" className="play-section">
      <div className="play-inner">
        <div className="play-header">
          <p className="play-subtitle">
            Small experiments, sketches, and playful artifacts.
          </p>
        </div>
        <div className="play-grid">
          {playItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`play-card play-card--${item.size}`}
              onClick={() => setActiveItem(item)}
            >
              <span className="play-card-badge">{item.typeLabel}</span>
              <div className="play-card-preview">{renderPreview(item)}</div>
            </button>
          ))}
        </div>
      </div>
      {activeItem && (
        <div className="play-modal" onClick={() => setActiveItem(null)}>
          <div className="play-modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="play-modal-close"
              onClick={() => setActiveItem(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="play-modal-body">
              <div className="play-modal-title">
                <h3>{activeItem.title}</h3>
                <span>{activeItem.typeLabel}</span>
              </div>
              <div className="play-modal-content">{renderModalContent(activeItem)}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Play
