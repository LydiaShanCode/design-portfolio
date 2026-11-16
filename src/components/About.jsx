import { useRef } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'
import Picture from './Picture'
import photo from '../assets/about page/lydia.png?responsive&w=480;960'
import drawing1 from '../assets/about page/Untitled.png?responsive&w=480;960'
import drawing2 from '../assets/about page/Untitled (1).png?responsive&w=480;960'
import drawing3 from '../assets/about page/Untitled (2).png?responsive&w=480;960'
import drawing4 from '../assets/about page/Untitled (3).png?responsive&w=480;960'
import drawing5 from '../assets/about page/Untitled (4).png?responsive&w=480;960'
import drawing6 from '../assets/about page/Untitled (6).png?responsive&w=480;960'

const drawings = [drawing3, drawing4, drawing2, drawing1, drawing5, drawing6]

const FAN_POSITIONS = [
  { rotate: '-24deg', translateX: '-200px', translateY: '-90px', zIndex: 6 },
  { rotate: '-18deg', translateX: '-280px', translateY: '-200px', zIndex: 2 },
  { rotate: '-6deg',  translateX: '-210px',  translateY: '-250px', zIndex: 3 },
  { rotate: '5deg',  translateX: '-40px',  translateY: '-160px', zIndex: 4 },
  { rotate: '22deg',  translateX: '20px',  translateY: '-120px', zIndex: 5 },
  { rotate: '15deg',  translateX: '32px',  translateY: '90px', zIndex: 6 },
]

const FAN_STAGGER_MS = 60
const PHOTO_TILT_MAX = 10
const TILT_SPRING = { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }

function PhotoCard() {
  const cardRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const rotateX = useSpring(0, TILT_SPRING)
  const rotateY = useSpring(0, TILT_SPRING)

  const followPointer = (event) => {
    const card = cardRef.current
    if (!card) return
    const { left, top, width, height } = card.getBoundingClientRect()
    const x = Math.min(Math.max((event.clientX - left) / width, 0), 1)
    const y = Math.min(Math.max((event.clientY - top) / height, 0), 1)
    card.style.setProperty('--pointer-x', `${x * 100}%`)
    card.style.setProperty('--pointer-y', `${y * 100}%`)
    card.dataset.shimmer = 'true'
    if (reduceMotion) return
    rotateY.set((x - 0.5) * 2 * PHOTO_TILT_MAX)
    rotateX.set(-(y - 0.5) * 2 * PHOTO_TILT_MAX)
  }

  const resetTilt = () => {
    if (cardRef.current) delete cardRef.current.dataset.shimmer
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className="about-photo-card"
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerDown={followPointer}
      onPointerMove={followPointer}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      onPointerUp={(event) => event.pointerType !== 'mouse' && resetTilt()}
    >
      <Picture image={photo} sizes="320px" priority alt="Lydia" className="about-photo" />
      <p className="about-photo-label">Hi, I'm Lydia</p>
      <span className="about-photo-shine" aria-hidden="true" />
    </motion.div>
  )
}

function About() {
  return (
    <main className="about-page">
      <div className="about-content">
        <div className="about-card-group">
          <div className="about-drawings" aria-hidden="true">
            {drawings.map((image, i) => {
              const pos = FAN_POSITIONS[i]
              return (
                <div
                  key={i}
                  className="about-drawing"
                  style={{
                    '--fan-rotate': pos.rotate,
                    '--fan-x': pos.translateX,
                    '--fan-y': pos.translateY,
                    '--fan-z': pos.zIndex,
                    '--fan-delay': `${i * FAN_STAGGER_MS}ms`,
                    '--drawing-mask': `url("${image.img.src}")`,
                    ...(i === 4 && { width: '225px' }),
                  }}
                >
                  <Picture image={image} sizes="260px" loading="eager" alt="" className="about-drawing-img" />
                  <span className="about-drawing-shine" />
                </div>
              )
            })}
            <p className="about-drawings-label">some drawings I made</p>
          </div>

          <PhotoCard />
        </div>

        <div className="about-bio">
          <p>
            I'm currently a product designer based in New York City at <a href="https://www.adaptivesecurity.com" target="_blank" rel="noopener noreferrer" className="about-link" data-hoverable>Adaptive Security</a>.
          </p>
          <p>
            Previously, I was on the payments team at <a href="https://www.shopify.com/editions/winter2026" target="_blank" rel="noopener noreferrer" className="about-link" data-hoverable>Shopify</a>,
            designing financial experiences across mobile and desktop. Before that, I worked in
            startups building 0–1 products and end-to-end experiences.
          </p>
          <p>
            As a designer, I always lead with curiosity. In a world where roles are merging,
            our curiosity and desire to explore maintains our unique impact.
          </p>
          <blockquote className="about-quote">"Your life is your artwork"</blockquote>
        </div>
      </div>
    </main>
  )
}

export default About
