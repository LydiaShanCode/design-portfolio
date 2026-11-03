import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { profile, experience, education, skills, certifications } from '../data/resume'

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
            <p className="resume-location">Currently in {profile.location}</p>
          </div>

          <div className="resume-aside">
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
            <p className="resume-actions">
              <a href="/resume.pdf" download="Lydia Shan Resume.pdf" className="resume-link" data-hoverable>
                Download PDF
              </a>
              <button type="button" className="resume-link" onClick={() => window.print()} data-hoverable>
                Print
              </button>
            </p>
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
                      {point.lead && <strong>{point.lead}: </strong>}
                      {point.text}
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
      </article>
    </main>
  )
}

export default Resume
