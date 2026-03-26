import { useRef } from 'react'
import cardboardTexture from '../assets/cardboard texture blue.svg'
import videoOverlay from '../assets/projects/work card overlay 3 .png'

function ProjectCard({
  project,
  stackIndex = 0,
  stackClassName = '',
  isMobileStack = false,
  shouldAutoplay = false,
  onSelect,
}) {
  const cardRef = useRef(null)
  const {
    title,
    company,
    date,
    highlights = [],
    image,
    icon,
    ribbon,
    video,
  } = project

  const handleClick = (e) => {
    if (!onSelect) return
    e.preventDefault()
    const rect = cardRef.current?.getBoundingClientRect()
    onSelect(project, rect)
  }

  return (
    <button
      ref={cardRef}
      type="button"
      className={`work-card ${isMobileStack ? 'work-card--mobile' : `work-card-${stackIndex}`} group relative block overflow-hidden transition-all duration-300 ${stackClassName}`}
      style={{
        backgroundImage: `url(${cardboardTexture})`,
        '--card-index': stackIndex,
      }}
      data-hoverable
      data-stack-index={stackIndex}
      onClick={handleClick}
    >
      <div className="work-card-inner">
        <div className="work-card-header">
          <span className="work-card-title">{title}</span>
          {icon ? (
            <img className="work-card-icon" src={icon} alt="" aria-hidden="true" />
          ) : null}
        </div>
        {video && shouldAutoplay ? (
          <div className="work-card-image work-card-image--video">
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
            />
            <img
              src={videoOverlay}
              alt=""
              aria-hidden="true"
              className="work-card-video-overlay"
            />
          </div>
        ) : image ? (
          <div className="work-card-image">
            <img src={image} alt={`${title} preview`} />
          </div>
        ) : null}
        <div className="work-card-meta">
          <span>{company}</span>
          <span>{date}</span>
        </div>
        <ul className="work-card-highlights">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </button>
  )
}

export default ProjectCard
