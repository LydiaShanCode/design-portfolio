import { lazy, Suspense } from 'react'

const LAYOUTS = {
  billboard: lazy(() => import('./BillboardHome')),
  wall: lazy(() => import('./WallHome')),
  strips: lazy(() => import('./StripsHome')),
  scenes: lazy(() => import('./ScenesHome')),
  gallery: lazy(() => import('./GalleryHome')),
  bento: lazy(() => import('./BentoHome')),
  agent: lazy(() => import('./AgentHome')),
}

function WorkFirstHome({ layout }) {
  const Layout = LAYOUTS[layout]
  if (!Layout) return null
  return (
    <Suspense fallback={<div className="route-fallback" aria-hidden="true" />}>
      <Layout />
    </Suspense>
  )
}

export default WorkFirstHome
