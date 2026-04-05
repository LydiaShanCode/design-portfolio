import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

function IterationsViewer({ tabs = [], groups = [], resolveAsset }) {
  const [activeByGroup, setActiveByGroup] = useState(() => {
    const initial = {}
    groups.forEach((_, i) => { initial[i] = 0 })
    return initial
  })

  const setActiveTab = useCallback((groupIdx, tabIdx) => {
    setActiveByGroup((prev) => ({ ...prev, [groupIdx]: tabIdx }))
  }, [])

  if (!tabs.length || !groups.length) return null

  return (
    <div className="iterations-viewer">
      {groups.map((group, groupIdx) => (
        <IterationGroup
          key={group.group}
          group={group}
          groupIdx={groupIdx}
          tabs={tabs}
          activeIdx={activeByGroup[groupIdx] ?? 0}
          onTabChange={setActiveTab}
          resolveAsset={resolveAsset}
        />
      ))}
    </div>
  )
}

const SPRING = { type: 'spring', stiffness: 200, damping: 30, mass: 1.6 }

const CROSSFADE = { duration: 0.4, ease: 'easeInOut' }

function resolveImageEntry(entry) {
  if (!entry) return { src: null, annotations: null }
  if (typeof entry === 'string') return { src: entry, annotations: null }
  return { src: entry.src ?? null, annotations: entry.annotations ?? null }
}

function IterationGroup({ group, groupIdx, tabs, activeIdx, onTabChange, resolveAsset }) {
  const activeEntry = group.images?.[activeIdx]
  const { src: activeImageSrc, annotations } = resolveImageEntry(activeEntry)
  const resolved = activeImageSrc && resolveAsset ? resolveAsset(activeImageSrc) : activeImageSrc
  const activeImage = activeImageSrc
  const wrapRef = useRef(null)
  const [height, setHeight] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  // Cache natural dimensions per src so resize can recompute height without a load event
  const naturalDims = useRef({})

  const computeHeight = useCallback((src) => {
    const dims = naturalDims.current[src]
    if (!dims || !wrapRef.current) return
    setHeight(Math.round(wrapRef.current.offsetWidth * dims.h / dims.w))
  }, [])

  useEffect(() => {
    setImageLoaded(false)
    computeHeight(activeImageSrc)
  }, [activeIdx, activeImageSrc, computeHeight])

  useEffect(() => {
    const onResize = () => computeHeight(activeImageSrc)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeImageSrc, computeHeight])

  const handleImageLoad = useCallback((e, src) => {
    naturalDims.current[src] = { w: e.target.naturalWidth, h: e.target.naturalHeight }
    if (wrapRef.current) {
      setHeight(Math.round(wrapRef.current.offsetWidth * e.target.naturalHeight / e.target.naturalWidth))
    }
    setImageLoaded(true)
  }, [])

  return (
    <div className="iterations-group">
      <div className="iterations-header">
        <LayoutGroup id={`tabs-${groupIdx}`}>
          <div className="iterations-tabs">
            {tabs.map((label, tabIdx) => (
              <button
                key={label}
                type="button"
                className={`iterations-tab${tabIdx === activeIdx ? ' iterations-tab--active' : ''}`}
                onClick={() => onTabChange(groupIdx, tabIdx)}
                data-hoverable
              >
                {tabIdx === activeIdx && (
                  <motion.span
                    layoutId="tab-pill"
                    className="iterations-tab-pill"
                    transition={SPRING}
                  />
                )}
                <span className="iterations-tab-label">{label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <span className="iterations-group-label">{group.group}</span>
      </div>
      <div className="iterations-card-outer">
        <motion.div
          ref={wrapRef}
          className="iterations-image-wrap"
          animate={{ height }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <AnimatePresence>
            {resolved ? (
              <motion.img
                key={activeImage}
                src={resolved}
                alt={`${group.group} — ${tabs[activeIdx]}`}
                className="iterations-image"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={CROSSFADE}
                onLoad={(e) => handleImageLoad(e, activeImage)}
              />
            ) : (
              <motion.div
                key="placeholder"
                className="iterations-placeholder"
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={CROSSFADE}
              >
                No image available
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {annotations?.length > 0 && imageLoaded && (
            <motion.div
              key={activeImage}
              className="iterations-annotation-strip"
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{
                opacity: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] },
                y: { type: 'spring', stiffness: 320, damping: 32, mass: 1 },
              }}
            >
              {annotations.map((a, i) => (
                <div key={i} className="iterations-annotation-item">
                  <span className="iterations-annotation-title">{a.title}</span>
                  <p className="iterations-annotation-text">{a.text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default IterationsViewer
