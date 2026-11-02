import { useState, useEffect, useRef } from 'react'
import Picture from './Picture'
import LocalTime from './LocalTime'
import drawing1 from '../assets/about page/Untitled.png?responsive&w=480;960'
import drawing2 from '../assets/about page/Untitled (1).png?responsive&w=480;960'
import drawing3 from '../assets/about page/Untitled (2).png?responsive&w=480;960'
import drawing4 from '../assets/about page/Untitled (3).png?responsive&w=480;960'
import drawing5 from '../assets/about page/Untitled (4).png?responsive&w=480;960'
import drawing6 from '../assets/about page/Untitled (6).png?responsive&w=480;960'

const drawings = [drawing3, drawing4, drawing2, drawing1, drawing5, drawing6]

const FOCUS_AREAS = ['Merchant tools', 'Payments & fintech', 'Security & trust', 'Design systems']

// Pre-set fan positions for each drawing
const FAN_POSITIONS = [
  { rotate: '-24deg', translateX: '-200px', translateY: '-90px', zIndex: 6 },
  { rotate: '-18deg', translateX: '-280px', translateY: '-200px', zIndex: 2 },
  { rotate: '-6deg',  translateX: '-210px',  translateY: '-250px', zIndex: 3 },
  { rotate: '5deg',  translateX: '-40px',  translateY: '-160px', zIndex: 4 },
  { rotate: '22deg',  translateX: '20px',  translateY: '-120px', zIndex: 5 },
  { rotate: '15deg',  translateX: '32px',  translateY: '90px', zIndex: 6 },
]

function About() {
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)
  const active = hovered || tapped
  const cardGroupRef = useRef(null)

  useEffect(() => {
    if (!tapped) return
    const handleOutside = (e) => {
      if (cardGroupRef.current && !cardGroupRef.current.contains(e.target)) {
        setTapped(false)
      }
    }
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('mousedown', handleOutside)
    return () => {
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('mousedown', handleOutside)
    }
  }, [tapped])

  return (
    <main className="about-page">
      <div className="about-content">
        <div
          ref={cardGroupRef}
          className="about-card-group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setTapped(t => !t)}
        >
          {/* Drawing fan — hidden beneath the card, fans out on hover */}
          <div className="about-drawings" aria-hidden="true">
            {drawings.map((src, i) => {
              const pos = FAN_POSITIONS[i]
              return (
                <Picture
                  key={i}
                  image={src}
                  sizes="260px"
                  loading="eager"
                  alt=""
                  className="about-drawing"
                  style={{
                    transform: active
                      ? `rotate(${pos.rotate}) translate(${pos.translateX}, ${pos.translateY})`
                      : 'rotate(0deg) translate(0px, 0px)',
                    opacity: active ? 1 : 0,
                    zIndex: pos.zIndex,
                    transitionDelay: '0ms',
                    ...(i === 4 && { width: '225px' }),
                  }}
                />
              )
            })}
            <p
              className="about-drawings-label"
              style={{
                opacity: active ? 1 : 0,
                transition: 'opacity 420ms var(--ease-dramatic)',
              }}
            >
              some drawings I made
            </p>
          </div>

          <div className="about-id-card">
            <div className="about-id-card-top">
              <p className="about-id-card-name">Lydia Shan</p>
              <p className="about-id-card-role">Product Designer</p>
            </div>
            <ul className="about-id-card-focus">
              {FOCUS_AREAS.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <LocalTime />
          </div>
        </div>

        <div className="about-bio">
          <p>
            I’m a product designer based in New York City, specializing in B2B experiences
            where the stakes are high and the details matter: merchant tools, payments and
            financial operations, and security-minded workflows built on trust and clarity.
          </p>
          <p>
            I’ve designed payments and merchant tooling at commerce scale, trading tools for
            capital markets, and 0–1 products at early-stage startups.
          </p>
          <p>
            As a designer, I always lead with curiosity. In a world where roles are merging,
            our curiosity and desire to explore maintains our unique impact.
          </p>
          <blockquote className="about-quote">“Your life is your artwork”</blockquote>
        </div>
      </div>
    </main>
  )
}

export default About
