import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import ProjectCard from './ProjectCard'
import ProjectPreview from './ProjectPreview'
import projectsFromMd from '../data/projectLoader'
import designSystemImage from '../assets/card image - design system.svg'
import flowOfFundsImage from '../assets/Card image - flow of funds.svg'
import shopPayExperimentsImage from '../assets/card image - shop pay experiments.svg'
import tdInventoryImage from '../assets/card image - TD inventory management.svg'
import internationalCommerceImage from '../assets/card-image-international commerce.svg'
import currentRibbon from '../assets/current ribbon.svg'
import shopifyIcon from '../assets/shopify-icon.svg'
import searchEyeIcon from '../assets/searcheye icon.svg'
import tdIcon from '../assets/td icon.svg'
import flowOfFundsVideo from '../assets/projects/payouts-uplift/payouts uplift final video.MP4'

function SwipeCard({ children, onSwipe, onTap }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  const dragStartRef = useRef(null)

  const handleDragStart = (_, info) => {
    dragStartRef.current = { x: info.point.x, y: info.point.y }
  }

  const handleDragEnd = (_, info) => {
    const offsetThreshold = 100
    const velocityThreshold = 500
    if (Math.abs(info.offset.x) > offsetThreshold || Math.abs(info.velocity.x) > velocityThreshold) {
      const exitX = info.offset.x > 0 ? 400 : -400
      animate(x, exitX, { duration: 0.3 }).then(() => onSwipe())
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
      if (dragStartRef.current) {
        const dx = Math.abs(info.point.x - dragStartRef.current.x)
        const dy = Math.abs(info.point.y - dragStartRef.current.y)
        if (dx < 5 && dy < 5 && onTap) onTap()
      }
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      style={{ x, rotate, opacity }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  )
}

function ProjectsGrid() {
  const [projects, setProjects] = useState([])
  const [cardOrder, setCardOrder] = useState([0, 1, 2, 3, 4])
  const [isMobile, setIsMobile] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [cardRect, setCardRect] = useState(null)
  const stackRef = useRef(null)

  const imageAssets = {
    designSystem: designSystemImage,
    flowOfFunds: flowOfFundsImage,
    shopPayExperiments: shopPayExperimentsImage,
    tdInventory: tdInventoryImage,
    internationalCommerce: internationalCommerceImage,
  }

  const videoAssets = {
    flowOfFunds: flowOfFundsVideo,
  }

  const ribbonAssets = {
    current: currentRibbon,
  }

  const iconAssets = {
    shopify: shopifyIcon,
    searchEye: searchEyeIcon,
    td: tdIcon,
  }

  const enrichProject = (project) => ({
    ...project,
    image: imageAssets[project.imageKey],
    ribbon: ribbonAssets[project.ribbonKey],
    icon: iconAssets[project.iconKey],
    video: videoAssets[project.videoKey] || null,
  })

  const handleSelect = useCallback((project, rect) => {
    setCardRect(rect)
    setSelectedProject(project)
  }, [])

  const handleClosePreview = useCallback(() => {
    setSelectedProject(null)
    setCardRect(null)
  }, [])

  useEffect(() => {
    setProjects(projectsFromMd)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640)
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
    }

    const clearHoverIndex = () => {
      stack.style.removeProperty('--hover-index')
      delete stack.dataset.cardHover
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
  }, [projects.length])

  const cycleStack = useCallback(() => {
    setCardOrder((prev) => {
      const next = [...prev]
      next.push(next.shift())
      return next
    })
  }, [])

  const getMobileStackStyle = (orderPosition) => {
    if (!isMobile) return {}

    const rotations = [0, -3, 4, -2, 3]
    const scale = 1 - orderPosition * 0.03
    const zIndex = 10 - orderPosition
    const peekOffset = 12
    const translateX = orderPosition === 0 ? 0 : (orderPosition % 2 === 1 ? -1 : 1) * Math.ceil(orderPosition / 2) * peekOffset
    const translateY = orderPosition === 0 ? 0 : Math.ceil(orderPosition / 2) * 4

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
                  onSelect={orderPosition === 0 ? handleSelect : undefined}
                />
              )

              return (
                <div
                  key={project.id}
                  className={`work-card-mobile-wrapper ${orderPosition === 0 ? 'work-card-mobile-wrapper--top' : ''}`}
                  style={getMobileStackStyle(orderPosition)}
                >
                  {orderPosition === 0 ? (
                    <SwipeCard
                      onSwipe={cycleStack}
                      onTap={() => handleSelect(enriched, null)}
                    >
                      {card}
                    </SwipeCard>
                  ) : (
                    card
                  )}
                </div>
              )
            })
          ) : (
            projects.slice(0, 5).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={enrichProject(project)}
                stackIndex={index}
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
