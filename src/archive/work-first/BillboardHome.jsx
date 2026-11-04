import { useEffect, useRef, useState } from 'react'
import WorkBar from '../../components/work-first/WorkBar'
import WorkFooter from '../../components/work-first/WorkFooter'
import WorkMedia from '../../components/work-first/WorkMedia'
import WorkShell from '../../components/work-first/WorkShell'
import { pad, useWorkPreview, useWorkProjects, yearOf } from '../../components/work-first/workFirst'

const ROTATE_MS = 7000

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function BillboardHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()
  const [active, setActive] = useState(0)
  const [rotating, setRotating] = useState(() => !prefersReducedMotion())
  const [paused, setPaused] = useState(false)
  const progressRef = useRef(null)
  const stageRef = useRef(null)
  const current = projects[active]

  useEffect(() => {
    const bar = progressRef.current
    if (!rotating || paused || selected) {
      bar?.style.setProperty('--progress', '0')
      return undefined
    }
    let frame = 0
    let last = performance.now()
    let elapsed = 0
    const tick = (now) => {
      if (!document.hidden) elapsed += now - last
      last = now
      bar?.style.setProperty('--progress', String(Math.min(elapsed / ROTATE_MS, 1)))
      if (elapsed >= ROTATE_MS) {
        setActive((index) => (index + 1) % projects.length)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, rotating, paused, selected, projects.length])

  const choose = (index) => {
    setRotating(false)
    setActive(index)
  }

  return (
    <WorkShell layout="billboard" selected={selected} onClose={close}>
      <WorkBar />
      <main id="work" className="wf-billboard">
        <section
          className="wf-billboard-main"
          aria-label={`Featured project: ${current.title}`}
          onPointerEnter={(event) => event.pointerType === 'mouse' && setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          <button
            type="button"
            ref={stageRef}
            className="wf-billboard-stage"
            onClick={() => open(current, stageRef.current)}
            aria-label={`Open ${current.title}, ${current.company}`}
            data-hoverable
          >
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`wf-billboard-slide${index === active ? ' wf-billboard-slide--active' : ''}`}
                aria-hidden={index !== active}
              >
                <WorkMedia
                  project={project}
                  variant="hero"
                  playing={index === active}
                  preload={index === active ? 'auto' : 'none'}
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </button>
          <div className="wf-billboard-caption" key={current.id}>
            <div className="wf-billboard-heading">
              <p className="wf-eyebrow">
                {current.company} <span aria-hidden="true">·</span> {yearOf(current)}
              </p>
              <h2 className="wf-display">{current.title}</h2>
            </div>
            <ul className="wf-tags" aria-label="Highlights">
              {current.highlights.slice(0, 3).map((item) => (
                <li key={item} className="wf-tag">{item}</li>
              ))}
            </ul>
            <button
              type="button"
              className="wf-cta"
              onClick={() => open(current, stageRef.current)}
              data-hoverable
            >
              View case study
              <span aria-hidden="true" className="wf-cta-arrow">→</span>
            </button>
          </div>
        </section>

        <ol
          className="wf-shelf"
          aria-label="Selected work"
          onPointerEnter={(event) => event.pointerType === 'mouse' && setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {projects.map((project, index) => (
            <li key={project.id} className="wf-shelf-entry">
              <button
                type="button"
                className={`wf-shelf-item${index === active ? ' wf-shelf-item--active' : ''}`}
                onClick={() => choose(index)}
                onPointerEnter={(event) => event.pointerType === 'mouse' && choose(index)}
                aria-current={index === active}
                data-hoverable
              >
                <WorkMedia project={project} still sizes="160px" className="wf-shelf-thumb" />
                <span className="wf-shelf-text">
                  <span className="wf-shelf-index">{pad(index)}</span>
                  <span className="wf-shelf-title">{project.title}</span>
                  <span className="wf-shelf-meta">{project.company} · {yearOf(project)}</span>
                </span>
                {index === active ? (
                  <span className="wf-shelf-progress" ref={progressRef} aria-hidden="true" />
                ) : null}
              </button>
            </li>
          ))}
        </ol>
      </main>
      <WorkFooter mobileOnly />
    </WorkShell>
  )
}

export default BillboardHome
