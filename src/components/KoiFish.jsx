import { useEffect, useRef, useState } from 'react'

// Total frames: 000-197 (198 frames) - all frames are consecutive
const TOTAL_FRAMES = 198
// Characters to cycle through for loading animation
const LOADING_CHARS = ['|', '/', '-', '\\']

function KoiFish() {
  const containerRef = useRef(null)
  const fishRef = useRef(null)
  const [frames, setFrames] = useState([])
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [firstFrame, setFirstFrame] = useState('')
  const [animatedFrame, setAnimatedFrame] = useState('')
  const loadingCharIndexRef = useRef(0)

  useEffect(() => {
    const framePromises = Array.from({ length: 198 }, (_, i) => {
      const num = i.toString().padStart(3, '0')
      return import(`../assets/koi-frames/frame-${num}.txt?raw`)
        .then((m) => m.default)
        .catch(() => '')
    })

    framePromises[0].then((content) => {
      if (content) {
        setFirstFrame(content)
        setAnimatedFrame(content)
      }
    })

    Promise.all(framePromises).then((allFrames) => {
      setFrames(allFrames)
      setIsLoading(false)
    })
  }, [])

  // Subtle animation on first frame while loading
  useEffect(() => {
    if (!isLoading || !firstFrame) return

    const animateFirstFrame = () => {
      // Cycle through loading characters, replacing a few characters randomly
      const chars = firstFrame.split('')
      const charCount = chars.length
      
      // Replace a small percentage of characters with cycling loading chars
      const numToReplace = Math.floor(charCount * 0.02) // 2% of characters
      const loadingChar = LOADING_CHARS[loadingCharIndexRef.current % LOADING_CHARS.length]
      
      // Get random positions to replace (but avoid already replaced positions)
      const positions = new Set()
      while (positions.size < numToReplace) {
        const pos = Math.floor(Math.random() * charCount)
        // Only replace non-whitespace characters
        if (chars[pos] && chars[pos] !== ' ' && chars[pos] !== '\n') {
          positions.add(pos)
        }
      }
      
      const animated = [...chars]
      positions.forEach(pos => {
        animated[pos] = loadingChar
      })
      
      setAnimatedFrame(animated.join(''))
      loadingCharIndexRef.current++
    }

    const interval = setInterval(animateFirstFrame, 150) // Slower animation for subtlety
    return () => clearInterval(interval)
  }, [isLoading, firstFrame])

  // Animate frames cycling (normal animation when all loaded)
  useEffect(() => {
    if (isLoading || frames.length === 0) return

    const frameInterval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length)
    }, 50) // Change frame every 50ms (20 FPS for smooth animation)

    return () => clearInterval(frameInterval)
  }, [frames, isLoading])

  // Determine which frame to show
  const displayFrame = isLoading ? animatedFrame : (frames[currentFrameIndex] || '')

  const [fishScale, setFishScale] = useState(1)

  useEffect(() => {
    if (!containerRef.current || !fishRef.current) return

    const updateScale = () => {
      const cW = containerRef.current.clientWidth
      const cH = containerRef.current.clientHeight
      const fW = fishRef.current.scrollWidth
      const fH = fishRef.current.scrollHeight
      if (fW > 0 && fH > 0) {
        setFishScale(Math.min(cW / fW, cH / fH, 1))
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [displayFrame])

  return (
    <div
      ref={containerRef}
      className="koi-container relative inline-block"
      style={{ width: 'min(550px, 100vw)', height: 'min(420px, 87vw)' }}
    >
      {displayFrame && (
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
          {displayFrame}
        </div>
      )}
    </div>
  )
}

export default KoiFish
