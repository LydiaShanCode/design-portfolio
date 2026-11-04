import { useRef } from 'react'
import WorkBar from './WorkBar'
import WorkFooter from './WorkFooter'
import WorkMedia from './WorkMedia'
import WorkShell from './WorkShell'
import { WORK_TAGLINE, pad, useWorkPreview, useWorkProjects, yearOf } from './workFirst'

function WallCard({ project, index, onOpen }) {
  const ref = useRef(null)
  return (
    <li className="wf-wall-item" style={{ '--i': index }}>
      <button
        type="button"
        ref={ref}
        className="wf-wall-card"
        onClick={() => onOpen(project, ref.current)}
        aria-label={`Open ${project.title}, ${project.company}`}
        data-hoverable
      >
        <WorkMedia
          project={project}
          sizes="(min-width: 1024px) 40vw, 100vw"
          priority={index < 2}
          className="wf-wall-media"
        />
        <span className="wf-wall-caption">
          <span className="wf-wall-title">
            <span className="wf-wall-index">{pad(index)}</span>
            {project.title}
          </span>
          <span className="wf-wall-meta">{project.company} · {yearOf(project)}</span>
          <span className="wf-tags">
            {project.highlights.slice(0, 2).map((item) => (
              <span key={item} className="wf-tag">{item}</span>
            ))}
          </span>
        </span>
      </button>
    </li>
  )
}

function WallHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()

  return (
    <WorkShell layout="wall" selected={selected} onClose={close}>
      <div className="wf-wall">
        <aside className="wf-wall-rail">
          <WorkBar layout="rail" tagline={WORK_TAGLINE} />
        </aside>
        <main id="work" className="wf-wall-field" aria-label="Selected work">
          <ol className="wf-wall-grid">
            {projects.map((project, index) => (
              <WallCard key={project.id} project={project} index={index} onOpen={open} />
            ))}
          </ol>
        </main>
      </div>
      <WorkFooter mobileOnly />
    </WorkShell>
  )
}

export default WallHome
