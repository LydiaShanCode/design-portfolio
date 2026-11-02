import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import ProjectCard from './ProjectCard'
import ProjectPreview from './ProjectPreview'
import { useDesignVersion } from './design-versions/DesignVersionProvider'
import {
  FAN_CARD_WIDTH,
  FAN_FRONT_DELAY,
  FAN_MIDDLE,
  FAN_OFFSET,
  FAN_ORIGIN_Y,
  FAN_POINTER_TILT,
  FAN_TIGHTEN,
  FAN_VERSIONS,
  fanPoses,
} from './work-fan/fanLayouts'
import { featuredProjects } from '../data/projectLoader'
import { withProjectAssets } from '../data/projectAssets'
import { initCardSfx, playCardSfx, preloadCardSfx } from '../lib/cardSfx'
const SPRING = { type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }
const INSTANT = { duration: 0 }
const FADE = { duration: 0.15, ease: [0.22, 0.61, 0.36, 1] }
const AUTO_CYCLE_MS = 5000
const MOBILE_BREAKPOINT = 640
const MOBILE_INITIAL_ORDER = [2, 1, 3, 4, 0]
const DESKTOP_ORDER = [0, 1, 2, 3, 4]

const FAN_MIN_OVERLAP = 24
const FAN_MIN_SPREAD = 120
// How much of a pushed card may tuck past the viewport edge (the page clips overflow-x)
const FAN_TUCK = 0.45
const TILT_SPRING = { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }
// The hovered card only comes forward once its neighbours have started sliding away
const FAN_FRONT_DELAY_MS = 90
// How close to its own edge the pointer may end up when a newly hovered card re-centres
const FAN_POINTER_MARGIN = 56
const FAN_LEAVE_DELAY_MS = 180
// Cards lift and pivot under a still pointer; ignore sibling enters unless the pointer moved
const FAN_POINTER_STILL_PX = 10
// Matches the intro content reveal delay in custom.css so cards arrive with the hero copy
const CARD_ENTER_DELAY_MS = 200
const CARD_ENTER_RISE = 180
const CARD_ENTER_STAGGER = 0.05
// Mobile stack: one entry per depth
const STACK_ROTATIONS = [0, -2, 3, -1.5, 2]
const STACK_PEEK = 8
const SWIPE_DISTANCE = 80
const SWIPE_VELOCITY = 400

function FanCard({ pointerTilt, motionProps, ...cardProps }) {
  const rotateX = useSpring(0, TILT_SPRING)
  const rotateY = useSpring(0, TILT_SPRING)

  useEffect(() => {
    if (pointerTilt) return
    rotateX.set(0)
    rotateY.set(0)
  }, [pointerTilt, rotateX, rotateY])

  const followPointer = (event) => {
    if (!pointerTilt) return
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
    rotateY.set(((event.clientX - left) / width - 0.5) * 2 * pointerTilt)
    rotateX.set(-((event.clientY - top) / height - 0.5) * 2 * pointerTilt)
  }

  return (
    <ProjectCard
      {...cardProps}
      motionProps={{
        ...motionProps,
        style: { ...motionProps.style, rotateX, rotateY, transformPerspective: 1000 },
        onPointerMove: followPointer,
      }}
    />
  )
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
  const projects = useMemo(() => featuredProjects.slice(0, 5).map(withProjectAssets), [])
  const reduceMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT,
  )
  const [order, setOrder] = useState(() => (isMobile ? MOBILE_INITIAL_ORDER : DESKTOP_ORDER))
  const [exitingId, setExitingId] = useState(null)
  const [isBusy, setIsBusy] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [frontIndex, setFrontIndex] = useState(FAN_MIDDLE)
  const [hoverFrom, setHoverFrom] = useState(null)
  const [hoverAnchor, setHoverAnchor] = useState(null)
  const [spreadBase, setSpreadBase] = useState(200)
  const [edgeLimit, setEdgeLimit] = useState(0)
  const [videosWarm, setVideosWarm] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [cardRect, setCardRect] = useState(null)
  const [cardNode, setCardNode] = useState(null)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  )
  const [cardsEntered, setCardsEntered] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT,
  )
  const staggerEntranceRef = useRef(true)

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

  useEffect(() => initCardSfx(), [])

  useEffect(() => {
    if (isMobile || reduceMotion) {
      setCardsEntered(true)
      return undefined
    }
    const delay = document.documentElement.classList.contains('is-intro') ? CARD_ENTER_DELAY_MS : 0
    const timeout = window.setTimeout(() => setCardsEntered(true), delay)
    return () => window.clearTimeout(timeout)
  }, [isMobile, reduceMotion])

  useEffect(() => {
    if (!cardsEntered) return undefined
    const timeout = window.setTimeout(() => {
      staggerEntranceRef.current = false
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [cardsEntered])

  useEffect(() => {
    const stack = stackRef.current
    if (!stack || isMobile) return
    const count = projects.length
    const update = () => {
      const width = stack.clientWidth
      if (!width) return
      const desired = (width - FAN_CARD_WIDTH) / Math.max(count - 1, 1)
      setSpreadBase(Math.min(FAN_CARD_WIDTH - FAN_MIN_OVERLAP, Math.max(FAN_MIN_SPREAD, desired)))
      const { left, right } = stack.getBoundingClientRect()
      const center = (left + right) / 2
      const toViewportEdge = Math.min(center, document.documentElement.clientWidth - center)
      setEdgeLimit(toViewportEdge - FAN_CARD_WIDTH / 2 + FAN_CARD_WIDTH * FAN_TUCK)
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

  const handleSelect = useCallback((project, rect, node = null) => {
    if (busyRef.current) return
    setCardRect(rect)
    setCardNode(node)
    setSelectedProject(project)
  }, [])

  const handleClosePreview = useCallback(() => {
    setSelectedProject(null)
    setCardRect(null)
    setCardNode(null)
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

  // Every major version so far has cards; scope this (e.g. `scope: ['v1']`) once one doesn't.
  const fanVersion = useDesignVersion('fan-hover', FAN_VERSIONS, { label: 'Card hover', scope: 'global' })
  const fanTransition = reduceMotion ? INSTANT : SPRING
  const fanPosesNow = useMemo(() => {
    const poses = fanPoses(fanVersion, { hoverIndex, hoverFrom, spreadBase, edgeLimit, anchorX: hoverAnchor })
    const stripped = reduceMotion ? poses.map(({ transition, ...rest }) => rest) : poses
    if (isMobile) return stripped
    if (!cardsEntered) {
      return stripped.map((pose) => ({
        ...pose,
        y: (pose.y || 0) + CARD_ENTER_RISE,
        opacity: 0,
        transition: INSTANT,
      }))
    }
    return stripped.map((pose, index) => ({
      ...pose,
      opacity: 1,
      transition: staggerEntranceRef.current
        ? {
            ...(pose.transition || fanTransition),
            delay: (pose.transition?.delay || 0) + Math.abs(index - FAN_MIDDLE) * CARD_ENTER_STAGGER,
          }
        : pose.transition || fanTransition,
    }))
  }, [fanVersion, hoverIndex, hoverFrom, spreadBase, edgeLimit, hoverAnchor, reduceMotion, isMobile, cardsEntered, fanTransition])
  const pointerTilt = reduceMotion ? 0 : FAN_POINTER_TILT[fanVersion] || 0
  const fanOriginY = FAN_ORIGIN_Y[fanVersion] ?? 0.5
  const frontDelay = FAN_FRONT_DELAY[fanVersion]

  const hoverRef = useRef(hoverIndex)
  const frontRef = useRef(frontIndex)
  frontRef.current = frontIndex
  const spreadRef = useRef(spreadBase)
  const pointerRef = useRef({ x: null, y: null })
  const pointerAtHoverRef = useRef({ x: null, y: null })
  const pendingRef = useRef({ timer: null, index: undefined })
  hoverRef.current = hoverIndex
  spreadRef.current = spreadBase

  useEffect(() => () => clearTimeout(pendingRef.current.timer), [])

  const cancelPendingHover = () => {
    clearTimeout(pendingRef.current.timer)
    pendingRef.current = { timer: null, index: undefined }
  }

  // Moving straight from one card to another, the new card heads back toward its resting spot
  // but stops short of sliding out from under the pointer
  const anchorFor = (index) => {
    const stack = stackRef.current
    if (index === null || hoverRef.current === null || pointerRef.current.x === null || !stack) return null
    const { left, right } = stack.getBoundingClientRect()
    const pointer = pointerRef.current.x - (left + right) / 2
    const rest = spreadRef.current * FAN_TIGHTEN * FAN_OFFSET[index]
    const reach = FAN_CARD_WIDTH / 2 - FAN_POINTER_MARGIN
    return Math.min(pointer + reach, Math.max(pointer - reach, rest))
  }

  const commitHover = (index) => {
    pendingRef.current = { timer: null, index: undefined }
    pointerAtHoverRef.current = { ...pointerRef.current }
    setHoverAnchor(anchorFor(index))
    setHoverFrom(index === null ? null : hoverRef.current ?? frontRef.current)
    setHoverIndex(index)
    if (index !== null) playCardSfx()
  }

  const pointerMovedSinceHover = () => {
    const from = pointerAtHoverRef.current
    const to = pointerRef.current
    if (from.x === null || to.x === null) return true
    const dx = to.x - from.x
    const dy = to.y - from.y
    return dx * dx + dy * dy >= FAN_POINTER_STILL_PX * FAN_POINTER_STILL_PX
  }

  // Cards slide and lift under a still pointer, so the fan waits out a grace period before resetting
  const requestHover = (index, delay) => {
    cancelPendingHover()
    if (index === hoverRef.current) return
    if (!delay || reduceMotion) {
      commitHover(index)
      return
    }
    pendingRef.current = { timer: setTimeout(() => commitHover(index), delay), index }
  }

  const hoverCard = (index) => {
    if (hoverRef.current !== null && index !== hoverRef.current && !pointerMovedSinceHover()) return
    requestHover(index, 0)
  }

  const enterStack = () => {
    setVideosWarm(true)
    preloadCardSfx()
    if (pendingRef.current.index === null) cancelPendingHover()
  }

  const leaveStack = () => requestHover(null, FAN_LEAVE_DELAY_MS)

  const blurCard = (event) => {
    if (!stackRef.current?.contains(event.relatedTarget)) requestHover(null, 0)
  }

  const focusCard = (index) => {
    pointerRef.current = { x: null, y: null }
    requestHover(index, 0)
  }

  // The last hovered card stays in front after the pointer leaves. The switch lags the hover
  // so re-layering happens once cards are sliding apart, not while they overlap.
  useEffect(() => {
    if (hoverIndex === null) return undefined
    if (reduceMotion) {
      setFrontIndex(hoverIndex)
      return undefined
    }
    const timer = setTimeout(() => setFrontIndex(hoverIndex), frontDelay ?? FAN_FRONT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [hoverIndex, reduceMotion, frontDelay])

  // Cards nearest the front card sit on top of the ones further out
  const fanZ = (index) => 10 - Math.abs(index - frontIndex)

  return (
    <section id="work" className="pt-0 pb-0 px-4 mt-0">
      <div className="max-w-7xl mx-auto">
        <div
          className={`work-stack${isMobile ? ' work-stack--mobile' : ''}${!cardsEntered ? ' work-stack--entering' : ''}${fanVersion === 'v9' ? ' work-stack--restraint' : ''}`}
          ref={stackRef}
          onPointerEnter={isMobile ? undefined : enterStack}
          onPointerLeave={isMobile ? undefined : leaveStack}
          onPointerMove={isMobile ? undefined : (event) => { pointerRef.current = { x: event.clientX, y: event.clientY } }}
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
                    onTap={(node) => handleSelect(project, node?.getBoundingClientRect(), node?.querySelector('.work-card') ?? node)}
                  />
                )
              })
            : projects.map((project, index) => (
                <FanCard
                  key={project.id}
                  project={project}
                  stackIndex={index}
                  shouldAutoplay={index === hoverIndex}
                  warmVideo={videosWarm}
                  onSelect={handleSelect}
                  pointerTilt={index === hoverIndex ? pointerTilt : 0}
                  motionProps={{
                    initial: false,
                    animate: fanPosesNow[index],
                    transition: fanTransition,
                    style: {
                      zIndex: hoverIndex === index && !frontDelay ? 20 : fanZ(index),
                      originY: fanOriginY,
                    },
                    onPointerEnter: () => hoverCard(index),
                    onFocus: () => focusCard(index),
                    onBlur: blurCard,
                  }}
                />
              ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectPreview
          project={selectedProject}
          cardRect={cardRect}
          originNode={cardNode}
          onClose={handleClosePreview}
        />
      )}
    </section>
  )
}

export default ProjectsGrid
