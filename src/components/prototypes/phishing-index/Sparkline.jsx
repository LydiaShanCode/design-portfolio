import { useEffect, useMemo, useRef, useState } from 'react'

const SAMPLE_COUNT = 160

function Sparkline({ path, width, height, baselineY, format, className = '' }) {
  const pathRef = useRef(null)
  const [samples, setSamples] = useState([])
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const node = pathRef.current
    if (!node) return
    const total = node.getTotalLength()
    const next = []
    for (let i = 0; i <= SAMPLE_COUNT; i += 1) {
      const point = node.getPointAtLength((total * i) / SAMPLE_COUNT)
      next.push({ x: point.x, y: point.y })
    }
    setSamples(next)
  }, [path])

  const onPointerMove = (event) => {
    if (!samples.length) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const targetX = ratio * width
    let low = 0
    let high = samples.length - 1
    while (low < high) {
      const mid = (low + high) >> 1
      if (samples[mid].x < targetX) low = mid + 1
      else high = mid
    }
    const point = samples[low]
    setHover({ left: (point.x / width) * 100, top: (point.y / height) * 100, label: format(point.x / width, point.y) })
  }

  const viewBox = useMemo(() => `0 0 ${width} ${height}`, [width, height])

  return (
    <div
      className={`pi-sparkline ${className}`.trim()}
      style={{ height }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {baselineY != null && (
          <line
            className="pi-sparkline__baseline"
            x1="0"
            x2={width}
            y1={baselineY}
            y2={baselineY}
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path ref={pathRef} className="pi-sparkline__line" d={path} vectorEffect="non-scaling-stroke" />
      </svg>
      {hover && (
        <>
          <span className="pi-sparkline__dot" style={{ left: `${hover.left}%`, top: `${hover.top}%` }} />
          <span
            className={`pi-sparkline__tip${hover.left > 70 ? ' pi-sparkline__tip--flip' : ''}${hover.top < 45 ? ' pi-sparkline__tip--below' : ''}`}
            style={{ left: `${hover.left}%`, top: `${hover.top}%` }}
          >
            {hover.label}
          </span>
        </>
      )}
    </div>
  )
}

export default Sparkline
