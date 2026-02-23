import { useEffect, useRef, useState, useCallback } from 'react'
import ProjectCard from './ProjectCard'
import projectsData from '../data/projects.json'
import designSystemImage from '../assets/card image - design system.svg'
import flowOfFundsImage from '../assets/Card image - flow of funds.svg'
import shopPayExperimentsImage from '../assets/card image - shop pay experiments.svg'
import tdInventoryImage from '../assets/card image - TD inventory management.svg'
import internationalCommerceImage from '../assets/card-image-international commerce.svg'
import currentRibbon from '../assets/current ribbon.svg'
import shopifyIcon from '../assets/shopify-icon.svg'
import searchEyeIcon from '../assets/searcheye icon.svg'
import tdIcon from '../assets/td icon.svg'

function ProjectsGrid() {
  const [projects, setProjects] = useState([])
  const [cardOrder, setCardOrder] = useState([0, 1, 2, 3, 4])
  const [swipeState, setSwipeState] = useState({ isDragging: false, startX: 0, currentX: 0, cardIndex: null })
  const [swipingCard, setSwipingCard] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const stackRef = useRef(null)

  const imageAssets = {
    designSystem: designSystemImage,
    flowOfFunds: flowOfFundsImage,
    shopPayExperiments: shopPayExperimentsImage,
    tdInventory: tdInventoryImage,
    internationalCommerce: internationalCommerceImage,
  }

  const ribbonAssets = {
    current: currentRibbon,
  }

  const iconAssets = {
    shopify: shopifyIcon,
    searchEye: searchEyeIcon,
    td: tdIcon,
  }

  useEffect(() => {
    setProjects(projectsData.projects)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSwipeStart = useCallback((e, cardIndex) => {
    if (!isMobile) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    setSwipeState({
      isDragging: true,
      startX: clientX,
      currentX: clientX,
      cardIndex,
    })
  }, [isMobile])

  const handleSwipeMove = useCallback((e) => {
    if (!swipeState.isDragging || !isMobile) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    setSwipeState((prev) => ({ ...prev, currentX: clientX }))
  }, [swipeState.isDragging, isMobile])

  const handleSwipeEnd = useCallback(() => {
    if (!swipeState.isDragging || !isMobile) return
    
    const deltaX = swipeState.currentX - swipeState.startX
    const threshold = 80
    
    if (Math.abs(deltaX) > threshold) {
      const direction = deltaX > 0 ? 'right' : 'left'
      setSwipingCard({ index: swipeState.cardIndex, direction })
      
      setTimeout(() => {
        setCardOrder((prev) => {
          const newOrder = [...prev]
          const firstCard = newOrder.shift()
          newOrder.push(firstCard)
          return newOrder
        })
        setSwipingCard(null)
      }, 300)
    }
    
    setSwipeState({ isDragging: false, startX: 0, currentX: 0, cardIndex: null })
  }, [swipeState, isMobile])

  useEffect(() => {
    if (!isMobile) return
    
    window.addEventListener('mousemove', handleSwipeMove)
    window.addEventListener('mouseup', handleSwipeEnd)
    window.addEventListener('touchmove', handleSwipeMove, { passive: true })
    window.addEventListener('touchend', handleSwipeEnd)
    
    return () => {
      window.removeEventListener('mousemove', handleSwipeMove)
      window.removeEventListener('mouseup', handleSwipeEnd)
      window.removeEventListener('touchmove', handleSwipeMove)
      window.removeEventListener('touchend', handleSwipeEnd)
    }
  }, [isMobile, handleSwipeMove, handleSwipeEnd])

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

  const getSwipeTransform = (orderPosition) => {
    if (!isMobile) return {}
    
    if (swipeState.isDragging && orderPosition === 0) {
      const deltaX = swipeState.currentX - swipeState.startX
      const rotation = deltaX * 0.05
      return {
        transform: `translateX(${deltaX}px) rotate(${rotation}deg)`,
        transition: 'none',
      }
    }
    
    if (swipingCard && orderPosition === 0) {
      const exitX = swipingCard.direction === 'right' ? 400 : -400
      return {
        transform: `translateX(${exitX}px) rotate(${swipingCard.direction === 'right' ? 20 : -20}deg)`,
        opacity: 0,
        transition: 'transform 300ms ease-out, opacity 300ms ease-out',
      }
    }
    
    return {}
  }

  const getMobileStackStyle = (orderPosition) => {
    if (!isMobile) return {}
    
    const scale = 1 - orderPosition * 0.04
    const translateY = orderPosition * 12
    const zIndex = 10 - orderPosition
    
    return {
      '--mobile-scale': scale,
      '--mobile-translate-y': `${translateY}px`,
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
              
              return (
                <div
                  key={project.id}
                  className={`work-card-mobile-wrapper ${orderPosition === 0 ? 'work-card-mobile-wrapper--top' : ''}`}
                  style={{
                    ...getMobileStackStyle(orderPosition),
                    ...getSwipeTransform(orderPosition),
                  }}
                  onMouseDown={(e) => orderPosition === 0 && handleSwipeStart(e, originalIndex)}
                  onTouchStart={(e) => orderPosition === 0 && handleSwipeStart(e, originalIndex)}
                >
                  <ProjectCard
                    project={{
                      ...project,
                      image: imageAssets[project.imageKey],
                      ribbon: ribbonAssets[project.ribbonKey],
                      icon: iconAssets[project.iconKey],
                    }}
                    stackIndex={originalIndex}
                    isMobileStack={true}
                  />
                </div>
              )
            })
          ) : (
            projects.slice(0, 5).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  image: imageAssets[project.imageKey],
                  ribbon: ribbonAssets[project.ribbonKey],
                  icon: iconAssets[project.iconKey],
                }}
                stackIndex={index}
              />
            ))
          )}
        </div>
        {isMobile && (
          <>
            <div className="work-stack-hint">
              <span className="work-stack-hint-arrow">←</span>
              <span>Swipe to explore</span>
              <span className="work-stack-hint-arrow">→</span>
            </div>
            <div className="work-stack-dots">
              {cardOrder.map((originalIndex, i) => (
                <span
                  key={originalIndex}
                  className={`work-stack-dot ${i === 0 ? 'work-stack-dot--active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default ProjectsGrid
