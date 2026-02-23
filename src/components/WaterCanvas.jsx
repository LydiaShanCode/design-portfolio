import { useEffect, useRef } from 'react'

function WaterCanvas() {
  const canvasRef = useRef(null)
  const ripplesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Ripple class
    class Ripple {
      constructor(x, y) {
        this.x = x
        this.y = y
        this.radius = 0
        this.maxRadius = 100
        this.opacity = 0.4
        this.speed = 2
      }

      update() {
        this.radius += this.speed
        this.opacity = Math.max(0, this.opacity - 0.02)
        return this.radius < this.maxRadius && this.opacity > 0
      }

      draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(100, 150, 255, ${this.opacity})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        const isActive = ripple.update()
        if (isActive) {
          ripple.draw(ctx)
        }
        return isActive
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Mouse move handler - create ripples on movement
    let lastMouseX = null
    let lastMouseY = null
    let mouseMoveTimeout = null

    const handleMouseMove = (e) => {
      const currentX = e.clientX
      const currentY = e.clientY

      // Throttle ripple creation on mouse move
      if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout)
      }

      mouseMoveTimeout = setTimeout(() => {
        if (lastMouseX !== null && lastMouseY !== null) {
          const distance = Math.sqrt(
            Math.pow(currentX - lastMouseX, 2) + Math.pow(currentY - lastMouseY, 2)
          )

          // Create ripple if mouse moved significantly
          if (distance > 30) {
            ripplesRef.current.push(new Ripple(currentX, currentY))
            lastMouseX = currentX
            lastMouseY = currentY
          }
        } else {
          lastMouseX = currentX
          lastMouseY = currentY
        }
      }, 100)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="water-canvas" />
}

export default WaterCanvas
