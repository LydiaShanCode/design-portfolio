import { useEffect, useRef } from 'react'

const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
})

const DIGIT_STAGGER_MS = 40
// Keep in sync with the time-digit-in/out animation duration in custom.css
const DIGIT_ROLL_MS = 320

function readNow() {
  const parts = timeFormat.formatToParts(new Date())
  const get = (type) => parts.find((part) => part.type === type)?.value ?? ''
  const hourMinute = `${get('hour')}:${get('minute')} ${get('dayPeriod')}`
  return { full: `${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod')}`, hourMinute }
}

function createFace(char, entering) {
  const face = document.createElement('span')
  face.className = entering ? 'time-digit-face is-entering' : 'time-digit-face'
  face.textContent = char
  return face
}

function LocalTime({ className = '' }) {
  const digitsRef = useRef(null)
  const srRef = useRef(null)

  useEffect(() => {
    const root = digitsRef.current
    if (!root) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let slots = []
    let shown = ''
    let timeoutId = 0

    // Ticks every second, so digits are patched in place instead of re-rendering React.
    const build = (text) => {
      root.replaceChildren()
      slots = [...text].map((char) => {
        const slot = document.createElement('span')
        slot.className = 'time-digit'
        slot.appendChild(createFace(char, false))
        root.appendChild(slot)
        return slot
      })
    }

    const update = () => {
      const { full, hourMinute } = readNow()
      if (srRef.current && srRef.current.textContent !== hourMinute) srRef.current.textContent = hourMinute

      if (full.length !== shown.length || reduceMotion) {
        build(full)
      } else {
        // Rightmost digits change first, so a rollover (e.g. :59 → :00) cascades leftward
        let changed = 0
        for (let i = full.length - 1; i >= 0; i--) {
          if (full[i] === shown[i]) continue
          const slot = slots[i]
          const delayMs = changed * DIGIT_STAGGER_MS
          changed++

          slot.querySelectorAll('.is-leaving').forEach((el) => el.remove())
          const current = slot.querySelector('.time-digit-face')
          if (current) {
            current.classList.remove('is-entering')
            current.classList.add('is-leaving')
            current.style.animationDelay = `${delayMs}ms`
            setTimeout(() => current.remove(), DIGIT_ROLL_MS + delayMs)
          }
          const next = createFace(full[i], true)
          next.style.animationDelay = `${delayMs}ms`
          slot.appendChild(next)
        }
      }

      shown = full
      timeoutId = setTimeout(update, 1000 - (Date.now() % 1000) + 5)
    }

    update()

    const onVisible = () => {
      if (document.hidden) return
      clearTimeout(timeoutId)
      shown = ''
      update()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <p className={`local-time ${className}`.trim()}>
      <span ref={srRef} className="sr-only" />
      <span ref={digitsRef} className="local-time-value" aria-hidden="true" />
      <span>in New York City</span>
    </p>
  )
}

export default LocalTime
