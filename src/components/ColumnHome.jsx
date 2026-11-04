import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Picture from './Picture'
import Video from './Video'
import ProjectPreview from './ProjectPreview'
import { siteIndexHref } from '../lib/siteIndex'
import { featuredProjects } from '../data/projectLoader'
import { withProjectAssets } from '../data/projectAssets'

// Cards ride a horizontal drum; the radius is a multiple of the viewport height
const DRUM_RADIUS = 0.72
// Past this angle a card has rolled out of sight behind the drum
const DRUM_HIDE_ANGLE = Math.PI / 2
const DRUM_PERSPECTIVE = 1400

const LINKS = [
  { label: 'Play', to: '/play' },
  { label: 'About', to: '/about' },
  { label: 'CV', to: '/resume' },
]

const SOCIALS = [
  { label: 'Email', href: 'mailto:lydiashan.c@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lydiashan/' },
  { label: 'Twitter', href: 'https://x.com/lydia_shann' },
]

const yearOf = (project) => project.start?.match(/\d{4}/)?.[0] ?? project.timeline?.match(/\d{4}/)?.[0]

function ColumnCard({ project, playing, onSelect, register }) {
  const { title, company, cardImage, cardImagePlaceholder, cardVideo } = project
  const portrait = cardVideo && cardVideo.height > cardVideo.width
  const ratio = portrait ? '4 / 5' : cardVideo ? `${cardVideo.width} / ${cardVideo.height}` : '4 / 3'

  return (
    <li className="column-item" ref={register}>
      <div className="column-item-tab" aria-hidden="true">{company}</div>
      <button
        type="button"
        className={`column-card${playing ? ' column-card--playing' : ''}`}
        style={{ aspectRatio: ratio }}
        onClick={(event) => onSelect(project, event.currentTarget.getBoundingClientRect())}
        aria-label={`${title}, ${company}`}
        data-hoverable
      >
        <Picture image={cardImage} placeholder={cardImagePlaceholder} sizes="360px" alt="" />
        {cardVideo ? (
          <Video
            media={cardVideo}
            playing={playing}
            preload={playing ? 'auto' : 'none'}
            className="column-card-video"
            aria-hidden="true"
          />
        ) : null}
      </button>
      <p className="column-item-caption">
        <span className="column-item-title">{title}</span>
        <span className="column-item-year">{yearOf(project)}</span>
      </p>
    </li>
  )
}

function ColumnHome() {
  const projects = useMemo(() => featuredProjects.map(withProjectAssets), [])
  const listRef = useRef(null)
  const itemsRef = useRef([])
  const [focusIndex, setFocusIndex] = useState(0)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let lastFocus = -1

    const update = () => {
      frame = 0
      const viewportH = window.innerHeight
      const center = viewportH / 2
      const radius = viewportH * DRUM_RADIUS
      const listTop = listRef.current?.getBoundingClientRect().top ?? 0
      let nearest = -1
      let nearestDistance = Infinity

      itemsRef.current.forEach((item, index) => {
        if (!item) return
        // offsetTop ignores the transform, so the drum maps from where the card would sit flat
        const offset = listTop + item.offsetTop + item.offsetHeight / 2 - center
        if (Math.abs(offset) < nearestDistance) {
          nearestDistance = Math.abs(offset)
          nearest = index
        }
        if (reduceMotion) return
        const angle = offset / radius
        if (Math.abs(angle) > DRUM_HIDE_ANGLE) {
          item.style.visibility = 'hidden'
          return
        }
        const y = radius * Math.sin(angle) - offset
        const z = radius * Math.cos(angle) - radius
        item.style.visibility = ''
        item.style.transform = `perspective(${DRUM_PERSPECTIVE}px) translate3d(0, ${y}px, ${z}px) rotateX(${-angle}rad)`
      })

      if (nearest !== lastFocus) {
        lastFocus = nearest
        setFocusIndex(nearest)
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [projects.length])

  const handleSelect = useCallback((project, rect) => setSelected({ project, rect }), [])
  const handleClose = useCallback(() => setSelected(null), [])

  return (
    <div className="column-home">
      <header className="column-aside">
        <h1 className="column-name">Lydia Shan</h1>
        <p className="column-role">Product designer</p>
        <nav className="column-links" aria-label="Primary">
          {LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="column-link" data-hoverable>{label}</Link>
          ))}
        </nav>
        <nav className="column-links" aria-label="Contact">
          {SOCIALS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="column-link"
              data-hoverable
              {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {label}
            </a>
          ))}
          <a href={siteIndexHref} className="column-link" data-hoverable>index.md</a>
        </nav>
      </header>

      <section id="work" aria-label="Selected work">
        <ol className="column-list" ref={listRef}>
          {projects.map((project, index) => (
            <ColumnCard
              key={project.id}
              project={project}
              playing={index === focusIndex && !selected}
              onSelect={handleSelect}
              register={(node) => { itemsRef.current[index] = node }}
            />
          ))}
        </ol>
      </section>

      {selected && (
        <ProjectPreview project={selected.project} cardRect={selected.rect} originNode={null} onClose={handleClose} />
      )}
    </div>
  )
}

export default ColumnHome
