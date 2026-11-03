import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import Picture from './Picture'
import Video from './Video'
import cardboardTexture from '../assets/cardboard texture blue.webp'
import videoOverlay from '../assets/projects/work card overlay 3 .png?responsive&w=480;960'

function ProjectCard({
  project,
  stackIndex = 0,
  stackClassName = '',
  isMobileStack = false,
  shouldAutoplay = false,
  warmVideo = false,
  onSelect,
  motionProps,
}) {
  const cardRef = useRef(null)
  const {
    title,
    company,
    start,
    highlights = [],
    cardImage: image,
    cardImagePlaceholder: imagePlaceholder,
    icon,
    cardVideo,
  } = project

  // Desktop keeps the video mounted (hidden) so hover reveals an already-buffered clip
  const hasVideo = Boolean(cardVideo) && !isMobileStack
  const showVideo = hasVideo && shouldAutoplay
  const videoMedia = useMemo(
    () => (cardVideo && !(warmVideo || shouldAutoplay) ? { ...cardVideo, poster: null } : cardVideo),
    [cardVideo, warmVideo, shouldAutoplay],
  )

  const handleClick = (e) => {
    if (!onSelect) return
    e.preventDefault()
    const rect = cardRef.current?.getBoundingClientRect()
    onSelect(project, rect, cardRef.current)
  }

  return (
    <motion.button
      ref={cardRef}
      type="button"
      className={`work-card ${isMobileStack ? 'work-card--mobile' : ''} ${!isMobileStack && shouldAutoplay ? 'work-card--hovered' : ''} group relative block overflow-hidden ${stackClassName}`}
      {...motionProps}
      style={{
        backgroundImage: `url(${cardboardTexture})`,
        ...motionProps?.style,
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
        {image || hasVideo ? (
          <div className="work-card-image">
            <Picture
              image={image}
              placeholder={imagePlaceholder}
              sizes="316px"
              alt={`${title} preview`}
            />
            {hasVideo ? (
              <Video
                media={videoMedia}
                playing={showVideo}
                preload={warmVideo || showVideo ? 'auto' : 'none'}
                className={`work-card-video ${showVideo ? 'work-card-video--playing' : ''}`}
              />
            ) : null}
            <Picture
              image={videoOverlay}
              sizes="316px"
              aria-hidden="true"
              className={`work-card-video-overlay ${showVideo ? 'work-card-video-overlay--hidden' : ''}`}
            />
          </div>
        ) : (
          <div className="work-card-image work-card-image--placeholder" aria-hidden="true">
            <span>Preview coming soon</span>
          </div>
        )}
        <div className="work-card-meta">
          <span>{company}</span>
          {start ? <span className="work-card-meta-date">{start}</span> : null}
        </div>
        <ul className="work-card-highlights">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </motion.button>
  )
}

export default ProjectCard
