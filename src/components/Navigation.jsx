import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '@src/assets/logo.svg'

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const isPlayPage = location.pathname === '/play'

  const menuItems = [
    { name: 'Work', href: '/#work', isHash: true },
    { name: 'Play', href: '/play', isHash: false },
    { name: 'About', href: '/about', isHash: false },
    { name: 'Resume', href: '/resume', isHash: false },
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
        window.history.replaceState(null, '', '/')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const isItemActive = (item) => {
    if (item.isHash && item.name === 'Work') {
      // Work is active when on home page
      return location.pathname === '/'
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
        className={`fixed top-0 left-0 right-0 z-50 text-current bg-gradient-to-b from-white/80 via-white/60 to-transparent backdrop-blur-sm transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Mobile + Medium Logo */}
            <div className="flex-shrink-0 lg:hidden">
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

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 ml-auto"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white text-current">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                item.isHash ? (
                  <button
                    key={item.name}
                    type="button"
                    onClick={handleWorkClick}
                    className="block w-full text-left px-3 py-2 text-current hover:text-current hover:bg-gray-50 rounded-md transition-colors duration-200"
                    data-hoverable
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-current hover:text-current hover:bg-gray-50 rounded-md transition-colors duration-200"
                    data-hoverable
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navigation
