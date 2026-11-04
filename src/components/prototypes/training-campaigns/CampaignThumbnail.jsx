import { useCallback, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ModuleIcon from './ModuleIcon'
import ModulePopover from './ModulePopover'
import { shouldFlip } from './placement'

const HOVER_INTENT_MS = 120
const POPOVER_HEIGHT = 290
const VISIBLE_ICONS = 3
const ICON_SIZE = 44
const ICON_STEP = 22
const SPREAD = 6
const LIFT = -9
const SPRING = { type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }

export default function CampaignThumbnail({ modules, title, onOpen }) {
  const [open, setOpen] = useState(false)
  const [flip, setFlip] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const timer = useRef(0)
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()

  const visible = modules.slice(0, VISIBLE_ICONS)
  const spread = open && !reduceMotion
  const transition = reduceMotion ? { duration: 0 } : SPRING

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
    setActiveId(null)
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

  const lastIndex = visible.length - 1

  if (modules.length === 0) {
    return (
      <div className="tc-thumb tc-thumb--empty" onClick={onOpen} role="button" tabIndex={0} aria-label={`${title}: no modules yet. Open`} onKeyDown={onKeyDown}>
        <span className="tc-thumb__placeholder" aria-hidden="true" />
      </div>
    )
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
      aria-label={`${title}: ${modules.length} modules. Open details`}
      aria-describedby={open ? 'tc-module-popover' : undefined}
    >
      <div className="tc-thumb__stack" aria-hidden="true">
        {visible.map((module, index) => {
          const active = module.id === activeId
          return (
            <motion.span
              key={module.id}
              className="tc-thumb__icon"
              data-active={active || undefined}
              style={{ left: index * ICON_STEP, zIndex: active ? VISIBLE_ICONS + 1 : VISIBLE_ICONS - index }}
              initial={false}
              animate={{
                x: spread ? index * SPREAD : 0,
                y: active && !reduceMotion ? LIFT : 0,
                scale: active && !reduceMotion ? 1.08 : 1,
              }}
              transition={transition}
              onPointerEnter={() => setActiveId(module.id)}
            >
              <ModuleIcon id={module.icon || module.id} size={ICON_SIZE} />
            </motion.span>
          )
        })}
        <motion.span
          className="tc-thumb__count"
          style={{ left: lastIndex * ICON_STEP + ICON_SIZE - 12 }}
          initial={false}
          animate={{ x: spread ? lastIndex * SPREAD : 0 }}
          transition={transition}
        >
          {modules.length}
        </motion.span>
      </div>
      {open ? <ModulePopover modules={modules} activeId={activeId} placement={flip ? 'above' : 'below'} /> : null}
    </div>
  )
}
