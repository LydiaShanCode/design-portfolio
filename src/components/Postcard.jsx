import { useState, useRef, useEffect, useCallback } from 'react'
import Picture from './Picture'
import postcardBg from '../assets/postcard.png?responsive&w=480;960;1824'

const CONTACT_EMAIL = 'lydiashan.c@gmail.com'
const SUBJECT = 'Hello from your portfolio!'
const DELIVERY_TIMEOUT_MS = 10000

function sentPageUrl() {
  return new URL(`${import.meta.env.BASE_URL}postcard-sent.html`, window.location.origin).href
}

function Postcard({ onReadyChange = null, fishRef = null, mouthAnchorRef = null, onFishCatch = null, onSendFail = null }) {
  const [message, setMessage] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [motionPhase, setMotionPhase] = useState('idle')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const hasSentRef = useRef(false)
  const copyResetTimeoutRef = useRef(null)
  const textareaRef = useRef(null)
  const postcardRef = useRef(null)
  const formRef = useRef(null)
  const iframeRef = useRef(null)
  const honeyRef = useRef(null)
  const messageRef = useRef(message)
  const fromEmailRef = useRef(fromEmail)
  const motionPhaseRef = useRef('idle')
  const sendingRef = useRef(false)
  const postedRef = useRef(false)
  const deliveryRef = useRef(null)
  const deliveryResolveRef = useRef(null)
  const deliveryTimerRef = useRef(null)
  const timersRef = useRef([])
  const onFishCatchRef = useRef(onFishCatch)
  const onSendFailRef = useRef(onSendFail)
  const beginSendRef = useRef(() => false)
  const finishSendRef = useRef(async () => {})

  messageRef.current = message
  fromEmailRef.current = fromEmail
  onFishCatchRef.current = onFishCatch
  onSendFailRef.current = onSendFail

  const resolveDelivery = useCallback((status) => {
    const resolve = deliveryResolveRef.current
    if (!resolve) return
    deliveryResolveRef.current = null
    if (deliveryTimerRef.current) {
      window.clearTimeout(deliveryTimerRef.current)
      deliveryTimerRef.current = null
    }
    resolve(status)
  }, [])

  const resetPostcard = useCallback(() => {
    setMessage('')
    setFromEmail('')
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
    setMotionPhase('idle')
    setIsSending(false)
    setSendError(false)
    motionPhaseRef.current = 'idle'
    sendingRef.current = false
    hasSentRef.current = false
    postedRef.current = false
    if (honeyRef.current) honeyRef.current.value = ''
    if (iframeRef.current) iframeRef.current.src = 'about:blank'
  }, [])

  useEffect(() => {
    const frame = iframeRef.current
    if (!frame) return undefined
    const onLoad = () => {
      if (!postedRef.current) return
      let href = ''
      try {
        href = frame.contentWindow?.location?.href || ''
      } catch {
        // A finished cross-origin document never came back to postcard-sent.html.
        resolveDelivery('error')
        return
      }
      if (href.includes('postcard-sent.html')) resolveDelivery('ok')
    }
    frame.addEventListener('load', onLoad)
    return () => frame.removeEventListener('load', onLoad)
  }, [resolveDelivery])

  // Posted into a hidden frame so the page never opens a mail app.
  // The frame only comes back to this site when the note is accepted.
  const postForm = useCallback(() => {
    const form = formRef.current
    if (!form) return false
    const reply = form.elements.namedItem('_replyto')
    const next = form.elements.namedItem('_next')
    if (reply) reply.value = fromEmailRef.current.trim()
    if (next) next.value = sentPageUrl()
    postedRef.current = true
    deliveryRef.current = new Promise((resolve) => {
      deliveryResolveRef.current = resolve
    })
    deliveryTimerRef.current = window.setTimeout(() => resolveDelivery('error'), DELIVERY_TIMEOUT_MS)
    try {
      form.submit()
    } catch {
      resolveDelivery('error')
      return false
    }
    return true
  }, [resolveDelivery])

  beginSendRef.current = () => {
    if (sendingRef.current) return false
    const nextMessage = messageRef.current.trim()
    const nextFrom = fromEmailRef.current.trim()
    if (!nextMessage || !nextFrom) return false
    if (honeyRef.current?.value.trim()) {
      resetPostcard()
      return false
    }
    sendingRef.current = true
    setIsSending(true)
    setSendError(false)
    const posted = postForm()
    if (!posted) {
      sendingRef.current = false
      setIsSending(false)
      return false
    }
    return true
  }

  finishSendRef.current = async () => {
    const result = deliveryRef.current ? await deliveryRef.current : 'error'
    if (result === 'ok') {
      resetPostcard()
      return
    }
    postedRef.current = false
    sendingRef.current = false
    hasSentRef.current = false
    motionPhaseRef.current = 'idle'
    setIsSending(false)
    setSendError(true)
    setIsDragging(false)
    setMotionPhase('idle')
    setPosition({ x: 0, y: 0 })
    onSendFailRef.current?.()
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
    if (motionPhaseRef.current !== 'idle') return
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
    if (motionPhaseRef.current !== 'idle' || sendingRef.current) return
    if (!formRef.current?.reportValidity()) return
    if (!beginSendRef.current()) return

    const desiredLeft = topSnapX - postcardRect.width * 0.5
    const desiredTop = topSnapY - postcardRect.height

    const deltaX = desiredLeft - postcardRect.left
    const deltaY = desiredTop - postcardRect.top

    motionPhaseRef.current = 'snap'
    setMotionPhase('snap')
    setIsDragging(false)
    setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))

    const diveTimer = window.setTimeout(() => {
      motionPhaseRef.current = 'dive'
      setMotionPhase('dive')
      if (onFishCatchRef.current) onFishCatchRef.current()
      setPosition((prev) => ({ x: prev.x - 10, y: prev.y + 620 }))
    }, 380)

    const finishTimer = window.setTimeout(() => {
      if (!hasSentRef.current) {
        hasSentRef.current = true
        finishSendRef.current()
      }
    }, 2800)

    timersRef.current.push(diveTimer, finishTimer)
  }, [])

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
    if (!showSend || motionPhaseRef.current !== 'idle') return false
    if (!formRef.current?.checkValidity()) return false
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
  }, [showSend, getSnapTarget, triggerSnapAndDive])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!showSend || motionPhaseRef.current !== 'idle' || sendingRef.current) return
    const target = getSnapTarget()
    if (target) {
      triggerSnapAndDive(target.postcardRect, target.topSnapX, target.topSnapY)
      return
    }
    if (!formRef.current?.reportValidity()) return
    if (!beginSendRef.current()) return
    hasSentRef.current = true
    finishSendRef.current()
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
    const timers = timersRef.current
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current)
      }
      timers.forEach((id) => window.clearTimeout(id))
      if (deliveryTimerRef.current) window.clearTimeout(deliveryTimerRef.current)
    }
  }, [])

  const sendLabel = sendError ? 'Try again' : isSending && motionPhase === 'idle' ? 'Sending' : 'Send'

  return (
    <>
      <iframe
        ref={iframeRef}
        name="postcard-delivery"
        title="Contact form delivery"
        className="postcard-delivery"
        tabIndex={-1}
        aria-hidden="true"
      />
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
        <Picture image={postcardBg} sizes="(min-width: 560px) 520px, 100vw" loading="eager" className="postcard-bg" />
        <form
          ref={formRef}
          className="postcard-content"
          action={`https://formsubmit.co/${CONTACT_EMAIL}`}
          method="POST"
          target="postcard-delivery"
          referrerPolicy="no-referrer-when-downgrade"
          onSubmit={handleSubmit}
        >
          <div className="postcard-left">
            <div className="postcard-message-area">
              <textarea
                ref={textareaRef}
                name="message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  if (sendError) setSendError(false)
                }}
                placeholder="Send me a message, tell me about your adventures..."
                className="postcard-textarea"
                rows={5}
                required
                aria-label="Message"
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
                  name="email"
                  value={fromEmail}
                  onChange={(e) => {
                    setFromEmail(e.target.value)
                    if (sendError) setSendError(false)
                  }}
                  placeholder="Your email here"
                  className="postcard-from-input"
                  autoComplete="email"
                  required
                  aria-label="Your email"
                />
              </div>
            </div>
            {showSend && (
              <button
                type="submit"
                className="postcard-send btn-hover btn-hover--solid"
                data-hoverable
                aria-label={sendError ? "Couldn't send. Try again." : undefined}
              >
                {sendLabel}
              </button>
            )}
          </div>
          <input type="hidden" name="_subject" value={SUBJECT} />
          <input type="hidden" name="_template" value="box" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_replyto" defaultValue="" />
          <input type="hidden" name="_next" defaultValue="" />
          <input
            ref={honeyRef}
            type="text"
            name="_honey"
            className="postcard-sr"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            defaultValue=""
          />
          <p className="postcard-sr" role="status">
            {sendError ? "Couldn't send that message. Try again." : isSending ? 'Sending your message.' : ''}
          </p>
        </form>
      </div>
    </>
  )
}

export default Postcard
