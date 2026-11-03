import { Button, Icon, ToneStatus } from './ui'
import { LIST_SCHEDULED, LIST_TRIGGERED } from './data'
import assets from './assets'

function FilterButton() {
  return (
    <button type="button" className="cp-button cp-button--outline cp-button--sm">
      <span>Filter by Status</span>
      <Icon name="listChevronDown" size={14} />
    </button>
  )
}

function SectionHeader({ icon, title }) {
  return (
    <div className="cp-list__section-head">
      <div className="cp-list__section-title">
        <img src={assets[icon]} alt="" width="28" height="28" draggable={false} />
        <h2>{title}</h2>
      </div>
      <FilterButton />
    </div>
  )
}

function Table({ columns, rows, renderRow, onOpen }) {
  return (
    <div className="cp-table" role="table">
      <div className="cp-table__head" role="row" style={{ gridTemplateColumns: columns.template }}>
        {columns.labels.map((label) => (
          <span key={label} role="columnheader">
            {label}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          className={`cp-table__row ${row.openable ? 'cp-table__row--link' : ''}`}
          role="row"
          tabIndex={row.openable ? 0 : undefined}
          style={{ gridTemplateColumns: columns.template }}
          onClick={row.openable ? onOpen : undefined}
          onKeyDown={row.openable ? (event) => event.key === 'Enter' && onOpen() : undefined}
        >
          {renderRow(row)}
        </div>
      ))}
    </div>
  )
}

export default function CampaignList({ onNew, onOpenNew, newCampaign }) {
  return (
    <div className="cp-list">
      <div className="cp-list__header">
        <h1 className="cp-heading cp-heading--page">Training Campaigns</h1>
        <Button variant="primary" size="lg" onClick={onNew} data-cp-tour="new-campaign">
          New Campaign
        </Button>
      </div>

      <section className="cp-list__section">
        <SectionHeader icon="listTriggered" title="Triggered (1)" />
        <Table
          columns={{
            template: '2.2fr 1.1fr 0.9fr 0.9fr 1fr 0.8fr',
            labels: ['Title', 'Campaign Status', '# Enrolled', '# Overdue', 'Activated on', 'Length'],
          }}
          rows={LIST_TRIGGERED}
          renderRow={(row) => (
            <>
              <span className="cp-table__title">{row.title}</span>
              <span>
                <ToneStatus status={row.status} />
              </span>
              <span>{row.enrolled}</span>
              <span>{row.overdue}</span>
              <span>{row.activated}</span>
              <span>{row.length}</span>
            </>
          )}
        />
      </section>

      <section className="cp-list__section">
        <SectionHeader icon="listScheduled" title={`Scheduled (${newCampaign ? 2 : 1})`} />
        <Table
          columns={{
            template: '2.2fr 1.1fr 0.9fr 0.9fr 1fr',
            labels: ['Title', 'Campaign Status', 'Completion', 'Start Date', 'Due Date'],
          }}
          rows={newCampaign ? [newCampaign, ...LIST_SCHEDULED] : LIST_SCHEDULED}
          onOpen={onOpenNew}
          renderRow={(row) => (
            <>
              <span className="cp-table__title">{row.title}</span>
              <span>
                <ToneStatus status={row.status} />
              </span>
              <span>{row.completion}</span>
              <span>{row.start}</span>
              <span>{row.due}</span>
            </>
          )}
        />
      </section>
    </div>
  )
}
