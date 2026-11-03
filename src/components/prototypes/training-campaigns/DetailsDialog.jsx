import { useEffect, useRef } from 'react'
import {
  MODULES,
  STATUS_LABELS,
  audienceLabel,
  formatDate,
  formatRange,
  hasMetrics,
  percent,
} from '../../../data/trainingCampaigns'
import Icon from './Icon'
import ProgressRing from './ProgressRing'

const TYPE_LABELS = { 'one-time': 'One-time', 'auto-enroll': 'Auto-enroll', fixed: 'Fixed dates' }

function dateSummary(campaign) {
  if (!campaign.start) return 'Not scheduled yet'
  if (campaign.durationDays) return `Starts ${formatDate(campaign.start)} · ${campaign.durationDays} days`
  return formatRange(campaign.start, campaign.end)
}

export default function DetailsDialog({ campaign, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
  }

  const showMetrics = hasMetrics(campaign)

  return (
    <div className="tc-dialog" onKeyDown={onKeyDown}>
      <div className="tc-dialog__backdrop" onClick={onClose} />
      <section className="tc-dialog__panel" role="dialog" aria-modal="true" aria-label={`${campaign.title} details`}>
        <header className="tc-dialog__header">
          <div>
            <span className={`tc-status tc-status--${campaign.status}`}>{STATUS_LABELS[campaign.status]}</span>
            <h2 className="tc-dialog__title">{campaign.title}</h2>
          </div>
          <button ref={closeRef} type="button" className="tc-icon-button tc-icon-button--lg" aria-label="Close details" onClick={onClose}>
            <Icon name="plus" size={16} className="tc-dialog__close-icon" />
          </button>
        </header>

        <dl className="tc-dialog__facts">
          <div>
            <dt>Type</dt>
            <dd>{TYPE_LABELS[campaign.type]}</dd>
          </div>
          <div>
            <dt>Dates</dt>
            <dd>{dateSummary(campaign)}</dd>
          </div>
          <div>
            <dt>Audience</dt>
            <dd>{campaign.audience ? audienceLabel(campaign.audience) : 'Not selected yet'}</dd>
          </div>
        </dl>

        {showMetrics ? (
          <div className="tc-dialog__progress">
            <ProgressRing completed={campaign.completed} overdue={campaign.overdue} total={campaign.total} />
            <p>
              <strong>{percent(campaign.completed, campaign.total)}% completed</strong>
              <span>
                {campaign.completed}/{campaign.total} employees · {campaign.overdue} {campaign.endedManually ? 'incomplete' : 'overdue'}
              </span>
            </p>
          </div>
        ) : null}

        <div className="tc-dialog__modules">
          <h3>{MODULES.length} modules</h3>
          <ul>
            {MODULES.map((module) => (
              <li key={module.id}>
                <img src={module.image} alt="" width="21" height="21" />
                {module.title}
              </li>
            ))}
          </ul>
        </div>

        <footer className="tc-dialog__footer">
          <button type="button" className="tc-button tc-button--outline" onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  )
}
