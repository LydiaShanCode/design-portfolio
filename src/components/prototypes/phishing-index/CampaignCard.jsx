import { forwardRef } from 'react'
import Avatars from './Avatars'
import Icon from './icons'
import Menu from './Menu'
import usePopover from './usePopover'
import { CAMPAIGN_TITLE, CARD_ACTIONS, STATUS_LABEL, TYPE_LABEL } from './data'

const CampaignCard = forwardRef(function CampaignCard({ campaign, onOpen, onAction }, ref) {
  const { open, close, toggle, rootRef } = usePopover()
  const { status, stats, footnote } = campaign
  const hasStats = status === 'live' || status === 'ended'
  const statsHidden = !hasStats

  const handleAction = (item) => {
    close()
    onAction(item.id, campaign)
  }

  return (
    <article ref={ref} className={`pi-card pi-card--${status}${open ? ' pi-card--menu-open' : ''}`}>
      <div className="pi-card__head">
        <div className="pi-card__badges">
          <span className={`pi-status pi-status--${status}`}>
            {(status === 'live' || status === 'scheduled') && <span className="pi-status__dot" aria-hidden="true" />}
            {STATUS_LABEL[status]}
          </span>
          <span className="pi-cadence">
            <Icon name={campaign.cadenceIcon} size={15} />
            {campaign.cadence}
          </span>
        </div>
        <h3 className="pi-card__title">
          <button type="button" className="pi-card__open" onClick={() => onOpen(campaign)}>
            {CAMPAIGN_TITLE}
          </button>
        </h3>
      </div>

      <div className="pi-card__meta">
        <Avatars type={campaign.type} typeLabel={TYPE_LABEL[campaign.type]} typeDetail={campaign.typeDetail} />
        {campaign.scenarios && <span className="pi-card__scenarios">{campaign.scenarios}</span>}
        {campaign.scenarios && <span className="pi-card__divider" aria-hidden="true" />}
        <span className="pi-card__enrolled">
          <Icon name="users" size={12} />
          {campaign.enrolled}
        </span>
      </div>

      <div className={`pi-card__stats${statsHidden ? ' pi-card__stats--hidden' : ''}`} aria-hidden={statsHidden || undefined}>
        {stats.map((stat) => (
          <div key={stat.label} className="pi-stat">
            <div className="pi-stat__value">
              {stat.value !== '——' && <span className={`pi-stat__dot pi-stat__dot--${stat.tone}`} aria-hidden="true" />}
              <span className={stat.value === '——' ? 'pi-stat__empty' : undefined}>{stat.value}</span>
            </div>
            <span className="pi-stat__label">{stat.label}</span>
          </div>
        ))}
        {stats.length === 1 && (
          <div className="pi-stat pi-stat--ghost" aria-hidden="true">
            <div className="pi-stat__value">
              <span className="pi-stat__dot" />
              <span>52%</span>
            </div>
            <span className="pi-stat__label">416/800 Reported</span>
          </div>
        )}
        <span className="pi-stat__footnote">{footnote}</span>
      </div>

      <div ref={rootRef} className="pi-card__kebab">
        <button
          type="button"
          className="pi-icon-button"
          aria-label="Campaign actions"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
        >
          <Icon name="kebab" size={18} strokeWidth={1.75} />
        </button>
        {open && (
          <Menu
            items={CARD_ACTIONS[status].map((item) => ({ ...item, value: item.id }))}
            label="Campaign actions"
            align="end"
            onSelect={handleAction}
          />
        )}
      </div>
    </article>
  )
})

export default CampaignCard
