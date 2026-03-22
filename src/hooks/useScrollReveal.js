import { useEffect, useRef } from 'react'

export default function useScrollReveal({
  target = ':scope > *',
  y = 40,
  duration = 0.8,
  stagger = 0.12,
  start = 0.85,
} = {}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll(target))
    if (!elements.length) return

    elements.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = `translateY(${y}px)`
      el.style.transition = `opacity ${duration}s cubic-bezier(0.22,0.61,0.36,1), transform ${duration}s cubic-bezier(0.22,0.61,0.36,1)`
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          const idx = elements.indexOf(el)
          const delay = idx >= 0 ? idx * stagger : 0
          el.style.transitionDelay = `${delay}s`
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.unobserve(el)
        })
      },
      { threshold: 0, rootMargin: `0px 0px -${Math.round((1 - start) * 100)}% 0px` }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [target, y, duration, stagger, start])

  return containerRef
}
