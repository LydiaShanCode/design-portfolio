import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import ScaledStage from './ScaledStage'
import { useCampaignStore } from './store'

export default function CampaignPrototypePage() {
  const store = useCampaignStore()

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Training campaign prototype'
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.title = previousTitle
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <div className="cp-standalone">
      <ScaledStage store={store} mode="fit" />
    </div>,
    document.body,
  )
}
