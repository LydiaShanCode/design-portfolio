import { useEffect, useRef, useState } from 'react'
import WorkBar from '../../components/work-first/WorkBar'
import WorkFooter from '../../components/work-first/WorkFooter'
import WorkMedia from '../../components/work-first/WorkMedia'
import WorkShell from '../../components/work-first/WorkShell'
import { pad, useMediaQuery, useWorkPreview, useWorkProjects, yearOf } from '../../components/work-first/workFirst'

const INTENT_MS = 90

function Strip({ project, index, active, accordion, onActivate, onOpen }) {
  const ref = useRef(null)
  return (
    <li className={`wf-strip${active ? ' wf-strip--active' : ''}`} style={{ '--i': index }}>
      <button
        type="button"
        ref={ref}
        className="wf-strip-button"
        onClick={() => onOpen(project, ref.current)}
        onFocus={() => onActivate(index, true)}
        onPointerEnter={(event) => event.pointerType === 'mouse' && onActivate(index)}
        aria-label={`Open ${project.title}, ${project.company}`}
        data-hoverable
      >
        <WorkMedia
          project={project}
          variant={accordion ? 'hero' : 'card'}
          playing={accordion ? active : undefined}
          preload={accordion ? (active ? 'auto' : 'none') : undefined}
          sizes="(min-width: 1024px) 90vw, 100vw"
          priority={index === 0}
          className="wf-strip-media"
        />
        <span className="wf-strip-shade" aria-hidden="true" />
        <span className="wf-strip-head">
          <span className="wf-strip-index">{pad(index)}</span>
          <span className="wf-strip-title">{project.title}</span>
          <span className="wf-strip-meta">{project.company} · {yearOf(project)}</span>
        </span>
        <span className="wf-strip-detail">
          <span className="wf-tags wf-tags--glass">
            {project.highlights.slice(0, 3).map((item) => (
              <span key={item} className="wf-tag">{item}</span>
            ))}
          </span>
          <span className="wf-cta wf-cta--glass" aria-hidden="true">
            View case study
            <span className="wf-cta-arrow">→</span>
          </span>
        </span>
      </button>
    </li>
  )
}

function StripsHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()
  const accordion = useMediaQuery('(min-width: 1024px) and (hover: hover)')
  const [active, setActive] = useState(0)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const activate = (index, immediate = false) => {
    clearTimeout(timer.current)
    if (immediate) setActive(index)
    else timer.current = setTimeout(() => setActive(index), INTENT_MS)
  }

  return (
    <WorkShell layout="strips" selected={selected} onClose={close}>
      <WorkBar />
      <main id="work" className={`wf-strips${accordion ? ' wf-strips--accordion' : ''}`} aria-label="Selected work">
        <ol className="wf-strips-list" onPointerLeave={() => clearTimeout(timer.current)}>
          {projects.map((project, index) => (
            <Strip
              key={project.id}
              project={project}
              index={index}
              active={index === active}
              accordion={accordion}
              onActivate={activate}
              onOpen={open}
            />
          ))}
        </ol>
      </main>
      <WorkFooter mobileOnly />
    </WorkShell>
  )
}

export default StripsHome
