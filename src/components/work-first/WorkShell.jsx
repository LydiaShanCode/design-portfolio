import { Link } from 'react-router-dom'
import ProjectPreview from '../ProjectPreview'
import { WORK_LINKS } from './workFirst'

/**
 * Wraps a work-first layout: scopes its styles, adds the bottom-reachable dock on small
 * screens, and hosts the project preview the cards open into.
 */
function WorkShell({ layout, chatOpen = false, selected, onClose, children }) {
  return (
    <div className={`wf-home wf-home--${layout}${chatOpen ? ' wf-home--chat-open' : ''}`}>
      {children}
      <nav className="wf-dock" aria-label="Quick links">
        {WORK_LINKS.map(({ label, to }) => (
          <Link key={label} to={to} className="wf-dock-link" data-hoverable>{label}</Link>
        ))}
        <a href="mailto:lydiashan.c@gmail.com" className="wf-dock-link wf-dock-link--accent" data-hoverable>
          Email
        </a>
      </nav>
      {selected ? (
        <ProjectPreview project={selected.project} cardRect={selected.rect} originNode={null} onClose={onClose} />
      ) : null}
    </div>
  )
}

export default WorkShell
