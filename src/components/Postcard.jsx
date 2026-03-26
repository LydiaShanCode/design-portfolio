import { useState, useRef, useEffect, useCallback } from 'react'
import postcardBg from '../assets/postcard.png'

const CONTACT_EMAIL = 'lydiashan.c@gmail.com'

function Postcard({ onReadyChange = null, fishRef = null, mouthAnchorRef = null, onFishCatch = null }) {
  const [message, setMessage] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [motionPhase, setMotionPhase] = useState('idle')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const hasSentRef = useRef(false)
  const copyResetTimeoutRef = useRef(null)
  const textareaRef = useRef(null)
  const postcardRef = useRef(null)

  const resetPostcard = useCallback(() => {
    setMessage('')
    setFromEmail('')
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
    setMotionPhase('idle')
    hasSentRef.current = false
  }, [])

  const handleSend = () => {
    if (!message.trim() || !fromEmail.trim()) return
    const subject = encodeURIComponent('Hello from your portfolio!')
    const body = encodeURIComponent(message)
    const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}${fromEmail ? `%0A%0AFrom: ${encodeURIComponent(fromEmail)}` : ''}`
    window.location.href = mailtoLink
    window.setTimeout(() => {
      resetPostcard()
    }, 120)
  }

  const handleCopyEmail = async () => {
    const email = CONTACT_EMAIL
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = email
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    setCopiedEmail(true)
    if (copyResetTimeoutRef.current) {
      window.clearTimeout(copyResetTimeoutRef.current)
    }
    copyResetTimeoutRef.current = window.setTimeout(() => {
      setCopiedEmail(false)
    }, 5000)
  }

  const handleMouseDown = (e) => {
    if (motionPhase !== 'idle') return
    // Don't drag if clicking on interactive elements
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
      return
    }
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const showSend = message.trim() && fromEmail.trim()

  const triggerSnapAndDive = useCallback((postcardRect, topSnapX, topSnapY) => {
    const desiredLeft = topSnapX - postcardRect.width * 0.5
    const desiredTop = topSnapY - postcardRect.height

    const deltaX = desiredLeft - postcardRect.left
    const deltaY = desiredTop - postcardRect.top

    setMotionPhase('snap')
    setIsDragging(false)
    setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))

    window.setTimeout(() => {
      setMotionPhase('dive')
      if (onFishCatch) onFishCatch()
      setPosition((prev) => ({ x: prev.x - 10, y: prev.y + 620 }))
    }, 380)

    window.setTimeout(() => {
      if (!hasSentRef.current) {
        hasSentRef.current = true
        handleSend()
      }
    }, 2800)
  }, [onFishCatch, handleSend])

  const getSnapTarget = useCallback(() => {
    if (!fishRef?.current || !postcardRef.current) return null
    const postcardRect = postcardRef.current.getBoundingClientRect()
    const fishRect = fishRef.current.getBoundingClientRect()
    const mouthRect = mouthAnchorRef?.current?.getBoundingClientRect?.() || null
    const topSnapX = mouthRect ? mouthRect.left + mouthRect.width / 2 : fishRect.left + fishRect.width * 0.2
    const topSnapY = mouthRect ? mouthRect.top + mouthRect.height / 2 : fishRect.top + fishRect.height * 0.01
    return { postcardRect, fishRect, topSnapX, topSnapY }
  }, [fishRef, mouthAnchorRef])

  const checkCollisionWithFish = useCallback(() => {
    if (!showSend || motionPhase !== 'idle') return false
    const target = getSnapTarget()
    if (!target) return false
    const { postcardRect, fishRect, topSnapX, topSnapY } = target

    const intersects =
      postcardRect.left < fishRect.right &&
      postcardRect.right > fishRect.left &&
      postcardRect.top < fishRect.bottom &&
      postcardRect.bottom > fishRect.top

    if (!intersects) return false

    triggerSnapAndDive(postcardRect, topSnapX, topSnapY)

    return true
  }, [showSend, motionPhase, getSnapTarget, triggerSnapAndDive])

  const handleSendButtonClick = () => {
    if (!showSend || motionPhase !== 'idle') return
    const target = getSnapTarget()
    if (target) {
      const { postcardRect, topSnapX, topSnapY } = target
      triggerSnapAndDive(postcardRect, topSnapX, topSnapY)
      return
    }
    handleSend()
  }

  useEffect(() => {
    if (!isDragging) return
    checkCollisionWithFish()
  }, [isDragging, position, checkCollisionWithFish])

  useEffect(() => {
    if (onReadyChange) {
      onReadyChange(Boolean(showSend))
    }
  }, [showSend, onReadyChange])

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      ref={postcardRef}
      className={`postcard ${isDragging ? 'postcard-dragging' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition:
          motionPhase === 'snap'
            ? 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)'
            : motionPhase === 'dive'
              ? 'transform 2.2s cubic-bezier(0.12, 0.8, 0.2, 1)'
              : 'none',
        zIndex: motionPhase === 'dive' ? 101 : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      <img src={postcardBg} alt="" className="postcard-bg" />
      <div className="postcard-content">
        <div className="postcard-left">
          <div className="postcard-message-area">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send me a message, tell me about your adventures..."
              className="postcard-textarea"
              rows={5}
            />
          </div>
        </div>
        <div className="postcard-right">
          <div className="postcard-right-top">
            <div className="postcard-to">
              <div className="postcard-to-mobile-row">
                <span className="postcard-to-label"></span>
                <span className="postcard-to-email postcard-to-email-tap" onClick={handleCopyEmail}>
                  {copiedEmail ? 'Copied!' : CONTACT_EMAIL}
                </span>
              </div>
              <div className="postcard-to-desktop-row">
                <div className="postcard-to-label"></div>
                <div className="postcard-to-email-row">
                  <div className="postcard-to-email">{CONTACT_EMAIL}</div>
                </div>
              </div>
            </div>
            <div className="postcard-lines">
              <div className="postcard-line"></div>
            </div>
            <div className="postcard-from postcard-from-right">
              <span className="postcard-from-label">From:</span>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="Your email here"
                className="postcard-from-input"
              />
            </div>
          </div>
          {showSend && (
            <button
              type="button"
              className="postcard-send btn-hover btn-hover--solid"
              onClick={handleSendButtonClick}
              data-hoverable
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Postcard
