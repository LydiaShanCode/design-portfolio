import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './AppShell'
import CampaignList from './CampaignList'
import CampaignPage from './CampaignPage'
import CreateDialog from './CreateDialog'
import ContentModal from './ContentModal'
import { formatDate, parseDate } from './dates'
import { DEFAULT_CAMPAIGN } from './store'
import './campaign-prototype.css'

const EASE = [0.22, 0.61, 0.36, 1]

function listRow(state, startDate, endDate) {
  if (!state.created) return null
  const short = (iso) => formatDate(parseDate(iso), 'short').replace(/^(\w{3})\w*/, '$1.')
  return {
    id: 'new-campaign',
    openable: true,
    title: state.campaign.name || 'Untitled campaign',
    status: state.status === 'draft' ? 'draft' : state.status === 'paused' ? 'paused' : 'live',
    completion: state.status === 'draft' ? '-' : '0%',
    start: short(startDate),
    due: state.status === 'draft' ? '-' : short(endDate),
  }
}

export default function CampaignPrototype({ store, className = '' }) {
  const { state, actions, startDate, endDate } = store
  const newCampaign = useMemo(() => listRow(state, startDate, endDate), [state, startDate, endDate])
  const modalOpen = state.dialog || state.contentModal

  return (
    <div className={`cp ${modalOpen ? 'cp--modal-open' : ''} ${className}`.trim()} data-hide-cursor data-no-sfx>
      <AppShell onNavigate={actions.backToList}>
        {state.view === 'list' ? (
          <CampaignList onNew={actions.openDialog} onOpenNew={actions.openCampaign} newCampaign={newCampaign} />
        ) : (
          <CampaignPage store={store} onBack={actions.backToList} />
        )}
      </AppShell>

      <AnimatePresence>
        {state.dialog ? (
          <motion.div key="dialog" className="cp-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.16, ease: EASE } }} transition={{ duration: 0.2, ease: EASE }}>
            <CreateDialog initial={DEFAULT_CAMPAIGN} onCancel={actions.closeDialog} onCreate={actions.createCampaign} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {state.contentModal ? (
          <motion.div key="content" className="cp-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.16, ease: EASE } }} transition={{ duration: 0.2, ease: EASE }}>
            <ContentModal initialItems={state.items} initialOptions={state.options} onSave={actions.saveContent} onClose={actions.closeContent} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
