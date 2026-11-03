import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
// import { DialRoot } from 'dialkit'
// import 'dialkit/styles.css'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import ProjectsGrid from './components/ProjectsGrid'
import ActivityLog from './components/ActivityLog'
import Footer from './components/Footer'
import WaterCanvas from './components/WaterCanvas'
import PondCanvas from './components/PondCanvas'
import CustomCursor from './components/CustomCursor'
import ClickSfx from './components/ClickSfx'
import HeroPlayground from './components/HeroPlayground'
import { useMajorVersion } from './components/design-versions/DesignVersionProvider'
import { HERO_PLAYGROUND_KEYS } from './data/designVersions'
import { Analytics } from '@vercel/analytics/react'

const Play = lazy(() => import('./components/Play'))
const Resume = lazy(() => import('./components/Resume'))
const ProjectPage = lazy(() => import('./components/ProjectPage'))
const About = lazy(() => import('./components/About'))
const PhishingIndexPage = lazy(() => import('./components/prototypes/PhishingIndexPage'))

function Home() {
  const major = useMajorVersion()
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

function PrototypeRoute() {
  const { pathname } = useLocation()
  if (!pathname.endsWith('/prototypes/phishing-index')) return null
  return (
    <Suspense fallback={null}>
      <PhishingIndexPage />
    </Suspense>
  )
}

function App() {
  const pond = useMajorVersion() === 'pond'

  return (
    <Router basename={import.meta.env.BASE_URL}>
      {/* <DialRoot /> */}
      {/* Agentation UI hidden
      {import.meta.env.DEV && (
        <Agentation
          endpoint="http://localhost:4747"
          onSessionCreated={(sessionId) => {
            console.log('Session started:', sessionId)
          }}
        />
      )} */}
      <Analytics />
      <PrototypeRoute />
      <div className="min-h-screen bg-white">
        <CustomCursor />
        <ClickSfx />
        {pond ? <PondCanvas /> : <WaterCanvas />}
        <Navigation />
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
              <Route path="/prototypes/*" element={null} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App
