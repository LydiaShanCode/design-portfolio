import { useEffect, useRef } from 'react'
import { MODULES } from '../../../data/trainingCampaigns'
import Icon from './Icon'

const SCROLL_DELAY_MS = 450
const SCROLL_DURATION_MS = 2600

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export default function ModulePopover({ placement = 'below' }) {
  const listRef = useRef(null)
  const popoverRef = useRef(null)

  useEffect(() => {
    const list = listRef.current
    const popover = popoverRef.current
    if (!list || !popover) return undefined

    const syncEnd = () => {
      const atEnd = list.scrollTop >= list.scrollHeight - list.clientHeight - 1
      popover.toggleAttribute('data-at-end', atEnd)
    }
    syncEnd()
    list.addEventListener('scroll', syncEnd, { passive: true })

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let timer = 0

    const stop = () => {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(frame)
    }

    if (!reduceMotion) {
      timer = window.setTimeout(() => {
        const distance = list.scrollHeight - list.clientHeight
        if (distance <= 0) return
        const start = performance.now()
        const tick = (now) => {
          const progress = Math.min(1, (now - start) / SCROLL_DURATION_MS)
          list.scrollTop = distance * easeInOut(progress)
          if (progress < 1) frame = window.requestAnimationFrame(tick)
        }
        frame = window.requestAnimationFrame(tick)
      }, SCROLL_DELAY_MS)
    }

    list.addEventListener('wheel', stop, { passive: true })
    list.addEventListener('touchstart', stop, { passive: true })

    return () => {
      stop()
      list.removeEventListener('scroll', syncEnd)
      list.removeEventListener('wheel', stop)
      list.removeEventListener('touchstart', stop)
    }
  }, [])

  return (
    <div
      ref={popoverRef}
      className={`tc-popover tc-popover--${placement}`}
      role="tooltip"
      id="tc-module-popover"
    >
      <div className="tc-popover__meta">
        <span className="tc-chip tc-chip--label">
          <Icon name="timer" size={12} />
          ~8 min
        </span>
        <span className="tc-chip tc-chip--medium">
          <Icon name="book-marked" size={12} />
          {MODULES.length} modules
        </span>
      </div>
      <div className="tc-popover__list-wrap">
        <ul ref={listRef} className="tc-popover__list">
          {MODULES.map((module) => (
            <li key={module.id} className="tc-popover__item">
              <img className="tc-popover__thumb" src={module.image} alt="" width="21" height="21" />
              <span className="tc-popover__title">{module.title}</span>
            </li>
          ))}
        </ul>
        <div className="tc-popover__fade" aria-hidden="true" />
      </div>
    </div>
  )
}
