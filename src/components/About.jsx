import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'
import Picture from './Picture'
import { DRAWING_SIZES, PHOTO_SIZES, drawings, photo, photoPlaceholder } from '../data/aboutImages'

const DRAWING_WIDTH = 260

const FAN_POSITIONS = [
  { rotate: -24, translateX: -200, translateY: -90, zIndex: 6 },
  { rotate: -18, translateX: -280, translateY: -200, zIndex: 2 },
  { rotate: -6, translateX: -210, translateY: -250, zIndex: 3 },
  { rotate: 5, translateX: -40, translateY: -160, zIndex: 4 },
  { rotate: 22, translateX: 20, translateY: -120, zIndex: 5 },
  { rotate: 15, translateX: 32, translateY: 90, zIndex: 6 },
].map((pos, i) => ({ ...pos, width: i === 4 ? 225 : DRAWING_WIDTH }))

// Top-centre outward, alternating left and right as the fan opens downward
const CASCADE_ORDER = [2, 3, 1, 4, 0, 5]
const CASCADE_RANK = CASCADE_ORDER.reduce((rank, drawingIndex, i) => ({ ...rank, [drawingIndex]: i }), {})
const CASCADE_STAGGER_S = 0.08
// Past this, drawings that have loaded go without waiting on the stragglers
const CASCADE_WAIT_MS = 1200

const SPRING = { type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }
const FADE = { duration: 0.2, ease: 'easeInOut' }
const TILT_SPRING = { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }
const PHOTO_TILT_MAX = 10

// The fan was authored as rotate() then translate() around the bottom-centre origin; Framer
// composes translate before rotate, so rotate the offset into page space to land in the same spot
const fanPose = ({ rotate, translateX, translateY }) => {
  const r = (rotate * Math.PI) / 180
  return {
    rotate,
    x: translateX * Math.cos(r) - translateY * Math.sin(r),
    y: translateX * Math.sin(r) + translateY * Math.cos(r),
    opacity: 1,
  }
}

// Tucked behind the top-centre of the photo card
const tuckedPose = ({ width }) => ({ rotate: 0, x: -width / 2, y: 24, opacity: 0 })

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
      <Picture
        image={photo}
        placeholder={photoPlaceholder}
        sizes={PHOTO_SIZES}
        priority
        alt="Lydia"
        className="about-photo"
      />
      <span className="about-photo-shine" aria-hidden="true" />
    </motion.div>
  )
}

function DrawingFan() {
  const reduceMotion = useReducedMotion()
  const fanRef = useRef(null)
  // Decoded image URL per drawing; doubles as the shimmer mask so it reuses the cached file
  const [loaded, setLoaded] = useState({})
  // Drawings ready when the cascade starts keep their place in it; late ones go as they land
  const [onTime, setOnTime] = useState(null)

  const markLoaded = useCallback((index, img) => {
    if (!img?.currentSrc) return
    img.decode()
      .catch(() => {})
      .then(() => setLoaded((prev) => (prev[index] ? prev : { ...prev, [index]: img.currentSrc })))
  }, [])

  useEffect(() => {
    fanRef.current?.querySelectorAll('.about-drawing-img').forEach((img) => {
      if (img.complete && img.naturalWidth) markLoaded(Number(img.dataset.index), img)
    })
  }, [markLoaded])

  const [waitedOut, setWaitedOut] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setWaitedOut(true), CASCADE_WAIT_MS)
    return () => clearTimeout(timer)
  }, [])

  const shouldStart = waitedOut || Object.keys(loaded).length === drawings.length
  useEffect(() => {
    if (shouldStart && onTime === null) setOnTime(new Set(Object.keys(loaded).map(Number)))
  }, [shouldStart, onTime, loaded])

  const labelDelay = (drawings.length - 1) * CASCADE_STAGGER_S + 0.2

  return (
    <div ref={fanRef} className="about-drawings" aria-hidden="true">
      {drawings.map((image, i) => {
        const pos = FAN_POSITIONS[i]
        const out = onTime !== null && Boolean(loaded[i])
        const delay = onTime?.has(i) ? CASCADE_RANK[i] * CASCADE_STAGGER_S : 0
        const rest = fanPose(pos)
        return (
          <motion.div
            key={i}
            className="about-drawing"
            style={{
              width: pos.width,
              '--fan-z': pos.zIndex,
              ...(loaded[i] && { '--drawing-mask': `url("${loaded[i]}")` }),
            }}
            initial={reduceMotion ? { ...rest, opacity: 0 } : tuckedPose(pos)}
            animate={out ? rest : undefined}
            transition={{
              default: reduceMotion ? { duration: 0 } : { ...SPRING, delay },
              opacity: { ...FADE, delay },
            }}
          >
            <Picture
              image={image}
              sizes={DRAWING_SIZES}
              loading="eager"
              alt=""
              className="about-drawing-img"
              data-index={i}
              onLoad={(event) => markLoaded(i, event.currentTarget)}
            />
            <span className="about-drawing-shine" />
          </motion.div>
        )
      })}
      <motion.p
        className="about-drawings-label"
        initial={{ opacity: 0 }}
        animate={onTime !== null ? { opacity: 1 } : undefined}
        transition={{ ...FADE, delay: labelDelay }}
      >
        some drawings I made
      </motion.p>
    </div>
  )
}

function About() {
  return (
    <main className="about-page">
      <div className="about-content">
        <div className="about-card-group">
          <DrawingFan />
          <PhotoCard />
        </div>

        <div className="about-bio">
          <p>
            I&apos;m currently a product designer based in New York City at <a href="https://www.adaptivesecurity.com" target="_blank" rel="noopener noreferrer" className="about-link" data-hoverable>Adaptive Security</a>.
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
          <blockquote className="about-quote">&quot;Your life is your artwork&quot;</blockquote>
        </div>
      </div>
    </main>
  )
}

export default About
