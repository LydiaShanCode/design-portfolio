import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/dm-mono/400.css'
import './phishing-index.css'
import CampaignCard from './CampaignCard'
import FilterSelect from './FilterSelect'
import Icon from './icons'
import Sidebar from './Sidebar'
import SummaryCards from './SummaryCards'
import TopBar from './TopBar'
import {
  CAMPAIGN_TITLE,
  INITIAL_CAMPAIGNS,
  STATUS_LABEL,
  STATUS_OPTIONS,
  TOTAL_PAGES,
  TYPE_LABEL,
  TYPE_OPTIONS,
} from './data'

const TOAST_MS = 2600

function matchesQuery(campaign, query) {
  if (!query) return true
  const haystack = [CAMPAIGN_TITLE, TYPE_LABEL[campaign.type], STATUS_LABEL[campaign.status], campaign.typeDetail]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query.trim().toLowerCase())
}

function PhishingIndex({ onAction, initialNav = 'training', className = '' }) {
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const toastTimer = useRef(0)

  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS)
  const [collapsed, setCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState(initialNav)
  const [query, setQuery] = useState('')
  const [type, setType] = useState(null)
  const [status, setStatus] = useState(null)
  const [view, setView] = useState('cards')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(null)

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const notify = useCallback((message) => {
    window.clearTimeout(toastTimer.current)
    setToast({ message, key: Date.now() })
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  const act = useCallback(
    (id, label) => {
      if (onAction) onAction(id)
      else notify(`${label} isn’t part of this prototype`)
    },
    [onAction, notify],
  )

  const toggleSidebar = useCallback(() => setCollapsed((value) => !value), [])

  const onKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
      event.preventDefault()
      toggleSidebar()
    }
  }

  const selectNav = (item) => {
    setActiveNav(item.id)
    if (item.id !== 'phishing' && item.id !== 'training') act(`nav:${item.id}`, item.label)
  }

  const visible = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          matchesQuery(campaign, query) &&
          (!type || campaign.type === type) &&
          (!status || campaign.status === status),
      ),
    [campaigns, query, type, status],
  )

  const filtering = Boolean(query || type || status)

  const clearFilters = () => {
    setQuery('')
    setType(null)
    setStatus(null)
  }

  const goToPage = (next) => {
    setPage(Math.min(Math.max(next, 1), TOTAL_PAGES))
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCardAction = (actionId, campaign) => {
    if (actionId === 'end') {
      setCampaigns((list) => list.map((item) => (item.id === campaign.id ? { ...item, status: 'ended' } : item)))
      notify('Campaign ended')
    } else if (actionId === 'delete') {
      setCampaigns((list) => list.filter((item) => item.id !== campaign.id))
      notify(campaign.status === 'scheduled' ? 'Campaign cancelled' : 'Campaign deleted')
    } else if (actionId === 'duplicate') {
      setCampaigns((list) => {
        const index = list.findIndex((item) => item.id === campaign.id)
        const copy = { ...campaign, id: `${campaign.id}-copy-${Date.now()}`, status: 'draft' }
        return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)]
      })
      notify('Duplicated as a draft')
    } else {
      act(actionId, actionId === 'report' ? 'Campaign report' : 'Campaign editor')
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        className={`pi ${className}`.trim()}
        data-hide-cursor
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <TopBar collapsed={collapsed} onToggleSidebar={toggleSidebar} onAction={act} />

        <div className="pi-body">
          <Sidebar collapsed={collapsed} activeId={activeNav} onSelect={selectNav} />

          <main ref={panelRef} className="pi-main">
            <div className="pi-main__inner">
              <div className="pi-header">
                <h1 className="pi-header__title">Phishing Campaigns</h1>
                <button type="button" className="pi-button-solid" onClick={() => act('new-campaign', 'The campaign builder')}>
                  <Icon name="plus" size={16} />
                  <span>New campaign</span>
                </button>
              </div>

              <div className="pi-content">
                <SummaryCards onAction={act} />

                <div className="pi-listing">
                  <div className="pi-toolbar">
                    <label className="pi-search">
                      <Icon name="search" size={16} />
                      <input
                        type="text"
                        value={query}
                        placeholder="Search by campaign name"
                        aria-label="Search campaigns"
                        onChange={(event) => setQuery(event.target.value)}
                      />
                      {query && (
                        <button type="button" className="pi-search__clear" aria-label="Clear search" onClick={() => setQuery('')}>
                          <Icon name="close" size={14} strokeWidth={2} />
                        </button>
                      )}
                    </label>

                    <div className="pi-toolbar__filters">
                      <FilterSelect label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
                      <FilterSelect label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                      <div className="pi-segmented" role="group" aria-label="Layout">
                        {[
                          { id: 'cards', icon: 'grid', label: 'Card view' },
                          { id: 'list', icon: 'list', label: 'Compact view' },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className={`pi-segmented__button${view === option.id ? ' pi-segmented__button--active' : ''}`}
                            aria-label={option.label}
                            aria-pressed={view === option.id}
                            onClick={() => setView(option.id)}
                          >
                            <Icon name={option.icon} size={13} strokeWidth={1.75} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pi-results">
                    <div key={page} className={`pi-list pi-list--${view}`}>
                      <AnimatePresence initial={false} mode="popLayout">
                        {visible.map((campaign) => (
                          <motion.div
                            key={campaign.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.985 }}
                            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
                          >
                            <CampaignCard
                              campaign={campaign}
                              onOpen={() => act('open-campaign', 'The campaign page')}
                              onAction={handleCardAction}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {visible.length === 0 && (
                        <div className="pi-empty">
                          <p className="pi-empty__title">No campaigns match</p>
                          <p className="pi-empty__body">Try a different search or clear your filters.</p>
                          {filtering && (
                            <button type="button" className="pi-button-outline" onClick={clearFilters}>
                              Clear filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <nav className="pi-pagination" aria-label="Pagination">
                      <button
                        type="button"
                        className="pi-icon-button pi-icon-button--page"
                        aria-label="Previous page"
                        disabled={page === 1}
                        onClick={() => goToPage(page - 1)}
                      >
                        <Icon name="chevronLeft" size={18} strokeWidth={1.75} />
                      </button>
                      <p className="pi-pagination__position" aria-live="polite">
                        <strong>{page}</strong> <span>of</span> <strong>{TOTAL_PAGES}</strong>
                      </p>
                      <button
                        type="button"
                        className="pi-icon-button pi-icon-button--page"
                        aria-label="Next page"
                        disabled={page === TOTAL_PAGES}
                        onClick={() => goToPage(page + 1)}
                      >
                        <Icon name="chevronRight" size={18} strokeWidth={1.75} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.key}
              className="pi-toast"
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

export default PhishingIndex
