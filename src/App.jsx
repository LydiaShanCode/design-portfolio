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
import CustomCursor from './components/CustomCursor'
import { Analytics } from '@vercel/analytics/react'
import { Agentation } from 'agentation'

const Play = lazy(() => import('./components/Play'))
const Resume = lazy(() => import('./components/Resume'))
const ProjectPage = lazy(() => import('./components/ProjectPage'))
const About = lazy(() => import('./components/About'))

function Home() {
  return (
    <>
      <Hero />
      <ProjectsGrid />
      <ActivityLog />
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

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      {/* <DialRoot /> */}
      {import.meta.env.DEV && (
        <Agentation
          endpoint="http://localhost:4747"
          onSessionCreated={(sessionId) => {
            console.log('Session started:', sessionId)
          }}
        />
      )}
      <Analytics />
      <div className="min-h-screen bg-white">
        <CustomCursor />
        <WaterCanvas />
        <Navigation />
        <ScrollToHash />
        <ScrollToTopOnNavigate />
        <div className="relative z-40">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<Play />} />
              <Route path="/project/:slug" element={<ProjectPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/resume" element={<Resume />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App
