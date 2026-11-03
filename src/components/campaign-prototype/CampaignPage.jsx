import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge, Button, Icon } from './ui'
import { useDismiss, useEscape } from './hooks'
import { AdvancedCard, AudienceCard, NotificationsCard, OverviewCard, ScheduleCard, TrainingContentCard } from './sections'
import ResultsView from './ResultsView'
import DetailsView from './DetailsView'

const STATUS_BADGES = {
  draft: { label: 'Draft', tone: 'subtle', dot: true },
  launched: { label: 'Launched', tone: 'success', dot: true },
  paused: { label: 'Paused', tone: 'pending', dot: true },
}

function TitleBlock({ campaign, onChange }) {
  const [editing, setEditing] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setEditing(false), [])
  useDismiss(ref, editing, close)
  useEscape(editing, close)

  useEffect(() => {
    if (editing) ref.current?.querySelector('input')?.focus()
  }, [editing])

  if (editing) {
    return (
      <div className="cp-title-block cp-title-block--editing" ref={ref}>
        <input
          className="cp-title-block__input cp-title-block__input--name"
          value={campaign.name}
          aria-label="Campaign name"
          placeholder="Campaign name"
          onChange={(event) => onChange({ name: event.target.value })}
          onKeyDown={(event) => event.key === 'Enter' && close()}
        />
        <input
          className="cp-title-block__input cp-title-block__input--learner"
          value={campaign.learnerTitle}
          aria-label="Learner-facing title"
          placeholder="Add a learner-facing title"
          onChange={(event) => onChange({ learnerTitle: event.target.value })}
          onKeyDown={(event) => event.key === 'Enter' && close()}
        />
        <textarea
          className="cp-title-block__input cp-title-block__input--description"
          value={campaign.description}
          aria-label="Description"
          placeholder="Add a description"
          rows={2}
          onChange={(event) => onChange({ description: event.target.value })}
        />
        <button type="button" className="cp-title-block__done" onClick={close}>
          Done
        </button>
      </div>
    )
  }

  return (
    <button type="button" className="cp-title-block" aria-label="Edit campaign title and description" onClick={() => setEditing(true)}>
      <span className="cp-title-block__name">{campaign.name || 'Untitled campaign'}</span>
      {campaign.learnerTitle ? <span className="cp-title-block__learner">Learner title: {campaign.learnerTitle}</span> : null}
      {campaign.description ? <span className="cp-title-block__description">{campaign.description}</span> : null}
      <span className="cp-title-block__pencil" aria-hidden="true">
        <Icon name="pencil" size={16} />
      </span>
    </button>
  )
}

function KebabMenu({ onBack, onDetails }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  useEscape(open, close)
  return (
    <div className="cp-anchor cp-anchor--kebab" ref={ref}>
      <button type="button" className={`cp-button cp-button--outline cp-button--lg cp-button--square ${open ? 'cp-button--open' : ''}`} aria-label="More actions" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="resEllipsis" size={16} />
      </button>
      {open ? (
        <div className="cp-menu cp-menu--right" role="menu">
          <button
            type="button"
            role="menuitem"
            className="cp-menu__item"
            onClick={() => {
              setOpen(false)
              onDetails()
            }}
          >
            View details
          </button>
          <button
            type="button"
            role="menuitem"
            className="cp-menu__item"
            onClick={() => {
              setOpen(false)
              onBack()
            }}
          >
            Back to campaigns
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function CampaignPage({ store, onBack }) {
  const { state, actions, startDate, endDate } = store
  const { campaign, status, tab, items, options, audience, schedule, toggles, notifications, advanced } = state
  const modules = items.filter((item) => item.type !== 'policy')
  const policies = items.filter((item) => item.type === 'policy')
  const hasContent = items.length > 0
  const launched = status !== 'draft'
  const badge = STATUS_BADGES[status]

  return (
    <div className="cp-page">
      <nav className="cp-breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="cp-breadcrumb__link" onClick={onBack}>
          Training Campaign
        </button>
        <span className="cp-breadcrumb__sep" aria-hidden="true">
          /
        </span>
        <span className="cp-breadcrumb__current">{campaign.name || 'Untitled campaign'}</span>
      </nav>

      <header className="cp-page__header">
        <div className="cp-page__heading">
          <Badge tone={badge.tone} dot={badge.dot} className="cp-page__status">
            {badge.label}
          </Badge>
          <TitleBlock campaign={campaign} onChange={actions.patchCampaign} />
        </div>
        <div className="cp-page__actions">
          {launched ? (
            <>
              <Button variant="outline" size="lg" onClick={actions.togglePause}>
                {status === 'paused' ? 'Resume campaign' : 'Pause campaign'}
              </Button>
              <KebabMenu onBack={onBack} onDetails={() => actions.setTab('details')} />
            </>
          ) : (
            <Button variant="primary" size="lg" disabled={!hasContent} onClick={actions.launch} title={hasContent ? undefined : 'Add training content to launch'}>
              Launch
            </Button>
          )}
        </div>
      </header>

      {launched ? (
        <div className="cp-page__tabs cp-tabs" role="tablist">
          {['results', 'details'].map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              className={`cp-tabs__tab ${tab === name ? 'cp-tabs__tab--active' : ''}`}
              onClick={() => actions.setTab(name)}
            >
              {name === 'results' ? 'Results' : 'Details'}
            </button>
          ))}
        </div>
      ) : null}

      {launched && tab === 'results' ? (
        <ResultsView paused={status === 'paused'} />
      ) : launched ? (
        <DetailsView
          modules={modules}
          policies={policies}
          options={options}
          audience={audience}
          schedule={schedule}
          toggles={toggles}
          notifications={notifications}
          advanced={advanced}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <div className="cp-page__columns">
          <div className="cp-page__stack">
            <TrainingContentCard modules={modules} policies={policies} options={options} onEdit={actions.openContent} onAdd={actions.openContent} />
            <ScheduleCard schedule={schedule} onChange={actions.patchSchedule} />
            <AudienceCard audience={audience} onGroupChange={(group) => actions.patchAudience({ group })} toggles={toggles} onToggle={actions.patchToggles} />
            <NotificationsCard endDate={endDate} notifications={notifications} onChange={actions.patchNotifications} />
            <AdvancedCard advanced={advanced} onChange={actions.patchAdvanced} />
          </div>
          <aside className="cp-page__aside">
            <OverviewCard
              modules={modules}
              policies={policies}
              audience={audience}
              schedule={schedule}
              notifications={notifications}
              startDate={startDate}
              endDate={endDate}
              previewDisabled={!hasContent}
            />
          </aside>
        </div>
      )}
    </div>
  )
}
