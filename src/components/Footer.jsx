import { useEffect, useMemo, useRef, useState } from 'react'
import Postcard from './Postcard'
import fishOpenRaw from '../assets/fish open.svg?raw'
import arenaIcon from '../assets/arena-icon.svg'

const CONTACT_EMAIL = 'lydiashan.c@gmail.com'

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

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = CONTACT_EMAIL
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/lydiashan/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <path d="M7 11v6M7 7v.01M11 17v-4a2 2 0 1 1 4 0v4M11 11v6" />
        </svg>
      ),
    },
    {
      name: 'X',
      href: 'https://x.com/lydia_shann',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: 'https://github.com/LydiaShanCode',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      ),
    },
    {
      name: 'Are.na',
      href: 'https://www.are.na/lydia-shan/website-designs-that-make-me-go-wow',
      icon: (
        <span aria-hidden="true" style={{ display: 'inline-block', width: 18, height: 18, backgroundColor: '#001DD9', WebkitMaskImage: `url(${arenaIcon})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${arenaIcon})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
      ),
    },
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
            Thanks for stopping by
          </h2>
          <div className="footer-links">
            <button
              type="button"
              className="footer-link"
              data-hoverable
              onClick={copyEmail}
              aria-label={`Copy email address ${CONTACT_EMAIL}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </button>
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                data-hoverable
                aria-label={link.name}
              >
                {link.icon}
              </a>
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
      <p className="footer-copyright">© 2026 — Lydia Shan</p>
    </footer>
  )
}

export default Footer
