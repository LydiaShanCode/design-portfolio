import { useId, useRef, useState } from 'react'
import {
  STATUS_LABELS,
  audienceLabel,
  formatDate,
  formatRange,
  getEndingSoonDays,
  getModules,
  getStartingSoonDays,
  hasMetrics,
  percent,
} from '../../../data/trainingCampaigns'
import CampaignMenu from './CampaignMenu'
import CampaignThumbnail from './CampaignThumbnail'
import Icon from './Icon'
import ProgressRing from './ProgressRing'
import { shouldFlip } from './placement'

const TYPE_BADGES = {
  'one-time': { icon: 'calendar', label: 'One-time', size: 15 },
  'auto-enroll': { icon: 'zap', label: 'Auto-enroll', size: 12 },
}

const MENU_HEIGHT = 200
const STATUS_DOTS = { live: 'success', scheduled: 'info', 'past-due': 'danger' }

export function getMenuGroups(campaign) {
  const manage = [{ key: 'view', icon: 'file-text', label: 'View details' }]
  if (campaign.status !== 'ended') manage.push({ key: 'add', icon: 'user-plus', label: 'Add employees' })
  manage.push(
    { key: 'preview', icon: 'link', label: 'Preview link' },
    { key: 'duplicate', icon: 'copy-plus', label: 'Duplicate' },
  )
  const groups = [manage]
  if (campaign.status === 'live' || campaign.status === 'past-due') {
    groups.push([{ key: 'end', icon: 'circle-minus', label: 'End campaign', destructive: true }])
  }
  return groups
}

function MetaBadge({ icon, children, size = 15 }) {
  return (
    <span className="tc-chip tc-chip--meta">
      <Icon name={icon} size={size} />
      {children}
    </span>
  )
}

function StatusRow({ campaign }) {
  const { status, type } = campaign
  const endingIn = getEndingSoonDays(campaign)
  const startingIn = getStartingSoonDays(campaign)
  const typeBadge = TYPE_BADGES[type]

  return (
    <div className="tc-card__status">
      <span className={`tc-status tc-status--${status}`}>
        {STATUS_DOTS[status] ? <span className={`tc-dot tc-dot--${STATUS_DOTS[status]}`} aria-hidden="true" /> : null}
        {STATUS_LABELS[status]}
      </span>
      {endingIn !== null ? (
        <span className="tc-inline-meta">
          <Icon name="calendar-clock" size={12} />
          Ends in {endingIn}d
        </span>
      ) : null}
      {startingIn !== null ? (
        <span className="tc-inline-meta">
          <Icon name="calendar-clock" size={12} />
          Starts in {startingIn}d
        </span>
      ) : null}
      {typeBadge && status !== 'draft' ? (
        <span className="tc-inline-meta">
          <Icon name={typeBadge.icon} size={status === 'scheduled' ? 12 : typeBadge.size} />
          {typeBadge.label}
        </span>
      ) : null}
    </div>
  )
}

function DateMeta({ campaign }) {
  if (campaign.status === 'draft') {
    return (
      <MetaBadge icon="calendar">
        <span aria-label="No dates set">–––</span>
      </MetaBadge>
    )
  }

  const icon = campaign.dateIcon || 'calendar'
  if (campaign.durationDays) {
    return (
      <>
        <MetaBadge icon="calendar">{formatDate(campaign.start)}</MetaBadge>
        <MetaBadge icon="clock">{campaign.durationDays} days</MetaBadge>
      </>
    )
  }
  return <MetaBadge icon={icon}>{formatRange(campaign.start, campaign.end)}</MetaBadge>
}

function AudienceMeta({ campaign }) {
  const { audience } = campaign
  if (!audience) {
    return (
      <MetaBadge icon="users">
        <span aria-label="No audience selected">–––</span>
      </MetaBadge>
    )
  }
  const icon = audience.kind === 'all' ? 'building' : 'users'
  return <MetaBadge icon={icon}>{audienceLabel(audience)}</MetaBadge>
}

function Metrics({ campaign }) {
  const { completed, overdue, total } = campaign
  const overdueLabel = campaign.endedManually && overdue > 0 ? 'incomplete' : 'overdue'
  return (
    <div className="tc-card__metrics">
      <ProgressRing completed={completed} overdue={overdue} total={total} />
      <div className="tc-metric">
        <div className="tc-metric__value">
          <span className="tc-dot tc-dot--success" aria-hidden="true" />
          {percent(completed, total)}%
        </div>
        <span className="tc-metric__label">
          {completed}/{total} completed
        </span>
      </div>
      <div className="tc-metric">
        <div className="tc-metric__value">
          <span className="tc-dot tc-dot--danger" aria-hidden="true" />
          {percent(overdue, total)}%
        </div>
        <span className="tc-metric__label">
          {overdue}/{total} {overdueLabel}
        </span>
      </div>
    </div>
  )
}

export default function CampaignCard({
  campaign,
  index,
  menuOpen,
  onMenuToggle,
  onMenuClose,
  onMenuAction,
  onOpenDetails,
  onContinueEditing,
}) {
  const triggerRef = useRef(null)
  const menuId = useId()
  const triggerId = useId()
  const isDraft = campaign.status === 'draft'
  const [menuFlip, setMenuFlip] = useState(false)

  const toggleMenu = () => {
    if (!menuOpen) setMenuFlip(shouldFlip(triggerRef.current, MENU_HEIGHT))
    onMenuToggle()
  }

  return (
    <article
      className="tc-card"
      data-status={campaign.status}
      data-menu-open={menuOpen || undefined}
      style={{ '--tc-index': index }}
    >
      <CampaignThumbnail
        modules={getModules(campaign)}
        title={campaign.title}
        onOpen={onOpenDetails}
      />

      <div className="tc-card__main">
        <StatusRow campaign={campaign} />
        <div className="tc-card__body">
          <div className="tc-card__info">
            <h3 className="tc-card__title">
              <button type="button" className="tc-card__title-button" onClick={onOpenDetails}>
                {campaign.title}
              </button>
            </h3>
            <div className="tc-card__meta">
              <DateMeta campaign={campaign} />
              <span className="tc-card__divider" aria-hidden="true" />
              <AudienceMeta campaign={campaign} />
            </div>
          </div>
          {hasMetrics(campaign) ? <Metrics campaign={campaign} /> : null}
        </div>
      </div>

      <div className="tc-card__actions">
        {isDraft ? (
          <button type="button" className="tc-button tc-button--outline tc-button--sm" onClick={onContinueEditing}>
            Continue editing
          </button>
        ) : null}
        <div className="tc-card__menu-anchor">
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            className="tc-icon-button"
            aria-label={`Actions for ${campaign.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={toggleMenu}
          >
            <Icon name="ellipsis-vertical" size={18} />
          </button>
          {menuOpen ? (
            <CampaignMenu
              id={menuId}
              labelledBy={triggerId}
              groups={getMenuGroups(campaign)}
              placement={menuFlip ? 'above' : 'below'}
              onSelect={(key) => onMenuAction(key, campaign)}
              onClose={({ restoreFocus }) => {
                onMenuClose()
                if (restoreFocus) triggerRef.current?.focus()
              }}
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}
