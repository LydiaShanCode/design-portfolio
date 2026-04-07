import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import logo from '../assets/logo.svg'

const SPIN_HOLD_MS = 1100

const FLY_TRANSITION = {
  x:       { duration: 0.65, ease: [0.22, 0.61, 0.36, 1] },
  y:       { duration: 0.65, ease: [0.22, 0.61, 0.36, 1] },
  opacity: { duration: 0 },
}

function SiteIntro() {
  const [stage, setStage] = useState('enter')
  const [flyTarget, setFlyTarget] = useState(null)
  const [flySettled, setFlySettled] = useState(false)
  const doneTimer = useRef(null)

  const findNavLogo = useCallback(() => {
    for (const el of document.querySelectorAll('.nav-logo')) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) return rect
    }
    return null
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage('done')
      return
    }
    const t = setTimeout(() => {
      const rect = findNavLogo()
      if (rect) {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        setFlyTarget({
          x: rect.left + rect.width / 2 - cx,
          y: rect.top + rect.height / 2 - cy,
        })
      }
      setStage('fly')
    }, SPIN_HOLD_MS)
    return () => clearTimeout(t)
  }, [findNavLogo])

  // Fallback cleanup + debug: press Escape to skip
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setStage('done') }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (stage !== 'fly') return
    doneTimer.current = setTimeout(() => setStage('done'), 3500)
    return () => clearTimeout(doneTimer.current)
  }, [stage])

  if (stage === 'done') return null

  const isFly = stage === 'fly' && flyTarget

  return (
    <>
      {/* Background layer — fades out independently of the logo */}
      <motion.div
        className="site-intro-bg"
        initial={{ opacity: 1 }}
        animate={{ opacity: flySettled ? 0 : 1 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (flySettled) setStage('done')
        }}
      />

      {/* Logo layer — always above the bg, never fades via parent cascade */}
      <motion.img
        src={logo}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="site-intro-logo"
        initial={{ rotate: 0, opacity: 0 }}
        animate={
          stage === 'enter'
            ? { rotate: 720, opacity: 1 }
            : isFly
              ? { x: flyTarget.x, y: flyTarget.y, opacity: 1, rotate: 720 }
              : { rotate: 720, opacity: 1 }
        }
        transition={
          stage === 'enter'
            ? {
                rotate:  { duration: 0.9, ease: [0.12, 0.8, 0.2, 1] },
                opacity: { duration: 0.3 },
              }
            : FLY_TRANSITION
        }
        onAnimationComplete={() => {
          if (stage === 'fly') setFlySettled(true)
        }}
      />
    </>
  )
}

export default SiteIntro
