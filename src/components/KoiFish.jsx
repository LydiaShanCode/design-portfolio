import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import firstFrameRaw from '../assets/koi-frames/frame-000.txt?raw'

const FRAME_MS = 50
const SHIMMER_MS = 150
const SHIMMER_RATIO = 0.02
// Characters to cycle through for loading animation
const LOADING_CHARS = ['|', '/', '-', '\\']

const firstFrameChars = firstFrameRaw.split('')
const shimmerCandidates = firstFrameChars.reduce((indices, char, i) => {
  if (char !== ' ' && char !== '\n') indices.push(i)
  return indices
}, [])
const shimmerCount = Math.min(Math.floor(firstFrameChars.length * SHIMMER_RATIO), shimmerCandidates.length)

function shimmerFrame(loadingChar) {
  const chars = [...firstFrameChars]
  const positions = new Set()
  while (positions.size < shimmerCount) {
    positions.add(shimmerCandidates[Math.floor(Math.random() * shimmerCandidates.length)])
  }
  positions.forEach((pos) => { chars[pos] = loadingChar })
  return chars.join('')
}

function KoiFish() {
  const containerRef = useRef(null)
  const fishRef = useRef(null)
  const framesRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fishScale, setFishScale] = useState(1)

  useEffect(() => {
    let cancelled = false
    import('../data/koiFrames').then(({ default: allFrames }) => {
      if (cancelled || allFrames.length === 0) return
      framesRef.current = allFrames
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  // Frames are ~170k characters of pre-formatted text; writing textContent directly skips
  // React reconciliation, and measuring only on resize avoids a forced layout every frame.
  useEffect(() => {
    const fish = fishRef.current
    const container = containerRef.current
    if (!fish || !container) return

    let rafId = 0
    let last = 0
    let tick = 0
    let inView = true

    const step = (now) => {
      rafId = requestAnimationFrame(step)
      if (!inView) return
      const frames = framesRef.current
      const interval = frames ? FRAME_MS : SHIMMER_MS
      const elapsed = now - last
      if (elapsed < interval) return
      last = elapsed > interval * 4 ? now : now - (elapsed % interval)
      fish.textContent = frames
        ? frames[tick % frames.length]
        : shimmerFrame(LOADING_CHARS[tick % LOADING_CHARS.length])
      tick++
    }

    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting })
    observer.observe(container)
    rafId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [isLoading])

  useLayoutEffect(() => {
    const container = containerRef.current
    const fish = fishRef.current
    if (!container || !fish) return

    const updateScale = () => {
      const fW = fish.scrollWidth
      const fH = fish.scrollHeight
      if (fW > 0 && fH > 0) {
        setFishScale(Math.min(container.clientWidth / fW, container.clientHeight / fH, 1))
      }
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [isLoading])

  return (
    <div
      ref={containerRef}
      className="koi-container relative inline-block"
      style={{ width: 'min(550px, 100vw)', height: 'min(420px, 87vw)' }}
    >
      <div
        ref={fishRef}
        className="koi-fish absolute top-1/2 left-1/2"
        style={{
          fontFamily: "'Courier New', monospace",
          fontWeight: 700,
          whiteSpace: 'pre',
          fontSize: 'clamp(8px, 1.4vw, 12px)',
          lineHeight: '1',
          color: 'var(--color-primary)',
          transformOrigin: 'center',
          opacity: isLoading ? 0.7 : 0.9,
          transform: `translate(-50%, -50%) scale(${fishScale})`,
          transition: isLoading ? 'none' : 'opacity 0.3s ease-in',
        }}
      >
        {firstFrameRaw}
      </div>
    </div>
  )
}

export default KoiFish
