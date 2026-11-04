import { useCallback, useEffect, useRef, useState } from 'react'
import WorkBar from '../../components/work-first/WorkBar'
import WorkFooter from '../../components/work-first/WorkFooter'
import WorkMedia from '../../components/work-first/WorkMedia'
import WorkShell from '../../components/work-first/WorkShell'
import { pad, useWorkPreview, useWorkProjects, yearOf } from '../../components/work-first/workFirst'

const DRAG_THRESHOLD = 6

function GalleryCard({ project, index, onOpen }) {
  const ref = useRef(null)
  return (
    <li className="wf-gallery-item" style={{ '--i': index }}>
      <button
        type="button"
        ref={ref}
        className="wf-gallery-card"
        onClick={() => onOpen(project, ref.current)}
        aria-label={`Open ${project.title}, ${project.company}`}
        data-hoverable
        draggable={false}
      >
        <WorkMedia
          project={project}
          sizes="(min-width: 1024px) 34vw, 80vw"
          priority={index < 3}
          className="wf-gallery-media"
        />
        <span className="wf-gallery-caption">
          <span className="wf-gallery-index">{pad(index)}</span>
          <span className="wf-gallery-title">{project.title}</span>
          <span className="wf-gallery-meta">{project.company} · {yearOf(project)}</span>
          <span className="wf-gallery-tags">{project.highlights.slice(0, 2).join(' / ')}</span>
        </span>
      </button>
    </li>
  )
}

function GalleryHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()
  const trackRef = useRef(null)
  const barRef = useRef(null)
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)
  const [edges, setEdges] = useState({ start: true, end: false })

  const sync = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    const ratio = max > 0 ? track.scrollLeft / max : 0
    barRef.current?.style.setProperty('--progress', String(ratio))
    setEdges((prev) => {
      const next = { start: track.scrollLeft < 4, end: max - track.scrollLeft < 4 }
      return prev.start === next.start && prev.end === next.end ? prev : next
    })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    sync()
    // Nothing else scrolls on this page, so the wheel drives the gallery until it hits an end
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const max = track.scrollWidth - track.clientWidth
      const next = track.scrollLeft + event.deltaY
      if (next < 0 && track.scrollLeft <= 0) return
      if (next > max && track.scrollLeft >= max) return
      event.preventDefault()
      track.scrollLeft = next
    }
    track.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', sync)
    return () => {
      track.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  const step = (direction) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.wf-gallery-item')
    const distance = (card?.offsetWidth ?? 360) + 24
    track.scrollBy({ left: direction * distance, behavior: 'smooth' })
  }

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    dragRef.current = { x: event.clientX, left: trackRef.current.scrollLeft, moved: false }
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = event.clientX - drag.x
    if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.moved = true
      trackRef.current.setAttribute('data-dragging', '')
      trackRef.current.setPointerCapture(event.pointerId)
    }
    if (drag.moved) trackRef.current.scrollLeft = drag.left - dx
  }

  const endDrag = (event) => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag?.moved) return
    suppressClickRef.current = true
    requestAnimationFrame(() => { suppressClickRef.current = false })
    trackRef.current.removeAttribute('data-dragging')
    trackRef.current.releasePointerCapture?.(event.pointerId)
  }

  const handleOpen = (project, element) => {
    if (suppressClickRef.current) return
    open(project, element)
  }

  return (
    <WorkShell layout="gallery" selected={selected} onClose={close}>
      <WorkBar />
      <main id="work" className="wf-gallery" aria-label="Selected work">
        <div className="wf-gallery-head">
          <h2 className="wf-display wf-gallery-heading">
            Selected work <span className="wf-gallery-count">({String(projects.length).padStart(2, '0')})</span>
          </h2>
          <div className="wf-gallery-controls">
            <button
              type="button"
              className="wf-round"
              onClick={() => step(-1)}
              disabled={edges.start}
              aria-label="Previous projects"
              data-hoverable
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className="wf-round"
              onClick={() => step(1)}
              disabled={edges.end}
              aria-label="Next projects"
              data-hoverable
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <ol
          className="wf-gallery-track"
          ref={trackRef}
          onScroll={sync}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          tabIndex={0}
          aria-label="Projects, scroll horizontally"
        >
          {projects.map((project, index) => (
            <GalleryCard key={project.id} project={project} index={index} onOpen={handleOpen} />
          ))}
        </ol>
        <div className="wf-gallery-progress" ref={barRef} aria-hidden="true">
          <span />
        </div>
      </main>
      <WorkFooter mobileOnly />
    </WorkShell>
  )
}

export default GalleryHome
