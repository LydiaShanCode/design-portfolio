import { useMemo, useRef } from 'react'
import WorkMedia from './WorkMedia'
import { isPortrait, yearOf } from './workFirst'

function BentoCard({ project, role, index, state, onOpen }) {
  const ref = useRef(null)
  return (
    <li
      className={`wf-bento-item wf-bento-item--${role}${state ? ` wf-bento-item--${state}` : ''}`}
      style={{ '--i': index }}
      data-slug={project.slug}
    >
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

/** `focus` is a list of slugs to pick out; everything else steps back. */
function BentoGrid({ projects, onOpen, focus = [] }) {
  const tiles = useMemo(() => arrange(projects), [projects])
  return (
    <ul className="wf-bento-grid">
      {tiles.map(({ project, role }, index) => (
        <BentoCard
          key={project.id}
          project={project}
          role={role}
          index={index}
          state={focus.length ? (focus.includes(project.slug) ? 'focus' : 'dim') : null}
          onOpen={onOpen}
        />
      ))}
    </ul>
  )
}

export default BentoGrid
