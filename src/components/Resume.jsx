import { Link } from 'react-router-dom'
import Badge from './ui/Badge'
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

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
)

function Dates({ start, end }) {
  return (
    <p className="resume-dates">
      {start && <time>{start}</time>}
      {start && end && <span aria-hidden="true"> — </span>}
      {end && <time>{end}</time>}
    </p>
  )
}

function Section({ title, index, children }) {
  const id = `resume-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <section className="resume-section" aria-labelledby={id} style={{ '--i': index }}>
      <h2 id={id} className="resume-section-title">{title}</h2>
      <div className="resume-section-body">{children}</div>
    </section>
  )
}

function Resume() {
  return (
    <main className="resume-page">
      <article className="resume-sheet">
        <header className="resume-masthead" style={{ '--i': 0 }}>
          <div className="resume-identity">
            <h1 className="resume-name">{profile.name}</h1>
            <p className="resume-title">{profile.title}</p>
            <p className="resume-location">
              <span className="resume-location-dot" aria-hidden="true" />
              Currently in {profile.location}
            </p>
          </div>

          <div className="resume-aside">
            <dl className="resume-contact">
              {profile.contact.map(({ label, value, href }) => (
                <div key={label} className="resume-contact-row">
                  <dt>{label}</dt>
                  <dd>
                    <a
                      href={href}
                      className="resume-link"
                      data-hoverable
                      {...(href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="resume-actions">
              <a href="/resume.pdf" download="Lydia Shan Resume.pdf" className="resume-action" data-hoverable>
                <DownloadIcon />
                <span>Download PDF</span>
              </a>
              <button type="button" className="resume-action" onClick={() => window.print()} data-hoverable>
                <PrintIcon />
                <span>Print</span>
              </button>
            </div>
          </div>
        </header>

        <Section title="Experience" index={1}>
          {experience.map((job) => (
            <article key={job.company} className="resume-entry">
              <div className="resume-entry-head">
                <img src={job.icon} alt="" aria-hidden="true" className="resume-entry-icon" />
                <div className="resume-entry-heading">
                  <h3 className="resume-entry-name">{job.company}</h3>
                  <p className="resume-entry-role">{job.role}</p>
                </div>
                <Dates start={job.start} end={job.end} />
              </div>

              {job.points.length > 0 && (
                <ul className="resume-points">
                  {job.points.map((point) => (
                    <li key={point.text}>
                      {point.lead && <strong>{point.lead}: </strong>}
                      {point.text}
                    </li>
                  ))}
                </ul>
              )}

              {job.caseStudies?.length > 0 && (
                <div className="resume-case-studies">
                  <span className="resume-case-studies-label">Case studies</span>
                  {job.caseStudies.map(({ title, slug }) => (
                    <Link key={slug} to={`/project/${slug}`} className="resume-case-study" data-hoverable>
                      {title}
                      <ArrowIcon />
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </Section>

        <Section title="Education" index={2}>
          {education.map((item) => (
            <article key={item.school} className="resume-entry resume-entry--compact">
              <div className="resume-entry-head">
                <div className="resume-entry-heading">
                  <h3 className="resume-entry-name">{item.school}</h3>
                  <p className="resume-entry-role">
                    {item.program}
                    {item.note && <span className="resume-entry-note"> · {item.note}</span>}
                  </p>
                </div>
                <Dates start={item.start} end={item.end} />
              </div>
            </article>
          ))}
        </Section>

        <Section title="Tools & Skills" index={3}>
          <div className="resume-skills">
            {skills.map((group) => (
              <div key={group.label} className="resume-skill-group">
                <h3 className="resume-skill-label">{group.label}</h3>
                <ul className="resume-skill-list">
                  {group.items.map((item) => (
                    <li key={item}><Badge>{item}</Badge></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Certifications" index={4}>
          {certifications.map((cert) => (
            <article key={cert.name} className="resume-entry resume-entry--compact">
              <div className="resume-entry-head">
                <div className="resume-entry-heading">
                  <h3 className="resume-entry-name">{cert.name}</h3>
                  <p className="resume-entry-role">{cert.issuer}</p>
                </div>
                <Dates start={cert.date} />
              </div>
            </article>
          ))}
        </Section>
      </article>
    </main>
  )
}

export default Resume
