import { useEffect, useRef } from 'react'

function HeroPlayground({ version }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const controller = new AbortController()
    import('../lib/heroPlayground').then(({ mountHeroPlayground }) =>
      mountHeroPlayground(host, version, controller.signal),
    )
    return () => controller.abort()
  }, [version])

  return <section id="hero" ref={hostRef} className="hero-playground" />
}

export default HeroPlayground
