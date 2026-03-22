import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

function IterationGroup({ group, groupIdx, tabs, activeIdx, onTabChange, resolveAsset }) {
  const activeImage = group.images?.[activeIdx]
  const resolved = activeImage && resolveAsset ? resolveAsset(activeImage) : activeImage
  const wrapRef = useRef(null)
  const [height, setHeight] = useState('auto')

  const measureHeight = useCallback(() => {
    const img = wrapRef.current?.querySelector('img')
    if (img && img.complete && img.naturalHeight > 0) {
      setHeight(img.offsetHeight)
    }
  }, [])

  useEffect(() => {
    measureHeight()
  }, [activeIdx, measureHeight])

  useEffect(() => {
    window.addEventListener('resize', measureHeight)
    return () => window.removeEventListener('resize', measureHeight)
  }, [measureHeight])

  const handleImageLoad = useCallback((e) => {
    setHeight(e.target.offsetHeight)
  }, [])

  return (
    <div className="iterations-group">
      <div className="iterations-header">
        <div className="iterations-tabs">
          {tabs.map((label, tabIdx) => (
            <button
              key={label}
              type="button"
              className={`iterations-tab ${tabIdx === activeIdx ? 'iterations-tab--active' : ''}`}
              onClick={() => onTabChange(groupIdx, tabIdx)}
              data-hoverable
            >
              {label}
            </button>
          ))}
        </div>
        <span className="iterations-group-label">{group.group}</span>
      </div>
      <motion.div
        ref={wrapRef}
        className="iterations-image-wrap"
        animate={{ height }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <AnimatePresence mode="wait">
          {resolved ? (
            <motion.img
              key={activeImage}
              src={resolved}
              alt={`${group.group} — ${tabs[activeIdx]}`}
              className="iterations-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              onLoad={handleImageLoad}
            />
          ) : (
            <motion.div
              key="placeholder"
              className="iterations-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No image available
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default IterationsViewer
