import { useLayoutEffect, useRef, useState } from 'react'
import CampaignPrototype from './CampaignPrototype'
import { STAGE_HEIGHT, STAGE_WIDTH } from './data'

const MIN_FULLSCREEN_SCALE = 0.55

export default function ScaledStage({ store, mode }) {
  const hostRef = useRef(null)
  const [scale, setScale] = useState(mode === 'fit' ? 0.5 : 1)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const measure = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width) return
      if (mode === 'fit') {
        setScale(Math.max(Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT), MIN_FULLSCREEN_SCALE))
      } else {
        setScale(width / STAGE_WIDTH)
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => observer.disconnect()
  }, [mode])

  return (
    <div ref={hostRef} className={`cp-embed__host cp-embed__host--${mode}`}>
      <div className="cp-embed__sizer" style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}>
        <div className="cp-embed__stage" style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}>
          <CampaignPrototype store={store} />
        </div>
      </div>
    </div>
  )
}
