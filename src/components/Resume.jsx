import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { profile, experience, education, skills, certifications } from '../data/resume'

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

function withProjectLinks(text, links = {}) {
  const phrases = Object.keys(links)
  if (!phrases.length) return text
  const pattern = new RegExp(`(${phrases.join('|')})`)
  return text.split(pattern).map((part, i) =>
    links[part] ? (
      <Link key={i} to={`/project/${links[part]}`} className="resume-link" data-hoverable>{part}</Link>
    ) : (
      part
    ),
  )
}

function Dates({ start, end }) {
  return (
    <p className="resume-dates">
      {start && <time>{start}</time>}
      {start && end && ' – '}
      {end && <time>{end}</time>}
    </p>
  )
}

function Section({ title, children }) {
  const id = `resume-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <section className="resume-section" aria-labelledby={id}>
      <h2 id={id} className="resume-section-title">{title}</h2>
      <div className="resume-section-body">{children}</div>
    </section>
  )
}

function EntryHead({ name, detail, start, end }) {
  return (
    <div className="resume-entry-head">
      <div className="resume-entry-heading">
        <h3 className="resume-entry-name">{name}</h3>
        <p className="resume-entry-detail">{detail}</p>
      </div>
      <Dates start={start} end={end} />
    </div>
  )
}

function Resume() {
  return (
    <main className="resume-page">
      <article className="resume-sheet">
        <header className="resume-masthead">
          <div>
            <h1 className="resume-name">{profile.name}</h1>
            <p className="resume-title">{profile.title}</p>
          </div>

          <div className="resume-actions">
            <a href="/resume.pdf" download="Lydia Shan Resume.pdf" className="resume-button" data-hoverable aria-label="Download PDF">
              <DownloadIcon />
            </a>
            <button type="button" className="resume-button resume-print" onClick={() => window.print()} data-hoverable aria-label="Print">
              <PrintIcon />
            </button>
          </div>
        </header>

        <Section title="Experience">
          {experience.map((job) => (
            <article key={job.company} className="resume-entry">
              <EntryHead name={job.company} detail={job.role} start={job.start} end={job.end} />

              {job.points.length > 0 && (
                <ul className="resume-points">
                  {job.points.map((point) => (
                    <li key={point.text}>
                      {point.lead && <>{withProjectLinks(point.lead, job.links)}: </>}
                      {withProjectLinks(point.text, job.links)}
                    </li>
                  ))}
                </ul>
              )}

              {job.caseStudies?.length > 0 && (
                <p className="resume-case-studies">
                  Case {job.caseStudies.length > 1 ? 'studies' : 'study'}:{' '}
                  {job.caseStudies.map(({ title, slug }, i) => (
                    <Fragment key={slug}>
                      {i > 0 && ', '}
                      <Link to={`/project/${slug}`} className="resume-link" data-hoverable>{title}</Link>
                    </Fragment>
                  ))}
                </p>
              )}
            </article>
          ))}
        </Section>

        <Section title="Education">
          {education.map((item) => (
            <article key={item.school} className="resume-entry resume-entry--compact">
              <EntryHead
                name={item.school}
                detail={item.note ? `${item.program} (${item.note})` : item.program}
                start={item.start}
                end={item.end}
              />
            </article>
          ))}
        </Section>

        <Section title="Tools & Skills">
          <dl className="resume-skills">
            {skills.map((group) => (
              <div key={group.label} className="resume-skill-row">
                <dt>{group.label}</dt>
                <dd>{group.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Certifications">
          {certifications.map((cert) => (
            <article key={cert.name} className="resume-entry resume-entry--compact">
              <EntryHead name={cert.name} detail={cert.issuer} start={cert.date} />
            </article>
          ))}
        </Section>

        <ul className="resume-contact">
          {profile.contact.map(({ label, value, href }) => (
            <li key={label}>
              <a
                href={href}
                className="resume-link"
                data-hoverable
                {...(href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {value}
              </a>
            </li>
          ))}
        </ul>
      </article>
    </main>
  )
}

export default Resume
