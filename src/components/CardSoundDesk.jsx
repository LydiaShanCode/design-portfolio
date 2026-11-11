import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import {
  CARD_SFX_DEFAULTS,
  CARD_SFX_RANGES,
  getCardBuffer,
  getCardParams,
  initCardSfx,
  playCardSfx,
  resetCardParams,
  setCardParam,
  subscribeCardParams,
  subscribeCardPlays,
} from '../lib/cardSfx'

const KNOBS = ['volume', 'rate', 'rateJitter', 'lowpassHz', 'lowpassQ', 'attack', 'fadeOut']

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function toUnit(key, value) {
  const { min, max, scale } = CARD_SFX_RANGES[key]
  if (scale === 'log') {
    return (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))
  }
  return (value - min) / (max - min)
}

function fromUnit(key, unit) {
  const { min, max, step, scale } = CARD_SFX_RANGES[key]
  const t = clamp(unit, 0, 1)
  const raw = scale === 'log'
    ? Math.exp(Math.log(min) + t * (Math.log(max) - Math.log(min)))
    : min + t * (max - min)
  const snapped = min + Math.round((raw - min) / step) * step
  return Number(clamp(snapped, min, max).toFixed(4))
}

function peaksOf(buffer, bars) {
  const channel = buffer.getChannelData(0)
  const other = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null
  const block = Math.max(1, Math.floor(channel.length / bars))
  const peaks = []
  for (let i = 0; i < bars; i += 1) {
    let peak = 0
    const start = i * block
    for (let s = 0; s < block; s += 1) {
      const left = Math.abs(channel[start + s] || 0)
      const right = other ? Math.abs(other[start + s] || 0) : left
      peak = Math.max(peak, (left + right) / 2)
    }
    peaks.push(peak)
  }
  const loudest = Math.max(...peaks, 0.001)
  return peaks.map((peak) => peak / loudest)
}

// Physical Control+V. Command+V stays paste.
function isControlV(event) {
  return (
    event.key.toLowerCase() === 'v' &&
    event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey
  )
}

function isEditable(target) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null
}

function Knob({ param, value }) {
  const range = CARD_SFX_RANGES[param]
  const unit = toUnit(param, value)
  const angle = -140 + clamp(unit, 0, 1) * 280
  const drag = useRef(null)

  const moveTo = (nextUnit) => setCardParam(param, fromUnit(param, nextUnit))

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { y: event.clientY, unit }
  }

  const onPointerMove = (event) => {
    if (!drag.current) return
    const fine = event.shiftKey ? 0.22 : 1
    const delta = ((drag.current.y - event.clientY) / 130) * fine
    moveTo(drag.current.unit + delta)
  }

  const onPointerUp = () => {
    drag.current = null
  }

  const onKeyDown = (event) => {
    const step = event.shiftKey ? 0.01 : 0.04
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault()
      moveTo(unit + step)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault()
      moveTo(unit - step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      moveTo(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      moveTo(1)
    }
  }

  return (
    <div className="card-desk__param">
      <button
        type="button"
        className="card-desk__knob"
        role="slider"
        aria-label={range.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamp(unit, 0, 1) * 100)}
        aria-valuetext={range.format(value)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => setCardParam(param, CARD_SFX_DEFAULTS[param])}
        onKeyDown={onKeyDown}
      >
        <span className="card-desk__knob-tick" style={{ transform: `rotate(${angle}deg)` }} />
      </button>
      <span className="card-desk__param-label">{range.label}</span>
      <span className="card-desk__param-value">{range.format(value)}</span>
    </div>
  )
}

function Waveform({ playhead }) {
  const canvasRef = useRef(null)
  const buffer = getCardBuffer()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(width * ratio))
    canvas.height = Math.max(1, Math.floor(height * ratio))
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, width, height)
    if (!buffer) return
    const bars = Math.max(24, Math.floor(width / 3))
    const peaks = peaksOf(buffer, bars)
    const gap = 1
    const barWidth = Math.max(1, width / bars - gap)
    context.fillStyle = getComputedStyle(canvas).color || '#001dd9'
    peaks.forEach((peak, index) => {
      const barHeight = Math.max(2, peak * (height - 8))
      context.globalAlpha = 0.35 + peak * 0.65
      context.fillRect(index * (barWidth + gap), (height - barHeight) / 2, barWidth, barHeight)
    })
    context.globalAlpha = 1
  }, [buffer])

  useEffect(() => {
    draw()
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [draw])

  return (
    <div className="card-desk__wave">
      <canvas ref={canvasRef} className="card-desk__wave-canvas" />
      <span className="card-desk__playhead" style={{ left: `${playhead * 100}%` }} />
    </div>
  )
}

function CardSoundDesk() {
  const params = useSyncExternalStore(subscribeCardParams, getCardParams, getCardParams)
  const [open, setOpen] = useState(false)
  const [playhead, setPlayhead] = useState(0)
  const titleId = useId()
  const playRef = useRef(null)
  const playing = useRef(null)
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => initCardSfx(), [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.repeat) return
      if (event.key === 'Escape') {
        if (openRef.current) setOpen(false)
        return
      }
      if (event.defaultPrevented || !isControlV(event)) return
      if (isEditable(event.composedPath()[0] ?? event.target)) return
      event.preventDefault()
      setOpen((value) => !value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    playRef.current?.focus({ preventScroll: true })
    let frame = 0
    const tick = () => {
      const play = playing.current
      if (!play) return
      const next = (performance.now() - play.at) / (play.duration * 1000)
      if (next >= 1) {
        playing.current = null
        setPlayhead(0)
        return
      }
      setPlayhead(next)
      frame = requestAnimationFrame(tick)
    }
    const unsubscribe = subscribeCardPlays((play) => {
      playing.current = play
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(tick)
    })
    return () => {
      cancelAnimationFrame(frame)
      unsubscribe()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="card-desk card-desk--open">
      <section
        className="card-desk__panel"
        role="dialog"
        aria-labelledby={titleId}
      >
        <header className="card-desk__header">
          <h2 id={titleId} className="card-desk__title">Card sound</h2>
          <button ref={playRef} type="button" className="card-desk__play" data-hoverable onClick={() => playCardSfx()}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3 1.8v8.4l7-4.2-7-4.2z" fill="currentColor" />
            </svg>
            Play
          </button>
          <button
            type="button"
            className="card-desk__close"
            data-hoverable
            aria-label="Close card sound desk"
            onClick={() => setOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <Waveform playhead={playhead} />
        <div className="card-desk__knobs">
          {KNOBS.map((param) => (
            <Knob key={param} param={param} value={params[param]} />
          ))}
        </div>
        <div className="card-desk__footer">
          <p className="card-desk__note">Plays when a work card is taken.</p>
          <button type="button" className="card-desk__reset" data-hoverable onClick={resetCardParams}>
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8a5 5 0 1 0 1.2-3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M3 2.8v3.2h3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Reset
          </button>
        </div>
      </section>
    </div>
  )
}

export default CardSoundDesk
