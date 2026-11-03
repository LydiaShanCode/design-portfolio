import { useCallback, useRef, useState } from 'react'
import slideBack from '../../../assets/prototypes/training-campaigns/img/slide-back.webp'
import slideMid from '../../../assets/prototypes/training-campaigns/img/slide-mid.webp'
import ModulePopover from './ModulePopover'
import { shouldFlip } from './placement'

const HOVER_INTENT_MS = 120
const POPOVER_HEIGHT = 290

export default function CampaignThumbnail({ slide, count, title, onOpen }) {
  const [open, setOpen] = useState(false)
  const [flip, setFlip] = useState(false)
  const timer = useRef(0)
  const ref = useRef(null)

  const show = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setFlip(shouldFlip(ref.current, POPOVER_HEIGHT))
      setOpen(true)
    }, HOVER_INTENT_MS)
  }, [])

  const hide = useCallback(() => {
    window.clearTimeout(timer.current)
    setOpen(false)
  }, [])

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      hide()
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen?.()
    }
  }

  return (
    <div
      ref={ref}
      className="tc-thumb"
      data-open={open || undefined}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={onKeyDown}
      onClick={onOpen}
      tabIndex={0}
      role="button"
      aria-label={`${title}: ${count} modules. Open details`}
      aria-describedby={open ? 'tc-module-popover' : undefined}
    >
      <div className="tc-thumb__stack" aria-hidden="true">
        <span className="tc-thumb__layer tc-thumb__layer--4">
          <img src={slideBack} alt="" />
        </span>
        <span className="tc-thumb__layer tc-thumb__layer--3">
          <img src={slideBack} alt="" />
        </span>
        <span className="tc-thumb__layer tc-thumb__layer--2">
          <img src={slideMid} alt="" />
        </span>
        <span className="tc-thumb__layer tc-thumb__layer--1">
          <img src={slide} alt="" />
        </span>
        <span className="tc-thumb__count">{count}</span>
      </div>
      {open ? <ModulePopover placement={flip ? 'above' : 'below'} /> : null}
    </div>
  )
}
