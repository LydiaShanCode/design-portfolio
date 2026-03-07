import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '@src/assets/logo.svg'

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [workInView, setWorkInView] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isPlayPage = location.pathname === '/play'

  const menuItems = [
    { name: 'Work', href: '/#work', isHash: true },
    { name: 'Play', href: '/play', isHash: false },
    { name: 'About', href: '/about', isHash: false },
    { name: 'CV', href: '/resume', isHash: false },
  ]
  const leftItems = menuItems.slice(0, 2)
  const rightItems = menuItems.slice(2)

  // Handle hover visibility for Play page
  useEffect(() => {
    if (!isPlayPage) {
      setIsVisible(true)
      return
    }

    // On Play page, start hidden
    setIsVisible(false)
  }, [isPlayPage])

  useEffect(() => {
    if (location.pathname !== '/') {
      setWorkInView(false)
      return
    }
    const workSection = document.getElementById('work')
    if (!workSection) return
    const observer = new IntersectionObserver(
      ([entry]) => setWorkInView(entry.isIntersecting),
      { threshold: 0.2 }
    )
    observer.observe(workSection)
    return () => observer.disconnect()
  }, [location.pathname])

  const handleWorkClick = (e) => {
      e.preventDefault()
    setIsMobileMenuOpen(false)
    
    if (location.pathname === '/') {
      // Already on home, just scroll to work section
      const workSection = document.getElementById('work')
      if (workSection) {
        workSection.scrollIntoView({ behavior: 'smooth' })
      }
      } else {
      // Navigate to home first, then scroll after render
      navigate('/')
      setTimeout(() => {
        const workSection = document.getElementById('work')
        if (workSection) {
          workSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      if (location.hash) {
        const base = import.meta.env.BASE_URL
        window.history.replaceState(null, '', base.endsWith('/') ? base : base + '/')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const isItemActive = (item) => {
    if (item.isHash && item.name === 'Work') {
      return workInView
    }
    return location.pathname === item.href
  }

  const renderTabLabel = (item) => {
    const isActive = isItemActive(item)
    const marker = isActive ? '[ • ]' : '[   ]'
    return (
      <span className="inline-flex items-center gap-2">
        <span className="whitespace-pre text-current">{marker}</span>
        <span className="text-current">{item.name}</span>
      </span>
    )
  }

  const handleMouseEnterTop = () => {
    if (isPlayPage) {
      setIsVisible(true)
    }
  }

  const handleMouseLeaveTop = () => {
    if (isPlayPage) {
      // Only hide if not hovering over nav itself
      setTimeout(() => {
        const nav = document.querySelector('nav')
        if (nav && !nav.matches(':hover')) {
          setIsVisible(false)
        }
      }, 100)
    }
  }

  const handleNavMouseEnter = () => {
    if (isPlayPage) {
      setIsVisible(true)
    }
  }

  const handleNavMouseLeave = () => {
    if (isPlayPage) {
      setIsVisible(false)
    }
  }

  return (
    <>
      {/* Invisible hover zone for Play page - only visible when nav is hidden */}
      {isPlayPage && !isVisible && (
        <div 
          className="fixed top-0 left-0 right-0 h-20 z-[60] pointer-events-auto"
          onMouseEnter={handleMouseEnterTop}
          onMouseLeave={handleMouseLeaveTop}
        />
      )}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 hidden md:block text-current bg-gradient-to-b from-white/80 via-white/60 to-transparent backdrop-blur-sm transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Tablet Logo (hidden on mobile, shown md to lg) */}
            <div className="hidden flex-shrink-0 md:block lg:hidden">
              <Link to="/" data-hoverable onClick={handleLogoClick}>
                <img src={logo} alt="Lydia" className="h-6 w-6" />
              </Link>
            </div>

            {/* Medium Desktop Menu (md to <lg) */}
            <div className="hidden md:flex lg:hidden ml-auto space-x-8">
              {menuItems.map((item) => (
                item.isHash ? (
                  <button
                    key={item.name}
                    type="button"
                    onClick={handleWorkClick}
                    className="text-current hover:text-current transition-colors duration-200"
                    data-hoverable
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-current hover:text-current transition-colors duration-200"
                    data-hoverable
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            {/* Large Desktop Layout (lg and up) */}
            <div className="hidden lg:grid w-full grid-cols-3 items-center">
              <div className="flex items-center gap-8 justify-self-start">
                {leftItems.map((item) => (
                  item.isHash ? (
                    <button
                      key={item.name}
                      type="button"
                      onClick={handleWorkClick}
                      className="hover:text-current transition-colors duration-200"
                      data-hoverable
                    >
                      {renderTabLabel(item)}
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="hover:text-current transition-colors duration-200"
                      data-hoverable
                    >
                      {renderTabLabel(item)}
                    </Link>
                  )
                ))}
              </div>

              <div className="flex-shrink-0 justify-self-center">
                <Link to="/" data-hoverable onClick={handleLogoClick}>
                  <img src={logo} alt="Lydia" className="h-6 w-6" />
                </Link>
              </div>

              <div className="flex items-center gap-8 justify-self-end">
                {rightItems.map((item) => (
                  item.isHash ? (
                    <button
                      key={item.name}
                      type="button"
                      onClick={handleWorkClick}
                      className="hover:text-current transition-colors duration-200"
                      data-hoverable
                    >
                      {renderTabLabel(item)}
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="hover:text-current transition-colors duration-200"
                      data-hoverable
                    >
                      {renderTabLabel(item)}
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* Tablet menu button (hidden on mobile, shown md-down to lg) */}
            <button
              className="hidden p-2 ml-auto"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-hoverable
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile bottom nav bar */}
      <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 md:hidden">
        <div className="inline-flex items-center gap-5 rounded-full border border-white/30 bg-white/60 px-6 py-2.5 shadow-lg backdrop-blur-xl">
          {leftItems.map((item) =>
            item.isHash ? (
              <button
                key={item.name}
                type="button"
                onClick={handleWorkClick}
                className={`text-[11px] tracking-wide transition-colors ${
                  isItemActive(item) ? 'font-medium text-black' : 'text-black/50'
                }`}
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                className={`text-[11px] tracking-wide transition-colors ${
                  isItemActive(item) ? 'font-medium text-black' : 'text-black/50'
                }`}
              >
                {item.name}
              </Link>
            )
          )}
          <Link to="/" onClick={handleLogoClick} className="flex-shrink-0">
            <img src={logo} alt="Home" className="block h-3.5 w-3.5" />
          </Link>
          {rightItems.map((item) =>
            item.isHash ? (
              <button
                key={item.name}
                type="button"
                onClick={handleWorkClick}
                className={`text-[11px] tracking-wide transition-colors ${
                  isItemActive(item) ? 'font-medium text-black' : 'text-black/50'
                }`}
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                className={`text-[11px] tracking-wide transition-colors ${
                  isItemActive(item) ? 'font-medium text-black' : 'text-black/50'
                }`}
              >
                {item.name}
              </Link>
            )
          )}
        </div>
      </div>
    </>
  )
}

export default Navigation
