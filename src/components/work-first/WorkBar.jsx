import { Link } from 'react-router-dom'
import { siteIndexHref } from '../../lib/siteIndex'
import { WORK_LINKS, WORK_SOCIALS } from './workFirst'

const isExternal = (href) => href.startsWith('http')

/** Identity and links. `bar` is a slim top row; `rail` stacks the same content for a side column. */
function WorkBar({ layout = 'bar', tagline = null, leading = null }) {
  return (
    <header className={`wf-bar wf-bar--${layout}`}>
      {leading}
      <div className="wf-bar-id">
        <h1 className="wf-name">Lydia Shan</h1>
        <p className="wf-role">Product designer</p>
        {tagline ? <p className="wf-tagline">{tagline}</p> : null}
      </div>
      <nav className="wf-links" aria-label="Primary">
        {WORK_LINKS.map(({ label, to }) => (
          <Link key={label} to={to} className="wf-link" data-hoverable>{label}</Link>
        ))}
      </nav>
      <nav className="wf-links wf-links--social" aria-label="Contact">
        {WORK_SOCIALS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="wf-link"
            data-hoverable
            {...(isExternal(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {label}
          </a>
        ))}
        <a href={siteIndexHref} className="wf-link" data-hoverable>index.md</a>
      </nav>
    </header>
  )
}

export default WorkBar
