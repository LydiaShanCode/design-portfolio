import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TrainingCampaigns from '../prototypes/training-campaigns/TrainingCampaigns'
import { MODULES as INDEX_MODULES } from '../../data/trainingCampaigns'
import AppShell from './AppShell'
import CampaignPage from './CampaignPage'
import CreateDialog from './CreateDialog'
import ContentModal from './ContentModal'
import { DEFAULT_CAMPAIGN } from './store'
import './campaign-prototype.css'

const EASE = [0.22, 0.61, 0.36, 1]
const ENROLLED = 100
const INDEX_STATUS = { draft: 'draft', launched: 'live', paused: 'paused' }

function indexCampaign(state, startDate, endDate) {
  if (!state.created) return null
  const { audience, items, status } = state
  return {
    id: 'new-campaign',
    title: state.campaign.name || 'Untitled campaign',
    status: INDEX_STATUS[status],
    type: 'fixed',
    modules: items.map((item, index) => ({
      id: `new-${item.id}`,
      title: item.title,
      minutes: item.minutes,
      icon: INDEX_MODULES[index % INDEX_MODULES.length].id,
    })),
    start: startDate,
    end: endDate,
    audience:
      audience.type === 'all'
        ? { kind: 'all', label: 'All employees', enrolled: ENROLLED }
        : { kind: 'group', label: audience.group, enrolled: ENROLLED },
    completed: status === 'draft' ? 0 : ENROLLED / 2,
    overdue: 0,
    total: ENROLLED,
  }
}

export default function CampaignPrototype({ store, className = '' }) {
  const { state, actions, startDate, endDate } = store
  const pinned = useMemo(() => indexCampaign(state, startDate, endDate), [state, startDate, endDate])
  const modalOpen = state.dialog || state.contentModal

  return (
    <div className={`cp ${modalOpen ? 'cp--modal-open' : ''} ${className}`.trim()} data-hide-cursor data-no-sfx>
      <AppShell onNavigate={actions.backToList}>
        {state.view === 'list' ? (
          <TrainingCampaigns embedded pinned={pinned} onCreate={actions.openDialog} onOpenPinned={actions.openCampaign} />
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
