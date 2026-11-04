import { Link } from 'react-router-dom'
import { WORK_LINKS, WORK_SOCIALS } from './workFirst'

function WorkFooter({ mobileOnly = false }) {
  return (
    <footer className={`wf-footer${mobileOnly ? ' wf-footer--mobile-only' : ''}`}>
      <p className="wf-footer-line">
        Say hello at{' '}
        <a href="mailto:lydiashan.c@gmail.com" className="wf-footer-email" data-hoverable>
          lydiashan.c@gmail.com
        </a>
      </p>
      <nav className="wf-footer-links" aria-label="Contact and pages">
        {WORK_SOCIALS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="wf-link"
            data-hoverable
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {label}
          </a>
        ))}
        {WORK_LINKS.map(({ label, to }) => (
          <Link key={label} to={to} className="wf-link" data-hoverable>{label}</Link>
        ))}
      </nav>
    </footer>
  )
}

export default WorkFooter
