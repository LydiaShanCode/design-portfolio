import { useEffect, useRef } from 'react'

const RINGS = [
  { delay: 0, duration: 1100, maxRadius: 64, opacity: 0.35 },
  { delay: 160, duration: 1000, maxRadius: 40, opacity: 0.22 },
]

const easeOutCubic = (t) => 1 - (1 - t) ** 3

function WaterCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    const ripples = []
    let frameId = 0
    let dpr = 1

    const resizeCanvas = () => {
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Only runs while a ripple is on screen, so the canvas costs nothing at rest.
    const draw = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i]
        let alive = false

        for (const ring of RINGS) {
          const t = (now - ripple.start - ring.delay) / ring.duration
          if (t >= 1) continue
          alive = true
          if (t <= 0) continue

          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ring.maxRadius * easeOutCubic(t), 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0, 29, 217, ${ring.opacity * (1 - t) ** 2})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        if (!alive) ripples.splice(i, 1)
      }

      frameId = ripples.length ? requestAnimationFrame(draw) : 0
    }

    const handleClick = (e) => {
      // Keyboard-activated clicks report detail 0 and sit at (0, 0)
      if (e.detail === 0) return
      ripples.push({ x: e.clientX, y: e.clientY, start: performance.now() })
      if (!frameId) frameId = requestAnimationFrame(draw)
    }

    window.addEventListener('click', handleClick, { passive: true })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('click', handleClick)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="water-canvas" aria-hidden="true" />
}

export default WaterCanvas
