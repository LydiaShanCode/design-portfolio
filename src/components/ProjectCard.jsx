import cardboardTexture from '../assets/cardboard texture blue.svg'

function ProjectCard({ project, stackIndex = 0, stackClassName = '', isMobileStack = false }) {
  const {
    title,
    company,
    date,
    highlights = [],
    image,
    icon,
    ribbon,
  } = project

  return (
    <a
      href={`#project-${project.id}`}
      className={`work-card ${isMobileStack ? 'work-card--mobile' : `work-card-${stackIndex}`} group relative block overflow-hidden transition-all duration-300 ${stackClassName}`}
      style={{
        backgroundImage: `url(${cardboardTexture})`,
        '--card-index': stackIndex,
      }}
      data-hoverable
      data-stack-index={stackIndex}
      onClick={isMobileStack ? (e) => e.preventDefault() : undefined}
    >
      <div className="work-card-inner">
        <div className="work-card-header">
          <span className="work-card-title">{title}</span>
          {icon ? (
            <img className="work-card-icon" src={icon} alt="" aria-hidden="true" />
          ) : null}
        </div>
        {image ? (
          <div className="work-card-image">
            <img src={image} alt={`${title} preview`} />
          </div>
        ) : null}
        <div className="work-card-meta">
          <span>{company}</span>
          <span>{date}</span>
        </div>
        {ribbon ? (
          <img className="work-card-ribbon" src={ribbon} alt="Current project" />
        ) : null}
        <ul className="work-card-highlights">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </a>
  )
}

export default ProjectCard
