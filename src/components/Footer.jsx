import { useEffect, useMemo, useRef, useState } from 'react'
import Postcard from './Postcard'
import fishOpenRaw from '../assets/fish open.svg?raw'

function Footer() {
  const [showSwimFish, setShowSwimFish] = useState(false)
  const [fishDiving, setFishDiving] = useState(false)
  const fishRef = useRef(null)
  const mouthAnchorRef = useRef(null)

  const fishSvgWithAnchor = useMemo(() => {
    // Anchor point tuned in SVG coordinate space (viewBox 0 0 1024 493)
    // so Postcard snap can target fish mouth precisely.
    const anchor = '<circle id="fish-mouth-anchor" cx="188" cy="184" r="10" fill="rgba(0,0,0,0)" />'
    return fishOpenRaw.replace('</svg>', `${anchor}</svg>`)
  }, [])

  const handleReadyChange = (isReady) => {
    setShowSwimFish(isReady)
    if (!isReady) {
      setFishDiving(false)
    }
  }

  const socialLinks = [
    { name: 'linkedin', href: 'https://www.linkedin.com/in/lydiashan/' },
    { name: 'twitter', href: 'https://x.com/lydia_shann' },
    { name: 'instagram', href: 'https://www.instagram.com/lydia.is.creating/' },
    { name: 'arena', href: 'https://www.are.na/lydia-shan/website-designs-that-make-me-go-wow' },
  ]

  useEffect(() => {
    if (!showSwimFish || !fishRef.current) {
      mouthAnchorRef.current = null
      return
    }
    mouthAnchorRef.current = fishRef.current.querySelector('#fish-mouth-anchor')
  }, [showSwimFish, fishSvgWithAnchor])

  return (
    <footer className="footer-section">
      <div className="footer-inner">
        <div className="footer-left">
          <h2 className="footer-heading">
            thanks for<br />stopping by <span className="footer-smiley">☺</span>
          </h2>
          <div className="footer-links">
            {socialLinks.map((link, index) => (
              <span key={link.name}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  data-hoverable
                >
                  {link.name}
                </a>
                {index < socialLinks.length - 1 && <span className="footer-separator"> / </span>}
              </span>
            ))}
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-postcard-wrapper">
            <Postcard
              onReadyChange={handleReadyChange}
              fishRef={fishRef}
              mouthAnchorRef={mouthAnchorRef}
              onFishCatch={() => setFishDiving(true)}
            />
          </div>
          {showSwimFish && (
            <div
              ref={fishRef}
              role="img"
              aria-hidden="true"
              className={`footer-swim-fish ${fishDiving ? 'footer-swim-fish--dive' : ''}`}
              dangerouslySetInnerHTML={{ __html: fishSvgWithAnchor }}
            />
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
