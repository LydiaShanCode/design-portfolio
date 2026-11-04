import { useEffect, useRef } from 'react'
import { useDesignVersion } from './design-versions/DesignVersionProvider'
import { CLICK_SFX_VERSIONS, initClickSfx, playClickSfx } from '../lib/clickSfx'

const CLICKABLE = 'button:not(:disabled), [role="button"]:not([aria-disabled="true"]), a[href]'

/** Plays a water-drop on every button or link press, site-wide. Renders nothing. */
function ClickSfx() {
  const version = useDesignVersion('click-sfx', CLICK_SFX_VERSIONS, { label: 'Click sound' })
  const versionRef = useRef(version)
  versionRef.current = version

  useEffect(() => initClickSfx(), [])

  useEffect(() => {
    const isClickable = (target) =>
      target instanceof Element && target.closest(CLICKABLE) && !target.closest('[data-no-sfx]')
    // Pointer presses sound on pointerdown so the drop lands with the finger, not on release
    const onPointerDown = (e) => {
      if (e.button === 0 && isClickable(e.target)) playClickSfx(versionRef.current)
    }
    // Keyboard activation (Enter/Space) dispatches a click with detail 0
    const onClick = (e) => {
      if (e.detail === 0 && isClickable(e.target)) playClickSfx(versionRef.current)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}

export default ClickSfx
