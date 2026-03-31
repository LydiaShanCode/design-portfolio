import { useEffect, useRef, useState, useCallback } from 'react'
import { useDialKit } from 'dialkit'
import ProjectCard from './ProjectCard'
import ProjectPreview from './ProjectPreview'
import projectsFromMd from '../data/projectLoader'
import designSystemImage from '../assets/projects/design-system/ design system - work card image.png'
import flowOfFundsImage from '../assets/projects/payouts-uplift/payouts uplift - work card image.png'
import shopBalanceImage from '../assets/projects/shop-balance/shop balance - work card image.png'
import internationalCommerceImage from '../assets/projects/international-commerce/international commerce - work card image.png'
import listeningRoomImage from '../assets/projects/Listening Room/listening room - work card image.png'
import currentRibbon from '../assets/current ribbon.svg'
import shopifyIcon from '../assets/shopify-icon.svg'
import searchEyeIcon from '../assets/searcheye icon.svg'
import flowOfFundsVideo from '../assets/projects/payouts-uplift/payouts uplift final video.MP4'
import designSystemVideo from '../assets/projects/design-system/Design System Final Video.MP4'
import internationalCommerceVideo from '../assets/projects/international-commerce/International Commerce Final video.MP4'
import shopBalanceVideo from '../assets/projects/shop-balance/Shop Balance final video.MP4'
import listeningRoomVideo from '../assets/projects/Listening Room/Listening Room final video.MP4'

function ProjectsGrid() {
  const [projects, setProjects] = useState([])
  const [cardOrder, setCardOrder] = useState([0, 1, 2, 3, 4])
  const [isMobile, setIsMobile] = useState(false)
  const [desktopHoverIndex, setDesktopHoverIndex] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [cardRect, setCardRect] = useState(null)
  const [swipingIndex, setSwipingIndex] = useState(null)
  const stackRef = useRef(null)
  const autoSwipeTimerRef = useRef(null)
  const userInteractedRef = useRef(false)
  const pausedRef = useRef(false)
  const animatedCycleRef = useRef(null)

  const dial = useDialKit('Card Stack', {
    exit: {
      _collapsed: true,
      travelDistance: [-70, -300, 0],
      rotationZ: [-8, -30, 30],
      scaleOut: [0.95, 0.5, 1.2],
      spring: { type: 'spring', visualDuration: 0.45, bounce: 0.25 },
    },
    entrance: {
      _collapsed: true,
      delay: [0.05, 0, 0.5],
      spring: { type: 'spring', stiffness: 200, damping: 25, mass: 4.2 },
    },
    timing: {
      _collapsed: true,
      interval: [5, 1, 15, 0.5],
    },
    paused: false,
    cycle: { type: 'action', label: 'Cycle Now' },
  }, {
    onAction: (action) => {
      if (action === 'cycle') animatedCycleRef.current?.()
    },
  })

  const imageAssets = {
    designSystem: designSystemImage,
    flowOfFunds: flowOfFundsImage,
    shopBalance: shopBalanceImage,
    internationalCommerce: internationalCommerceImage,
    listeningRoom: listeningRoomImage,
  }

  const videoAssets = {
    designSystem: designSystemVideo,
    flowOfFunds: flowOfFundsVideo,
    internationalCommerce: internationalCommerceVideo,
    shopBalance: shopBalanceVideo,
    listeningRoom: listeningRoomVideo,
  }

  const ribbonAssets = {
    current: currentRibbon,
  }

  const iconAssets = {
    shopify: shopifyIcon,
    searchEye: searchEyeIcon,
  }

  const enrichProject = (project) => ({
    ...project,
    image: imageAssets[project.imageKey],
    ribbon: ribbonAssets[project.ribbonKey],
    icon: iconAssets[project.iconKey],
    video: videoAssets[project.videoKey] || null,
  })

  const handleSelect = useCallback((project, rect) => {
    if (swipingIndex !== null) return
    setCardRect(rect)
    setSelectedProject(project)
    clearInterval(autoSwipeTimerRef.current)
  }, [swipingIndex])

  const handleClosePreview = useCallback(() => {
    setSelectedProject(null)
    setCardRect(null)
  }, [])

  useEffect(() => {
    setProjects(projectsFromMd)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 640
      setIsMobile((prev) => {
        if (mobile !== prev) {
          setCardOrder(mobile ? [2, 0, 1, 3, 4] : [0, 1, 2, 3, 4])
        }
        return mobile
      })
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return

    const cardCount = Math.min(5, projects.length || 5)
    const cardWidth = 340
    const minOverlap = 24
    const minSpread = 120

    const updateSpread = () => {
      const containerWidth = stack.clientWidth
      if (!containerWidth) return
      const desired = (containerWidth - cardWidth) / Math.max(cardCount - 1, 1)
      const maxSpread = cardWidth - minOverlap
      const spread = Math.min(maxSpread, Math.max(minSpread, desired))
      stack.style.setProperty('--card-spread-base', `${spread}px`)
    }

    updateSpread()
    const resizeObserver = new ResizeObserver(updateSpread)
    resizeObserver.observe(stack)

    return () => resizeObserver.disconnect()
  }, [projects.length])

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return

    const cards = Array.from(stack.querySelectorAll('.work-card'))
    if (!cards.length) return

    const setHoverIndex = (index) => {
      stack.style.setProperty('--hover-index', String(index))
      stack.dataset.cardHover = 'true'
      if (!isMobile) setDesktopHoverIndex(index)
    }

    const clearHoverIndex = () => {
      stack.style.removeProperty('--hover-index')
      delete stack.dataset.cardHover
      if (!isMobile) setDesktopHoverIndex(null)
    }

    const handlers = cards.map((card) => {
      const index = Number(card.dataset.stackIndex ?? 0)
      const onEnter = () => setHoverIndex(index)
      const onLeave = (event) => {
        const nextCard = event.relatedTarget?.closest?.('.work-card')
        if (nextCard) return
        clearHoverIndex()
      }

      card.addEventListener('pointerenter', onEnter)
      card.addEventListener('pointerleave', onLeave)
      card.addEventListener('focus', onEnter)
      card.addEventListener('blur', onLeave)

      return { card, onEnter, onLeave }
    })

    return () => {
      handlers.forEach(({ card, onEnter, onLeave }) => {
        card.removeEventListener('pointerenter', onEnter)
        card.removeEventListener('pointerleave', onLeave)
        card.removeEventListener('focus', onEnter)
        card.removeEventListener('blur', onLeave)
      })
    }
  }, [projects.length, isMobile])

  const cycleStack = useCallback(() => {
    setCardOrder((prev) => {
      const next = [...prev]
      next.push(next.shift())
      return next
    })
  }, [])

  const swipingRef = useRef(false)

  const exitDurationMs = (dial.exit.spring.visualDuration || 0.4) * 1000

  const animatedCycle = useCallback(() => {
    if (swipingRef.current || dial.paused) return
    swipingRef.current = true
    setSwipingIndex(cardOrder[0])

    setTimeout(() => {
      cycleStack()
      requestAnimationFrame(() => {
        setSwipingIndex(null)
        swipingRef.current = false
      })
    }, exitDurationMs + 50)
  }, [cycleStack, cardOrder, exitDurationMs, dial.paused])

  animatedCycleRef.current = animatedCycle

  useEffect(() => {
    pausedRef.current = dial.paused
  }, [dial.paused])

  useEffect(() => {
    if (!isMobile) {
      clearInterval(autoSwipeTimerRef.current)
      return
    }

    const intervalMs = dial.timing.interval * 1000
    autoSwipeTimerRef.current = setInterval(() => {
      if (pausedRef.current) return
      animatedCycle()
    }, intervalMs)

    return () => clearInterval(autoSwipeTimerRef.current)
  }, [isMobile, animatedCycle, dial.timing.interval])

  const getMobileStackStyle = (orderPosition) => {
    if (!isMobile) return {}

    const rotations = [0, -2, 3, -1.5, 2]
    const scale = 1 - orderPosition * 0.02
    const zIndex = 10 - orderPosition
    const peekOffset = 8
    const translateX = orderPosition === 0 ? 0 : (orderPosition % 2 === 1 ? -1 : 1) * Math.ceil(orderPosition / 2) * peekOffset
    const translateY = orderPosition === 0 ? 0 : Math.ceil(orderPosition / 2) * 3

    return {
      '--mobile-scale': scale,
      '--mobile-translate-x': `${translateX}px`,
      '--mobile-translate-y': `${translateY}px`,
      '--mobile-rotate': `${rotations[orderPosition] || 0}deg`,
      '--mobile-z-index': zIndex,
    }
  }

  return (
    <section id="work" className="pt-0 pb-0 px-4 mt-0">
      <div className="max-w-7xl mx-auto">
        <div className={`work-stack ${isMobile ? 'work-stack--mobile' : ''}`} ref={stackRef}>
          {isMobile ? (
            cardOrder.map((originalIndex, orderPosition) => {
              const project = projects[originalIndex]
              if (!project) return null

              const enriched = enrichProject(project)
              const card = (
                <ProjectCard
                  project={enriched}
                  stackIndex={originalIndex}
                  isMobileStack={true}
                  shouldAutoplay={false}
                  onSelect={orderPosition === 0 ? handleSelect : undefined}
                />
              )

              const isSwiping = originalIndex === swipingIndex

              return (
                <div
                  key={project.id}
                  className={`work-card-mobile-wrapper ${orderPosition === 0 ? 'work-card-mobile-wrapper--top' : ''} ${isSwiping ? 'work-card-mobile-wrapper--swiping' : ''}`}
                  style={{
                    ...getMobileStackStyle(orderPosition),
                    '--swipe-x': `${dial.exit.travelDistance}vw`,
                    '--swipe-rotate': `${dial.exit.rotationZ}deg`,
                    '--swipe-scale': dial.exit.scaleOut,
                    '--exit-duration': `${(dial.exit.spring.visualDuration || 0.4) * 1000}ms`,
                    '--entrance-duration': `${(dial.entrance.spring.visualDuration || 0.35) * 1000}ms`,
                    '--entrance-delay': `${(dial.entrance.delay || 0) * 1000}ms`,
                  }}
                >
                  {card}
                </div>
              )
            })
          ) : (
            projects.slice(0, 5).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={enrichProject(project)}
                stackIndex={index}
                shouldAutoplay={index === desktopHoverIndex}
                onSelect={handleSelect}
              />
            ))
          )}
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
