import { useCallback, useEffect, useMemo, useState } from 'react'
import { featuredProjects } from '../../data/projectLoader'
import { withProjectAssets } from '../../data/projectAssets'

export const WORK_TAGLINE = 'Recent work from Shopify and Adaptive Security.'

export const WORK_LINKS = [
  { label: 'Play', to: '/play' },
  { label: 'About', to: '/about' },
  { label: 'CV', to: '/resume' },
]

export const WORK_SOCIALS = [
  { label: 'Email', href: 'mailto:lydiashan.c@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lydiashan/' },
  { label: 'X', href: 'https://x.com/lydia_shann' },
]

export const yearOf = (project) =>
  project.start?.match(/\d{4}/)?.[0] ?? project.timeline?.match(/\d{4}/)?.[0] ?? ''

export const isPortrait = (project) =>
  Boolean(project.cardVideo) && project.cardVideo.height > project.cardVideo.width

export const pad = (index) => String(index + 1).padStart(2, '0')

export function useWorkProjects() {
  return useMemo(() => featuredProjects.map(withProjectAssets), [])
}

/** Selected project plus the card rect the preview grows from. */
export function useWorkPreview() {
  const [selected, setSelected] = useState(null)
  const open = useCallback((project, element) => {
    setSelected({ project, rect: element.getBoundingClientRect() })
  }, [])
  const close = useCallback(() => setSelected(null), [])
  return { selected, open, close }
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [query])
  return matches
}
