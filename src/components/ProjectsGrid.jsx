import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import ProjectCard from './ProjectCard'
import ProjectPreview from './ProjectPreview'
import projectsFromMd from '../data/projectLoader'
import { withProjectAssets } from '../data/projectAssets'

const SPRING = { type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }
const INSTANT = { duration: 0 }
const FADE = { duration: 0.15, ease: [0.22, 0.61, 0.36, 1] }
const AUTO_CYCLE_MS = 5000
const MOBILE_BREAKPOINT = 640
const MOBILE_INITIAL_ORDER = [2, 1, 3, 4, 0]
const DESKTOP_ORDER = [0, 1, 2, 3, 4]

// Desktop fan: one entry per stack slot
const FAN_OFFSET = [-2, -1, 0, 1, 2]
const FAN_TILT = [-8, -4, 0, 4, 8]
const FAN_EDGE_PUSH = [0, 1, 1, 1, 0]
const FAN_Z = [1, 2, 3, 2, 1]
const FAN_CARD_WIDTH = 340
const FAN_MIN_OVERLAP = 24
const FAN_MIN_SPREAD = 120
const FAN_TIGHTEN = 0.82
const FAN_HOVER_PUSH = 36
const FAN_HOVER_LIFT = -22

// Mobile stack: one entry per depth
const STACK_ROTATIONS = [0, -2, 3, -1.5, 2]
const STACK_PEEK = 8
const SWIPE_DISTANCE = 80
const SWIPE_VELOCITY = 400

function fanPose(slot, hoverIndex, spreadBase) {
  const hovered = hoverIndex !== null
  const spread = hovered ? spreadBase : spreadBase * FAN_TIGHTEN
  const push = hovered ? FAN_HOVER_PUSH * FAN_EDGE_PUSH[slot] * (slot - hoverIndex) : 0
  const lift = slot === hoverIndex ? FAN_HOVER_LIFT : 0
  // The lift travels along the card's own (rotated) axis
  const tilt = (FAN_TILT[slot] * Math.PI) / 180
  return {
    x: spread * FAN_OFFSET[slot] + push - lift * Math.sin(tilt),
    y: lift * Math.cos(tilt),
    rotate: FAN_TILT[slot],
  }
}

function stackPose(depth) {
  const scale = 1 - depth * 0.02
  const side = depth % 2 === 1 ? -1 : 1
  const peekX = depth === 0 ? 0 : side * Math.ceil(depth / 2) * STACK_PEEK
  const peekY = depth === 0 ? 0 : Math.ceil(depth / 2) * 3
  // Offsets are expressed in the card's scaled space, matching the original CSS transform order
  return { x: peekX * scale, y: peekY * scale, scale, rotate: STACK_ROTATIONS[depth] || 0 }
}

const StackCard = forwardRef(function StackCard({
  project,
  stackIndex,
  depth,
  isExiting,
  canDrag,
  reduceMotion,
  onSwipe,
  onDragStart,
  onDragCancel,
  onTap,
}, ref) {
  const x = useMotionValue(0)
  const fade = useMotionValue(1)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const dragOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])
  const opacity = useTransform(() => fade.get() * dragOpacity.get())
  const wrapperRef = useRef(null)
  const didDragRef = useRef(false)
  const isTop = depth === 0

  useImperativeHandle(ref, () => ({
    // Fly off-screen carrying `velocity`; calls onCleared once the card no longer covers the stack
    fly(direction, velocity, onCleared) {
      const width = wrapperRef.current?.offsetWidth || 320
      const offscreen = direction * (window.innerWidth / 2 + width)
      let cleared = false
      return new Promise((resolve) => {
        const controls = animate(x, offscreen, { ...SPRING, velocity })
        const unsubscribe = x.on('change', (value) => {
          if (!cleared && Math.abs(value) > width * 0.6) {
            cleared = true
            onCleared()
          }
          // Settling past the edge is invisible, so hand off as soon as it's out of view
          if (Math.abs(value) >= Math.abs(offscreen) * 0.97) {
            controls.stop()
            unsubscribe()
            resolve()
          }
        })
        controls.then(() => {
          unsubscribe()
          if (!cleared) onCleared()
          resolve()
        })
      })
    },
    returnHome() {
      return animate(x, 0, SPRING)
    },
    fadeTo(value) {
      return animate(fade, value, FADE)
    },
    reset() {
      x.set(0)
    },
  }), [x, fade])

  const handleDragEnd = (event, info) => {
    requestAnimationFrame(() => { didDragRef.current = false })
    const passed = Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY
    if (!passed) {
      onDragCancel()
      return
    }
    const direction = (Math.abs(info.velocity.x) > SWIPE_VELOCITY ? info.velocity.x : info.offset.x) > 0 ? 1 : -1
    onSwipe(direction, info.velocity.x)
  }

  const pose = stackPose(depth)

  return (
    <motion.div
      ref={wrapperRef}
      className={`work-card-mobile-wrapper${isTop ? ' work-card-mobile-wrapper--top' : ''}`}
      initial={false}
      animate={pose}
      transition={reduceMotion ? INSTANT : SPRING}
      style={{ zIndex: isExiting ? 20 : 10 - depth, opacity }}
    >
      <motion.div
        className="work-card-mobile-drag"
        style={{ x, rotate }}
        drag={canDrag ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        dragTransition={{ bounceStiffness: SPRING.stiffness, bounceDamping: SPRING.damping }}
        onDragStart={() => {
          didDragRef.current = true
          onDragStart()
        }}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (didDragRef.current || !isTop) return
          onTap(wrapperRef.current)
        }}
        whileTap={canDrag ? { scale: 0.98 } : undefined}
      >
        <ProjectCard project={project} stackIndex={stackIndex} isMobileStack />
      </motion.div>
    </motion.div>
  )
})

function ProjectsGrid() {
  const projects = useMemo(() => projectsFromMd.slice(0, 5).map(withProjectAssets), [])
  const reduceMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT,
  )
  const [order, setOrder] = useState(() => (isMobile ? MOBILE_INITIAL_ORDER : DESKTOP_ORDER))
  const [exitingId, setExitingId] = useState(null)
  const [isBusy, setIsBusy] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [settlingIndex, setSettlingIndex] = useState(null)
  const [spreadBase, setSpreadBase] = useState(200)
  const [videosWarm, setVideosWarm] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [cardRect, setCardRect] = useState(null)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  )

  const stackRef = useRef(null)
  const cardRefs = useRef(new Map())
  const orderRef = useRef(order)
  const busyRef = useRef(false)
  const timerRef = useRef(null)
  orderRef.current = order

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT
      setIsMobile((prev) => {
        if (mobile !== prev) setOrder(mobile ? MOBILE_INITIAL_ORDER : DESKTOP_ORDER)
        return mobile
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const stack = stackRef.current
    if (!stack || isMobile) return
    const count = projects.length
    const update = () => {
      const width = stack.clientWidth
      if (!width) return
      const desired = (width - FAN_CARD_WIDTH) / Math.max(count - 1, 1)
      setSpreadBase(Math.min(FAN_CARD_WIDTH - FAN_MIN_OVERLAP, Math.max(FAN_MIN_SPREAD, desired)))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(stack)
    return () => observer.disconnect()
  }, [isMobile, projects.length])

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(stack)
    const onVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const setAnimating = (active) => {
    stackRef.current?.classList.toggle('work-stack--animating', active)
  }

  const setBusy = (busy) => {
    busyRef.current = busy
    setIsBusy(busy)
  }

  const clearAutoCycle = () => clearTimeout(timerRef.current)

  const cycle = useCallback(async (direction = -1, velocity = 0) => {
    if (busyRef.current) return
    const topId = projects[orderRef.current[0]]?.id
    const card = cardRefs.current.get(topId)
    if (!card) return

    clearAutoCycle()
    setBusy(true)
    setAnimating(true)
    const sendToBack = () => setOrder((prev) => [...prev.slice(1), prev[0]])

    if (reduceMotion) {
      await card.fadeTo(0)
      flushSync(sendToBack)
      card.reset()
      await card.fadeTo(1)
      setAnimating(false)
      setBusy(false)
      return
    }

    setExitingId(topId)
    await card.fly(direction, velocity, sendToBack)
    // Drop below the stack before travelling back so it tucks in behind
    flushSync(() => setExitingId(null))
    // The new top card is already in place, so it can be swiped while this one returns
    setBusy(false)
    await card.returnHome()
    if (!busyRef.current) setAnimating(false)
  }, [projects, reduceMotion])

  const autoCycleEnabled = isMobile && !reduceMotion && inView && pageVisible && !selectedProject

  // Re-armed whenever the stack goes idle, so a manual swipe restarts the full interval
  useEffect(() => {
    if (!autoCycleEnabled || isBusy || isDragging) return
    timerRef.current = setTimeout(() => cycle(-1, 0), AUTO_CYCLE_MS)
    return clearAutoCycle
  }, [autoCycleEnabled, isBusy, isDragging, cycle])

  const handleSelect = useCallback((project, rect) => {
    if (busyRef.current) return
    setCardRect(rect)
    setSelectedProject(project)
  }, [])

  const handleClosePreview = useCallback(() => {
    setSelectedProject(null)
    setCardRect(null)
  }, [])

  // Dragging blocks auto-cycle via busyRef but must not flip `canDrag` mid-gesture
  const handleDragStart = useCallback(() => {
    clearAutoCycle()
    busyRef.current = true
    setIsDragging(true)
    setAnimating(true)
  }, [])

  const handleDragCancel = useCallback(() => {
    busyRef.current = false
    setIsDragging(false)
    setAnimating(false)
  }, [])

  const handleSwipe = useCallback((direction, velocity) => {
    busyRef.current = false
    setIsDragging(false)
    cycle(direction, velocity)
  }, [cycle])

  const hoverCard = (index) => {
    if (hoverIndex !== null && hoverIndex !== index) setSettlingIndex(hoverIndex)
    setHoverIndex(index)
  }

  const leaveCard = (event) => {
    if (event.relatedTarget?.closest?.('.work-card')) return
    if (hoverIndex !== null) setSettlingIndex(hoverIndex)
    setHoverIndex(null)
  }

  const fanTransition = reduceMotion ? INSTANT : SPRING

  return (
    <section id="work" className="pt-0 pb-0 px-4 mt-0">
      <div className="max-w-7xl mx-auto">
        <div
          className={`work-stack ${isMobile ? 'work-stack--mobile' : ''}`}
          ref={stackRef}
          onPointerEnter={isMobile ? undefined : () => setVideosWarm(true)}
        >
          {isMobile
            ? projects.map((project, index) => {
                const depth = order.indexOf(index)
                if (depth === -1) return null
                return (
                  <StackCard
                    key={project.id}
                    ref={(node) => {
                      if (node) cardRefs.current.set(project.id, node)
                      else cardRefs.current.delete(project.id)
                    }}
                    project={project}
                    stackIndex={index}
                    depth={depth}
                    isExiting={exitingId === project.id}
                    canDrag={depth === 0 && !isBusy}
                    reduceMotion={reduceMotion}
                    onSwipe={handleSwipe}
                    onDragStart={handleDragStart}
                    onDragCancel={handleDragCancel}
                    onTap={(node) => handleSelect(project, node?.getBoundingClientRect())}
                  />
                )
              })
            : projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  stackIndex={index}
                  shouldAutoplay={index === hoverIndex}
                  warmVideo={videosWarm}
                  onSelect={handleSelect}
                  motionProps={{
                    initial: false,
                    animate: fanPose(index, hoverIndex, spreadBase),
                    transition: fanTransition,
                    style: {
                      zIndex: index === hoverIndex ? 10 : index === settlingIndex ? 9 : FAN_Z[index],
                    },
                    onAnimationComplete: () => {
                      if (index === settlingIndex) setSettlingIndex(null)
                    },
                    onPointerEnter: () => hoverCard(index),
                    onPointerLeave: leaveCard,
                    onFocus: () => hoverCard(index),
                    onBlur: leaveCard,
                  }}
                />
              ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectPreview
          project={selectedProject}
          cardRect={cardRect}
          onClose={handleClosePreview}
        />
      )}
    </section>
  )
}

export default ProjectsGrid
