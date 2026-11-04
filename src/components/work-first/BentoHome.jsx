import { useMemo, useRef } from 'react'
import WorkBar from './WorkBar'
import WorkFooter from './WorkFooter'
import WorkMedia from './WorkMedia'
import WorkShell from './WorkShell'
import { WORK_TAGLINE, isPortrait, useWorkPreview, useWorkProjects, yearOf } from './workFirst'

function BentoCard({ project, role, index, onOpen }) {
  const ref = useRef(null)
  return (
    <li className={`wf-bento-item wf-bento-item--${role}`} style={{ '--i': index }}>
      <button
        type="button"
        ref={ref}
        className="wf-bento-card"
        onClick={() => onOpen(project, ref.current)}
        aria-label={`Open ${project.title}, ${project.company}`}
        data-hoverable
      >
        <WorkMedia
          project={project}
          variant={role === 'lead' ? 'hero' : 'card'}
          sizes={role === 'lead' ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
          priority={index < 2}
          className="wf-bento-media"
        />
        <span className="wf-bento-label">
          <span className="wf-bento-title">{project.title}</span>
          <span className="wf-bento-meta">{project.company}</span>
        </span>
        <span className="wf-bento-year" aria-hidden="true">{yearOf(project)}</span>
      </button>
    </li>
  )
}

/** The lead lands beside the portrait project so the tall cell is never cropped to a landscape box. */
function arrange(projects) {
  const tallIndex = projects.findIndex(isPortrait)
  const tall = projects[tallIndex === -1 ? 1 : tallIndex]
  const lead = projects.find((project) => project !== tall && !isPortrait(project)) ?? projects[0]
  const rest = projects.filter((project) => project !== lead && project !== tall)
  return [
    { project: lead, role: 'lead' },
    { project: tall, role: 'tall' },
    ...rest.map((project) => ({ project, role: 'small' })),
  ]
}

function BentoHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()
  const tiles = useMemo(() => arrange(projects), [projects])

  return (
    <WorkShell layout="bento" selected={selected} onClose={close}>
      <WorkBar />
      <main id="work" className="wf-bento" aria-label="Selected work">
        <p className="wf-bento-intro">{WORK_TAGLINE}</p>
        <ul className="wf-bento-grid">
          {tiles.map(({ project, role }, index) => (
            <BentoCard key={project.id} project={project} role={role} index={index} onOpen={open} />
          ))}
        </ul>
      </main>
      <WorkFooter />
    </WorkShell>
  )
}

export default BentoHome
