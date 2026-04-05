import { useEffect, useMemo, useState } from 'react'
import KoiFish from './KoiFish'
import TextScrub from './TextScrub'
import shaderVideo from '../assets/Playground-page/shader-experiment-one/Shader-experiment-one.mov'

function Play() {
  const playItems = useMemo(
    () => [
      {
        id: 'listening-room',
        title: 'Listening Room',
        year: '2026',
        type: 'iframe',
        size: 'full',
        typeLabel: 'Three.js Experiment',
        href: 'https://chute-tint-71818613.figma.site/',
      },
      {
        id: 'dj-simulator',
        title: 'DJ Simulator',
        year: '2026',
        type: 'iframe',
        size: 'large',
        typeLabel: 'Interactive',
        href: 'https://djae.vercel.app/',
      },
      {
        id: 'shader-experiment',
        title: 'Shader Experiment One',
        year: '2026',
        type: 'shader-experiment',
        size: 'small',
        typeLabel: 'Shader',
        href: 'https://shush-manage-12467479.figma.site/',
        videoSrc: shaderVideo,
      },
      {
        id: 'text-scrub',
        title: 'Text Scrub Animation',
        year: '2025',
        type: 'text-scrub',
        size: 'wide',
        typeLabel: 'Interaction',
        previewNote: 'Hover reveal',
      },
      {
        id: 'koi',
        title: 'Koi Fish',
        year: '2025',
        type: 'koi',
        size: 'tall',
        typeLabel: 'Animation',
        previewNote: 'ASCII fish',
      },
    ],
    []
  )
  const [activeItem, setActiveItem] = useState(null)

  const openHrefInNewTab = (url) => {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.click()
  }

  const handleCardClick = (item) => {
    if (item.type === 'iframe' && item.href) {
      openHrefInNewTab(item.href)
      return
    }
    setActiveItem(item)
  }

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
      case 'iframe':
        return (
          <div className="play-card-iframe">
            <iframe
              src={item.href}
              title={item.title}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
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
      case 'iframe':
        return (
          <div className="play-modal-iframe">
            <iframe
              src={item.href}
              title={item.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
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
        <div className="play-grid">
          {playItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`play-card play-card--${item.size}`}
              onClick={() => handleCardClick(item)}
              aria-label={
                item.type === 'iframe' && item.href
                  ? `${item.title}, opens in a new tab`
                  : undefined
              }
              data-cursor-link-out={item.type === 'iframe' && item.href ? '' : undefined}
            >
              <div className="play-card-preview">{renderPreview(item)}</div>
              <div className="play-card-hover-badge">
                {item.year && <span className="play-card-hover-badge-year">{item.year}</span>}
                <span className="play-card-hover-badge-title">{item.title}</span>
              </div>
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
            <div className="play-modal-body scrollbar-hide">
              <div className="play-modal-header">
                <div className="play-modal-title">
                  {activeItem.year && <span className="play-modal-title-year">{activeItem.year}</span>}
                  <span className="play-modal-title-name">
                    {activeItem.title}
                    {activeItem.typeLabel && <><span className="play-modal-title-dot">·</span>{activeItem.typeLabel}</>}
                  </span>
                </div>
              
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
