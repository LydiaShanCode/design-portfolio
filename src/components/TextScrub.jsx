import { useState, useEffect, useRef, useCallback } from 'react'

const CHARS = 'abcdefghijklmnopqrstuvwxyz'

function TextScrub({ text = "UDesign, Designathon. Hackathon Judge. Feb 28, 2026", active }) {
  const [displayText, setDisplayText] = useState(text)
  const [isScrambling, setIsScrambling] = useState(false)
  const rafRef = useRef(null)
  const startTimeRef = useRef(0)
  const duration = 800

  const scramble = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    startTimeRef.current = performance.now()
    setIsScrambling(true)
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const revealedCount = Math.floor(progress * text.length)
      
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < revealedCount) {
              return text[index]
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setIsScrambling(false)
      }
    }
    
    rafRef.current = requestAnimationFrame(animate)
  }, [text])

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    setDisplayText(text)
    setIsScrambling(false)
  }, [text])

  useEffect(() => {
    if (active === undefined) return
    if (active) {
      scramble()
    } else {
      reset()
    }
  }, [active, scramble, reset])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <div
      className="text-scrub-container"
      onMouseEnter={active === undefined ? scramble : undefined}
      onMouseLeave={active === undefined ? reset : undefined}
    >
      <div className="text-scrub-wrapper">
        <span className={isScrambling ? 'scrambling' : ''}>
          {displayText}
          </span>
      </div>
    </div>
  )
}

export default TextScrub
