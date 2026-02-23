import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import ProjectsGrid from './components/ProjectsGrid'
import ActivityLog from './components/ActivityLog'
import Footer from './components/Footer'
import Play from './components/Play'
import WaterCanvas from './components/WaterCanvas'
import CustomCursor from './components/CustomCursor'
import ComingSoon from './components/ComingSoon'

function Home() {
  return (
    <>
      <Hero />
      <ProjectsGrid />
      <ActivityLog />
      <Footer />
    </>
  )
}

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash, location.pathname])

  return null
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-white">
        <CustomCursor />
        <WaterCanvas />
        <Navigation />
        <ScrollToHash />
        <div className="relative z-40">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route
            path="/about"
            element={
              <ComingSoon
                title="About"
                message="The story, the process, and the small details are on the way."
              />
            }
          />
          <Route
            path="/resume"
            element={
              <ComingSoon
                title="Resume"
                message="I am polishing the latest highlights and will post the full resume soon."
              />
            }
          />
        </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
