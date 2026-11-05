import { useEffect } from 'react'
import { play, setTheme, setVolume } from 'cuelume'

const CONTROL = 'button, [role="button"], a[href]'
const SKIP = '.work-card, .column-card, .card-desk'

function controlFrom(target) {
  if (!(target instanceof Element)) return null
  const control = target.closest(CONTROL)
  if (!control || control.closest(SKIP)) return null
  if (control.matches(':disabled') || control.getAttribute('aria-disabled') === 'true') return null
  if (control.tagName === 'A') {
    const inChrome = control.closest('nav, .footer-links, .resume-actions, .column-links, .dv-menu')
    const looksLikeButton = control.matches(
      '.resume-button, .project-preview-cta, .project-page-walkthrough, .footer-link, .btn-hover',
    )
    if (!inChrome && !looksLikeButton) return null
  }
  return control
}

function ButtonSound() {
  useEffect(() => {
    setTheme('press')
    setVolume(0.8)
    const onClick = (event) => {
      if (!controlFrom(event.target)) return
      play('tap', {
        emphasis: 'normal',
        input: event.detail === 0 ? 'keyboard' : 'mouse',
      })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}

export default ButtonSound
