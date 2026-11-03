import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/geist/500.css'
import {
  PAGE_SIZE,
  createDraft,
  createInitialCampaigns,
  duplicateCampaign,
  endCampaign,
  matchesFilters,
  sortCampaigns,
} from '../../../data/trainingCampaigns'
import CampaignCard from './CampaignCard'
import DetailsDialog from './DetailsDialog'
import Icon from './Icon'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import TopBar from './TopBar'
import './training-campaigns.css'

const TOAST_MS = 2600
const COMPACT_WIDTH = 900

export default function TrainingCampaigns({ fluid = false, onReady }) {
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const toastTimer = useRef(0)

  const [campaigns, setCampaigns] = useState(createInitialCampaigns)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [menuId, setMenuId] = useState(null)
  const [detailsId, setDetailsId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    onReady?.()
  }, [onReady])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !fluid) return undefined
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width < COMPACT_WIDTH) setSidebarOpen(false)
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [fluid])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const notify = useCallback((message) => {
    window.clearTimeout(toastTimer.current)
    setToast({ message, key: Date.now() })
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  const filtered = useMemo(
    () => sortCampaigns(campaigns).filter((campaign) => matchesFilters(campaign, { query, type })),
    [campaigns, query, type],
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const detailsCampaign = campaigns.find((campaign) => campaign.id === detailsId)

  const resetScroll = () => scrollRef.current?.scrollTo({ top: 0 })

  const goToPage = (next) => {
    setPage(next)
    setMenuId(null)
    resetScroll()
  }

  const updateFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
    setMenuId(null)
  }

  useEffect(() => {
    if (!menuId) return undefined
    const onPointerDown = (event) => {
      if (!event.target.closest('.tc-card__menu-anchor')) setMenuId(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuId])

  const handleMenuAction = (key, campaign) => {
    setMenuId(null)
    if (key === 'view') setDetailsId(campaign.id)
    if (key === 'add') notify('Audience picker opens here in the full product')
    if (key === 'preview') {
      navigator.clipboard?.writeText(`https://app.adaptivesecurity.com/preview/${campaign.id}`).catch(() => {})
      notify('Preview link copied')
    }
    if (key === 'duplicate') {
      const copy = duplicateCampaign(campaign)
      setCampaigns((current) => [copy, ...current])
      setType('all')
      setQuery('')
      setPage(1)
      notify('Duplicated as a draft')
    }
    if (key === 'end') {
      setCampaigns((current) => current.map((item) => (item.id === campaign.id ? endCampaign(item) : item)))
      notify('Campaign ended')
    }
  }

  const createCampaign = () => {
    const draft = createDraft()
    setCampaigns((current) => [draft, ...current])
    setType('all')
    setQuery('')
    setPage(1)
    resetScroll()
    notify('New draft created')
  }

  const onRootKeyDown = (event) => {
    if (event.key === 'Escape' && menuId) {
      event.preventDefault()
      event.stopPropagation()
      setMenuId(null)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setType('all')
    setPage(1)
  }

  const navigate = (label) => notify(`${label} isn't part of this prototype`)

  return (
    <div
      ref={rootRef}
      className={`tc${fluid ? ' tc--fluid' : ''}`}
      data-hide-cursor
      data-sidebar={sidebarOpen ? 'open' : 'closed'}
      onKeyDown={onRootKeyDown}
    >
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onNavigate={navigate} />

      <div className="tc-body">
        <aside id="tc-sidebar" className="tc-sidebar" aria-hidden={!sidebarOpen} inert={!sidebarOpen ? '' : undefined}>
          <div className="tc-sidebar__inner">
            <Sidebar onNavigate={navigate} />
            <div className="tc-sidebar__footer">
              <button type="button" className="tc-nav__item" onClick={() => navigate('Settings')}>
                <Icon name="nav-settings" size={16} />
                <span className="tc-nav__label">Settings</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="tc-panel">
          <div ref={scrollRef} className="tc-panel__scroll">
            <div className="tc-panel__inner">
              <header className="tc-header">
                <h1 className="tc-header__title">Training Campaigns</h1>
                <button type="button" className="tc-button tc-button--primary" aria-label="New campaign" onClick={createCampaign}>
                  <Icon name="plus" size={16} />
                  New<span className="tc-button__optional"> campaign</span>
                </button>
              </header>

              <Toolbar
                query={query}
                onQueryChange={updateFilter(setQuery)}
                type={type}
                onTypeChange={updateFilter(setType)}
                view={view}
                onViewChange={setView}
              />

              <section className="tc-list" data-view={view} aria-label="Training campaigns" aria-live="polite">
                {visible.map((campaign, index) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={index}
                    menuOpen={menuId === campaign.id}
                    onMenuToggle={() => setMenuId((current) => (current === campaign.id ? null : campaign.id))}
                    onMenuClose={() => setMenuId(null)}
                    onMenuAction={handleMenuAction}
                    onOpenDetails={() => setDetailsId(campaign.id)}
                    onContinueEditing={() => notify('The campaign builder opens here in the full product')}
                  />
                ))}
                {visible.length === 0 ? (
                  <div className="tc-empty">
                    <p className="tc-empty__title">No campaigns match your filters</p>
                    <p className="tc-empty__body">Try a different name or clear the type filter.</p>
                    <button type="button" className="tc-button tc-button--outline" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </div>
                ) : null}
              </section>

              {visible.length > 0 ? (
                <nav className="tc-pagination" aria-label="Pagination">
                  <button
                    type="button"
                    className="tc-icon-button tc-icon-button--lg"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <Icon name="chevron-left" size={18} />
                  </button>
                  <p className="tc-pagination__position">
                    <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </p>
                  <button
                    type="button"
                    className="tc-icon-button tc-icon-button--lg"
                    aria-label="Next page"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <Icon name="chevron-right" size={18} />
                  </button>
                </nav>
              ) : null}
            </div>
          </div>

          {toast ? (
            <div key={toast.key} className="tc-toast" role="status">
              {toast.message}
            </div>
          ) : null}
        </main>
      </div>

      {detailsCampaign ? <DetailsDialog campaign={detailsCampaign} onClose={() => setDetailsId(null)} /> : null}
    </div>
  )
}
