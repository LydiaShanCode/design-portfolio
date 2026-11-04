import { useEffect, useRef, useState } from 'react'
import WorkBar from '../../components/work-first/WorkBar'
import WorkFooter from '../../components/work-first/WorkFooter'
import WorkMedia from '../../components/work-first/WorkMedia'
import WorkShell from '../../components/work-first/WorkShell'
import { pad, useWorkPreview, useWorkProjects, yearOf } from '../../components/work-first/workFirst'

function Scene({ project, index, onOpen, register }) {
  const mediaRef = useRef(null)
  return (
    <section
      className="wf-scene"
      id={`scene-${project.slug}`}
      aria-label={project.title}
      ref={register}
    >
      <button
        type="button"
        ref={mediaRef}
        className="wf-scene-media"
        onClick={() => onOpen(project, mediaRef.current)}
        aria-label={`Open ${project.title}, ${project.company}`}
        data-hoverable
      >
        <WorkMedia
          project={project}
          variant="hero"
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority={index === 0}
        />
      </button>
      <div className="wf-scene-text">
        <span className="wf-scene-index" aria-hidden="true">{pad(index)}</span>
        <p className="wf-eyebrow">
          {project.company} <span aria-hidden="true">·</span> {yearOf(project)}
        </p>
        <h2 className="wf-display">{project.title}</h2>
        <ul className="wf-tags" aria-label="Highlights">
          {project.highlights.slice(0, 4).map((item) => (
            <li key={item} className="wf-tag">{item}</li>
          ))}
        </ul>
        <button type="button" className="wf-cta" onClick={() => onOpen(project, mediaRef.current)} data-hoverable>
          View case study
          <span aria-hidden="true" className="wf-cta-arrow">→</span>
        </button>
      </div>
    </section>
  )
}

function ScenesHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()
  const [active, setActive] = useState(0)
  const sceneRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(sceneRefs.current.indexOf(entry.target))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    sceneRefs.current.forEach((node) => node && observer.observe(node))

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('wf-scene--in')
          reveal.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    sceneRefs.current.forEach((node) => node && reveal.observe(node))
    return () => {
      observer.disconnect()
      reveal.disconnect()
    }
  }, [projects.length])

  return (
    <WorkShell layout="scenes" selected={selected} onClose={close}>
      <WorkBar />
      <div className="wf-scenes">
        <nav className="wf-scenes-index" aria-label="Projects">
          <ol>
            {projects.map((project, index) => (
              <li key={project.id}>
                <a
                  href={`#scene-${project.slug}`}
                  className={`wf-scenes-tick${index === active ? ' wf-scenes-tick--active' : ''}`}
                  aria-label={project.title}
                  aria-current={index === active}
                  data-hoverable
                  onClick={(event) => {
                    event.preventDefault()
                    sceneRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  <span className="wf-scenes-tick-number">{pad(index)}</span>
                  <span className="wf-scenes-tick-label">{project.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <main id="work" className="wf-scenes-list">
          {projects.map((project, index) => (
            <Scene
              key={project.id}
              project={project}
              index={index}
              onOpen={open}
              register={(node) => { sceneRefs.current[index] = node }}
            />
          ))}
        </main>
      </div>
      <WorkFooter />
    </WorkShell>
  )
}

export default ScenesHome
