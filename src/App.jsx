import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import ProjectsGrid from './components/ProjectsGrid'
import ActivityLog from './components/ActivityLog'
import Footer from './components/Footer'
import WaterCanvas from './components/WaterCanvas'
import PondCanvas from './components/PondCanvas'
import CustomCursor from './components/CustomCursor'
import ButtonSound from './components/ButtonSound'
import HeroPlayground from './components/HeroPlayground'
import ColumnHome from './components/ColumnHome'
import { useMajorVersion } from './components/design-versions/DesignVersionProvider'
import { HERO_PLAYGROUND_KEYS } from './data/designVersions'
import { Analytics } from '@vercel/analytics/react'

const Play = lazy(() => import('./components/Play'))
const Resume = lazy(() => import('./components/Resume'))
const ProjectPage = lazy(() => import('./components/ProjectPage'))
const About = lazy(() => import('./components/About'))
const DevTools = import.meta.env.DEV ? lazy(() => import('./components/DevTools')) : null

function Home() {
  const major = useMajorVersion()
  if (major === 'column') return <ColumnHome />
  return (
    <>
      {HERO_PLAYGROUND_KEYS.includes(major) ? <HeroPlayground version={major} /> : <Hero />}
      <div className="intro-reveal">
        <ProjectsGrid />
        <ActivityLog />
      </div>
    </>
  )
}

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const element = document.getElementById(id)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash, location.pathname])

  return null
}

function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

// The column home carries its own name and links, so the shared chrome steps aside there
function SiteChrome({ children }) {
  const major = useMajorVersion()
  const { pathname } = useLocation()
  return major === 'column' && pathname === '/' ? null : children
}

function App() {
  const pond = useMajorVersion() === 'pond'

  return (
    <Router basename={import.meta.env.BASE_URL}>
      {DevTools && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
      <Analytics />
      <div className="min-h-screen bg-[var(--color-page)]">
        <CustomCursor />
        <ButtonSound />
        <SiteChrome>
          {pond ? <PondCanvas /> : <WaterCanvas />}
          <Navigation />
        </SiteChrome>
        <ScrollToHash />
        <ScrollToTopOnNavigate />
        <div className="relative z-40">
          <Suspense fallback={<div className="route-fallback" aria-hidden="true" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<Play />} />
              <Route path="/project/:slug" element={<ProjectPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/resume" element={<Resume />} />
            </Routes>
          </Suspense>
          <SiteChrome>
            <Footer />
          </SiteChrome>
        </div>
      </div>
    </Router>
  )
}

export default App
