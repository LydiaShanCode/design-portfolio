import { useMemo, useState, useEffect, useCallback, Children, isValidElement } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Markdown from 'react-markdown'
import projectsFromMd from '../data/projectLoader'
import IterationsViewer from './IterationsViewer'
import CaseStudyGate from './CaseStudyGate'
import designSystemImage from '../assets/projects/design-system/ design system - work card image.png'
import flowOfFundsImage from '../assets/projects/payouts-uplift/payouts uplift - work card image.png'
import shopBalanceImage from '../assets/projects/shop-balance/shop balance - work card image.png'
import internationalCommerceImage from '../assets/projects/international-commerce/international commerce - work card image.png'
import listeningRoomImage from '../assets/projects/Listening Room/listening room - work card image.png'
import shopifyIcon from '../assets/shopify-icon.svg'
import searchEyeIcon from '../assets/searcheye icon.svg'
import flowOfFundsVideo from '../assets/projects/payouts-uplift/payouts uplift final video.MP4'
import designSystemVideo from '../assets/projects/design-system/Design System Final Video.MP4'
import internationalCommerceVideo from '../assets/projects/international-commerce/International Commerce Final video.MP4'
import shopBalanceVideo from '../assets/projects/shop-balance/Shop Balance final video.MP4'
import listeningRoomVideo from '../assets/projects/Listening Room/Listening Room final video.MP4'
import ticketImage from '../assets/project ticket.png'

const imageAssets = {
  designSystem: designSystemImage,
  flowOfFunds: flowOfFundsImage,
  shopBalance: shopBalanceImage,
  internationalCommerce: internationalCommerceImage,
  listeningRoom: listeningRoomImage,
}

const videoAssets = {
  designSystem: designSystemVideo,
  flowOfFunds: flowOfFundsVideo,
  internationalCommerce: internationalCommerceVideo,
  shopBalance: shopBalanceVideo,
  listeningRoom: listeningRoomVideo,
}

const iconAssets = {
  shopify: shopifyIcon,
  searchEye: searchEyeIcon,
}

const projectAssetModules = import.meta.glob(
  '../assets/projects/**/*.{PNG,png,jpg,jpeg,svg,gif,MP4,mp4,webm,mov}',
  { eager: true }
)

const VIDEO_EXTENSIONS = /\.(mp4|MP4|webm|mov|MOV)$/i

function resolveProjectAsset(src, slug) {
  if (!src || !src.startsWith('./')) return src
  const filename = decodeURIComponent(src.slice(2))
  const key = Object.keys(projectAssetModules).find(
    (k) => k.includes(`/${slug}/`) && k.endsWith(`/${filename}`)
  )
  return key ? projectAssetModules[key].default : src
}

const MODE_ICONS = {
  'Casual mode': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  'Accounting mode': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  'Troubleshooting mode': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
    </svg>
  ),
}

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClose}
    >
      <motion.img
        src={src}
        className="lightbox-img"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

function buildMarkdownComponents(slug, project, setLightboxSrc) {
  return {
    ul({ children }) {
      const arr = Children.toArray(children)
      const firstLi = arr.find((c) => isValidElement(c))
      if (firstLi) {
        const liChildren = Children.toArray(firstLi.props?.children)
        const first = liChildren[0]
        if (isValidElement(first) && first.type === 'strong') {
          const label = first.props?.children
          if (MODE_ICONS[label]) {
            return <ul className="project-page-mode-list">{children}</ul>
          }
          return <div className="project-page-issue-grid">{children}</div>
        }
      }
      return <ul>{children}</ul>
    },
    li({ children }) {
      const arr = Children.toArray(children)
      const first = arr[0]
      if (isValidElement(first) && first.type === 'strong') {
        const label = first.props.children
        const icon = MODE_ICONS[label]
        if (icon) {
          const rest = arr.slice(1).map((c) => (typeof c === 'string' ? c.replace(/^\s*—\s*/, '') : c))
          return (
            <div className="project-page-mode-row">
              <span className="project-page-mode-chip">
                {icon}
                {label}
              </span>
              <span className="project-page-mode-text">{rest}</span>
            </div>
          )
        }
        const rest = arr.slice(1).map((c) => (typeof c === 'string' ? c.replace(/^\s*—\s*/, '') : c))
        return (
          <div className="project-page-issue">
            <span className="project-page-issue-chip">{label}</span>
            <span className="project-page-issue-description">{rest}</span>
          </div>
        )
      }
      return <li>{children}</li>
    },
    img({ src, alt }) {
      if (alt === 'iterations') {
        return (
          <IterationsViewer
            tabs={project.iterationTabs || []}
            groups={project.iterations || []}
            resolveAsset={(s) => resolveProjectAsset(s, slug)}
          />
        )
      }
      const resolved = resolveProjectAsset(src, slug)
      const isVideo = VIDEO_EXTENSIONS.test(src)
      const decodedSrc = decodeURIComponent(src || '')
      return (
        <figure className="project-page-figure">
          {isVideo ? (
            <video
              src={resolved}
              autoPlay
              loop
              muted
              playsInline
              className="project-page-figure-img"
            />
          ) : (
            <img
              src={resolved}
              alt={alt || ''}
              className="project-page-figure-img project-page-figure-img--zoomable"
              onClick={() => setLightboxSrc(resolved)}
              data-hoverable
            />
          )}
          {alt ? <figcaption className="project-page-figcaption">{alt}</figcaption> : null}
        </figure>
      )
    },
    blockquote({ children }) {
      return <blockquote className="project-page-quote">{children}</blockquote>
    },
    h2({ children }) {
      return <h2 className="project-page-section-heading">{children}</h2>
    },
    p({ children }) {
      const arr = Children.toArray(children)
      if (
        arr.length === 1 &&
        isValidElement(arr[0]) &&
        arr[0].props?.className === 'project-page-annotation'
      ) {
        return <>{children}</>
      }
      return <p className="project-page-paragraph">{children}</p>
    },
    em({ children }) {
      return <span className="project-page-annotation">{children}</span>
    },
  }
}

function renderProjectContent(content, components) {
  const lines = content.split('\n')
  const parts = []
  let i = 0

  while (i < lines.length) {
    if (lines[i].startsWith('> ')) {
      const quotes = []
      let current = [lines[i]]
      i++
      while (i < lines.length) {
        if (lines[i].startsWith('> ')) {
          current.push(lines[i])
          i++
        } else if (
          lines[i].trim() === '' &&
          i + 1 < lines.length &&
          lines[i + 1].startsWith('> ')
        ) {
          quotes.push(current.join('\n'))
          current = []
          i++
        } else {
          break
        }
      }
      if (current.length) quotes.push(current.join('\n'))
      parts.push({ type: 'quotes', quotes })
    } else {
      const start = i
      while (i < lines.length && !lines[i].startsWith('> ')) i++
      parts.push({ type: 'prose', text: lines.slice(start, i).join('\n') })
    }
  }

  return parts.map((part, idx) => {
    if (part.type === 'quotes') {
      if (part.quotes.length >= 2) {
        return (
          <div className="project-page-quote-grid" key={idx}>
            {part.quotes.map((q, j) => (
              <Markdown key={j} components={components}>
                {q}
              </Markdown>
            ))}
          </div>
        )
      }
      return (
        <Markdown key={idx} components={components}>
          {part.quotes[0]}
        </Markdown>
      )
    }
    return (
      <Markdown key={idx} components={components}>
        {part.text}
      </Markdown>
    )
  })
}

function ProjectPage() {
  const { slug } = useParams()
  const [unlocked, setUnlocked] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const closeLightbox = useCallback(() => setLightboxSrc(null), [])

  const project = useMemo(() => {
    const raw = projectsFromMd.find((p) => p.slug === slug)
    if (!raw) return null
    return {
      ...raw,
      image: imageAssets[raw.imageKey],
      icon: iconAssets[raw.iconKey],
      video: videoAssets[raw.videoKey] || null,
    }
  }, [slug])

  const mdComponents = useMemo(() => buildMarkdownComponents(slug, project, setLightboxSrc), [slug, project])

  const nextProject = useMemo(() => {
    const ready = projectsFromMd.filter((p) => p.caseStudyReady && p.slug !== slug)
    if (!ready.length) return null
    const currentIdx = projectsFromMd.findIndex((p) => p.slug === slug)
    const after = ready.find((p) => projectsFromMd.indexOf(p) > currentIdx)
    return after || ready[0]
  }, [slug])

  if (!project) {
    return (
      <main className="project-page">
        <div className="project-page-inner">
          <p className="project-page-not-found">Project not found.</p>
        </div>
      </main>
    )
  }

  const hasContent = !!project.content

  return (
    <>
    <AnimatePresence>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={closeLightbox} />}
    </AnimatePresence>
    <main className="project-page">
      <div className="project-page-inner">
        <div className="project-page-hero">
          {project.video ? (
            <video
              src={project.video}
              autoPlay
              loop
              muted
              playsInline
              className="project-page-video"
            />
          ) : project.image ? (
            <img src={project.image} alt={`${project.title} preview`} className="project-page-video" />
          ) : null}
        </div>

        <h1 className="project-page-title">{project.title}</h1>

        <div className="project-page-meta-row">
          <div className="project-page-meta-col">
            <span className="project-page-meta-company">
              {project.icon ? <img src={project.icon} alt="" aria-hidden="true" className="project-page-company-icon" /> : null}
              {project.company}
            </span>
            {project.walkthroughUrl ? (
              <a
                href={project.walkthroughUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-page-walkthrough"
                data-hoverable
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                </svg>
                Watch Walkthrough
              </a>
            ) : null}
            {project.prototypeUrl ? (
              <a
                href={project.prototypeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-page-walkthrough"
                data-hoverable
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                Try it out
              </a>
            ) : null}
          </div>
          {project.team && project.team.length > 0 ? (
            <div className="project-page-meta-col">
              {project.team.map((member) => (
                <span key={member.name} className="project-page-meta-label">
                  {member.name} ({member.role})
                </span>
              ))}
            </div>
          ) : null}
          <div className="project-page-meta-col">
            {project.duration ? <span className="project-page-meta-label">{project.duration}</span> : null}
            {project.timeline ? <span className="project-page-meta-label">{project.timeline}</span> : null}
          </div>
        </div>

        {!hasContent ? (
          <div className="project-page-coming-soon">
            <p className="project-page-coming-soon-label">Coming soon</p>
            <p className="project-page-coming-soon-text">
              The full case study for {project.title} is on the way.
            </p>
          </div>
        ) : project.protected && !unlocked ? (
          <CaseStudyGate slug={slug} onUnlock={() => setUnlocked(true)} />
        ) : (
          <div className="project-page-content">
            {renderProjectContent(project.content, mdComponents)}
          </div>
        )}

        {nextProject && (
          <Link
            to={`/project/${nextProject.slug}`}
            className="project-page-next-up"
            data-hoverable
          >
            <span className="project-page-next-up-label">
              <em>Your ticket to the next case study...</em>
            </span>
            <div className="project-page-next-up-ticket">
              <img src={ticketImage} alt="" aria-hidden="true" className="project-page-next-up-img" />
              <span className="project-page-next-up-title">{nextProject.title}</span>
            </div>
          </Link>
        )}
      </div>
    </main>
    </>
  )
}

export default ProjectPage
