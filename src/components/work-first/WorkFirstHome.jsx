import { lazy, Suspense } from 'react'

const LAYOUTS = {
  wall: lazy(() => import('./WallHome')),
  bento: lazy(() => import('./BentoHome')),
  agent: lazy(() => import('./AgentHome')),
  onepager: lazy(() => import('./OnePagerHome')),
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
