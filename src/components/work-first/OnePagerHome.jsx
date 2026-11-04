import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Picture from '../Picture'
import photo from '../../assets/about page/lydia.png?responsive&w=240;480'
import WorkFooter from './WorkFooter'
import WorkMedia from './WorkMedia'
import WorkShell from './WorkShell'
import { WORK_LINKS, WORK_SOCIALS, useWorkPreview, useWorkProjects, yearOf } from './workFirst'
import { ONE_PAGER_BIO, ONE_PAGER_LEAD, ONE_PAGER_WORK } from './onePagerCopy'

function Entry({ project, index, onOpen }) {
  const buttonRef = useRef(null)
  const copy = ONE_PAGER_WORK[project.slug]
  if (!copy) return null

  return (
    <li className="wf-one-entry" style={{ '--i': index }}>
      <article>
        <header className="wf-one-entry-head">
          <h3 className="wf-one-entry-title">{project.title}</h3>
          <p className="wf-one-entry-meta">{project.company} · {yearOf(project)}</p>
        </header>
        <p className="wf-one-entry-role">{copy.role}</p>

        <button
          type="button"
          className="wf-one-media"
          onClick={() => onOpen(project, buttonRef.current)}
          ref={buttonRef}
          aria-label={`Open ${project.title} case study`}
          data-hoverable
        >
          <WorkMedia
            project={project}
            sizes="(min-width: 768px) 720px, 100vw"
            priority={index === 0}
            className="wf-one-media-frame"
          />
        </button>

        <p className="wf-one-summary">{copy.summary}</p>

        <ul className="wf-one-results" aria-label={`${project.title} results`}>
          {copy.results.map((result) => (
            <li key={result.figure} className="wf-one-result">
              <span className="wf-one-figure">{result.figure}</span>
              <span className="wf-one-result-text">{result.text}</span>
            </li>
          ))}
        </ul>
        {copy.note ? <p className="wf-one-note">{copy.note}</p> : null}

        <button
          type="button"
          className="wf-cta wf-one-cta"
          onClick={() => onOpen(project, buttonRef.current)}
          data-hoverable
        >
          Read case study
          <span className="wf-cta-arrow" aria-hidden="true">→</span>
        </button>
      </article>
    </li>
  )
}

function OnePagerHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()

  return (
    <WorkShell layout="onepager" selected={selected} onClose={close}>
      <main className="wf-one">
        <section className="wf-one-hero" aria-label="About Lydia">
          <div className="wf-one-photo">
            <Picture image={photo} sizes="144px" priority alt="Lydia Shan" className="wf-one-photo-img" />
          </div>
          <div className="wf-one-intro">
            <h1 className="wf-one-name">Lydia Shan</h1>
            <p className="wf-one-title">Product designer</p>
          </div>
          <p className="wf-one-bio">{ONE_PAGER_BIO}</p>
          <nav className="wf-one-links" aria-label="Contact and pages">
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
              <Link key={label} to={to} className="wf-link wf-one-link--page" data-hoverable>{label}</Link>
            ))}
          </nav>
        </section>

        <section className="wf-one-work" aria-labelledby="wf-one-work-title">
          <div className="wf-one-work-head">
            <h2 id="wf-one-work-title" className="wf-eyebrow">Selected work</h2>
            <p className="wf-one-lead">{ONE_PAGER_LEAD}</p>
          </div>
          <ol className="wf-one-list">
            {projects.map((project, index) => (
              <Entry key={project.id} project={project} index={index} onOpen={open} />
            ))}
          </ol>
        </section>
      </main>
      <WorkFooter />
    </WorkShell>
  )
}

export default OnePagerHome
