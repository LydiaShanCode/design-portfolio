import { useMemo, useState } from 'react'
import Picture from './Picture'
import Video from './Video'

// The opening of the case study, up to the first section break, with headings, lists and quotes stripped out
function introParagraphs(content) {
  const paragraphs = []
  for (const block of content.split(/\n\s*\n/)) {
    const text = block
      .split('\n')
      .filter((line) => line.trim() && !/^\s*(#|>|- )/.test(line) && !/!\[[^\]]*\]\(/.test(line))
      .join(' ')
      .replace(/\*\*/g, '')
      .trim()
    if (!text) continue
    paragraphs.push(text)
    if (paragraphs.length === 6) break
  }
  return paragraphs
}

function ShowcaseTile({ item, onOpen }) {
  const [videoOn, setVideoOn] = useState(false)

  if (item.video) {
    return (
      <button
        type="button"
        className="project-showcase-tile project-showcase-tile--hero"
        onMouseEnter={() => setVideoOn(true)}
        onMouseLeave={() => setVideoOn(false)}
        onFocus={() => setVideoOn(true)}
        onBlur={() => setVideoOn(false)}
        onClick={() => onOpen(item.video.poster)}
        aria-label={`${item.alt}. Play preview`}
        data-hoverable
      >
        <Video media={item.video} playing={videoOn} preload="none" className="project-showcase-media" />
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`project-showcase-tile${item.wide ? ' project-showcase-tile--wide' : ''}`}
      onClick={() => onOpen(item.src)}
      aria-label={item.alt}
      data-hoverable
    >
      <Picture image={item.image} sizes={item.wide ? '60vw' : '30vw'} alt={item.alt} className="project-showcase-media" />
    </button>
  )
}

function ProjectShowcase({ project, slug, onOpen }) {
  const paragraphs = useMemo(() => introParagraphs(project.content || ''), [project.content])

  const tiles = useMemo(() => {
    const shots = (project.showcase || []).map((shot) => ({
      ...shot,
      image: new URL(`../assets/projects/${slug}/showcase/${shot.file}`, import.meta.url).href,
      src: new URL(`../assets/projects/${slug}/showcase/${shot.file}`, import.meta.url).href,
    }))
    return project.video ? [{ video: project.video, alt: `${project.title} preview` }, ...shots] : shots
  }, [project, slug])

  return (
    <div className="project-showcase">
      <div className="project-showcase-copy">
        <h1 className="project-page-title">{project.title}</h1>
        <p className="project-showcase-company">
          {project.icon ? <img src={project.icon} alt="" aria-hidden="true" className="project-page-company-icon" /> : null}
          {project.company}
          {project.timeline ? <span>{project.timeline}</span> : null}
        </p>
        {paragraphs.map((text) => (
          <p key={text.slice(0, 24)} className="project-showcase-paragraph">{text}</p>
        ))}
      </div>
      <div className="project-showcase-grid">
        {tiles.map((tile) => (
          <ShowcaseTile key={tile.file || 'hero'} item={tile} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

export default ProjectShowcase
