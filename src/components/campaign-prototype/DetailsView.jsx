import { Icon } from './ui'
import { OverviewCard } from './sections'
import { formatDate, formatDuration, formatTime } from './dates'

function DetailCard({ icon, title, action, children }) {
  return (
    <section className="cp-card" aria-label={title}>
      <div className="cp-card__header">
        <div className="cp-card__title">
          <Icon name={icon} size={18} />
          <h2 className="cp-heading cp-heading--card">{title}</h2>
        </div>
        <div className="cp-card__tools">
          {action}
          <button type="button" className="cp-icon-button cp-icon-button--sm" aria-label={`Edit ${title}`}>
            <Icon name="pencil" size={16} />
          </button>
        </div>
      </div>
      <div className="cp-card__rule" />
      {children}
    </section>
  )
}

function Fact({ label, value }) {
  return (
    <div className="cp-fact">
      <span className="cp-fact__label">{label}</span>
      <span className="cp-fact__value">{value}</span>
    </div>
  )
}

function TimelineGroup({ title, cadence, count, days, tone, dueDay }) {
  return (
    <div className="cp-timeline__group">
      <div className="cp-timeline__meta">
        <span className="cp-timeline__title">{title}</span>
        {cadence ? (
          <span className="cp-timeline__cadence">
            {cadence}
            {count ? <em>{count}</em> : null}
          </span>
        ) : null}
      </div>
      <ul className="cp-timeline__days">
        {days.map((day) => (
          <li key={day} className="cp-timeline__day">
            <span className={`cp-timeline__dot cp-timeline__dot--${tone}`} />
            <span>
              Send on <strong>{day === '∞' ? '∞' : `Day ${day}`}</strong>
            </span>
            {day === dueDay ? <span className="cp-timeline__due">Due Date</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function buildTimeline(totalDays) {
  const urgentStart = Math.max(totalDays - 5, 2)
  const gentle = []
  for (let day = 8; day < urgentStart; day += 7) gentle.push(day)
  const urgent = []
  for (let day = urgentStart; day <= totalDays; day += 1) urgent.push(day)
  return { gentle, urgent, overdue: [totalDays + 1, totalDays + 2, '∞'] }
}

export default function DetailsView({ modules, policies, options, audience, schedule, toggles, notifications, advanced, startDate, endDate }) {
  const timeline = buildTimeline(schedule.days)
  const immediate = schedule.mode === 'immediate'
  const integrations = [advanced.vanta && 'Vanta', advanced.drata && 'Drata', advanced.bamboo && 'Bamboo HR'].filter(Boolean)

  return (
    <div className="cp-page__columns">
      <div className="cp-page__stack">
        <DetailCard icon="bookMarked" title="Training content">
          <div className="cp-content-list cp-content-list--static">
            {modules.map((module) => (
              <div key={module.id} className="cp-module-row">
                <span className={`cp-module-thumb cp-module-thumb--${module.tone}`}>
                  <img src={module.icon} alt="" draggable={false} />
                </span>
                <span className="cp-module-row__title">{module.title}</span>
                <span className="cp-module-row__time">
                  <Icon name="clockSm" size={12} />~{module.minutes}m
                </span>
                <button type="button" className="cp-icon-button cp-icon-button--md" aria-label={`Preview ${module.title}`}>
                  <Icon name="playCircle" size={20} />
                </button>
              </div>
            ))}
            {policies.map((policy) => (
              <div key={policy.id} className="cp-module-row">
                <span className="cp-module-thumb cp-module-thumb--policy">
                  <Icon name="fileText" size={16} />
                </span>
                <span className="cp-module-row__title">{policy.title}</span>
                <span className="cp-module-row__time">Policy</span>
              </div>
            ))}
          </div>
          <div className="cp-content-options">
            <div className="cp-content-options__row">
              <Icon name="thumbsUp" size={14} />
              <span>Module feedback</span>
              <span className={`cp-state-pill ${options.feedback ? 'cp-state-pill--on' : ''}`}>{options.feedback ? 'On' : 'Off'}</span>
            </div>
            <div className="cp-content-options__row">
              <Icon name="circlePlay" size={14} />
              <span>Autoplay</span>
              <span className={`cp-state-pill ${options.autoplay ? 'cp-state-pill--on' : ''}`}>{options.autoplay ? 'On' : 'Off'}</span>
            </div>
            <div className="cp-content-options__row">
              <Icon name="clipboard" size={14} />
              <span>Test out</span>
              <span className={`cp-state-pill ${options.testOut ? 'cp-state-pill--on' : ''}`}>{options.testOut ? 'On' : 'Off'}</span>
            </div>
          </div>
        </DetailCard>

        <DetailCard icon="calendarClock" title="Schedule">
          <div className="cp-facts">
            <Fact label="Starts" value={immediate ? 'Immediately on launch' : `${formatDate(startDate, 'long')} at ${formatTime(schedule.startTime)}`} />
            <Fact label="Duration" value={formatDuration(schedule.days)} />
            <Fact label="Due" value={`${formatDate(endDate, 'long')} at ${formatTime(schedule.endTime)} EST`} />
            <Fact label="Late completions" value={schedule.acceptLate ? 'Accepting late completions' : 'Not accepting late completions'} />
          </div>
        </DetailCard>

        <DetailCard icon="usersLg" title="Employees">
          <div className="cp-facts">
            <Fact label="Employee group" value={`${audience.group} (125)`} />
            <Fact label="Auto-enroll" value={toggles.autoEnroll ? 'On' : 'Off'} />
            <Fact label="Includes" value={toggles.includeExisting ? 'Existing and future members of the group' : 'Only future members of the group'} />
          </div>
        </DetailCard>

        <DetailCard
          icon="bell"
          title="Notifications"
          action={
            <button type="button" className="cp-button cp-button--ghost cp-button--sm">
              <Icon name="link" size={14} />
              <span>Preview</span>
            </button>
          }
        >
          <div className="cp-facts cp-facts--compact">
            <Fact label="Manager escalations" value={notifications.managers ? 'On' : 'Off'} />
            <Fact label="Slack notifications" value={notifications.slack ? 'On' : 'Off'} />
          </div>
          <div className="cp-card__rule" />
          <div className="cp-timeline">
            {notifications.enrollment ? <TimelineGroup title="Campaign Enrollment" days={[0]} tone="neutral" /> : null}
            {notifications.gentle && timeline.gentle.length ? (
              <TimelineGroup title="Gentle Nudges" cadence="Weekly" count={timeline.gentle.length} days={timeline.gentle} tone="neutral" />
            ) : null}
            {notifications.urgent ? <TimelineGroup title="Urgent Nudges" cadence="Daily" count={timeline.urgent.length} days={timeline.urgent} tone="warning" dueDay={schedule.days} /> : null}
            {notifications.overdue ? <TimelineGroup title="Overdue Alerts" cadence="Daily" count="∞" days={timeline.overdue} tone="danger" /> : null}
          </div>
        </DetailCard>

        <DetailCard icon="settingsAdv" title="Advanced settings">
          <div className="cp-facts">
            <Fact label="Required for Compliance" value={advanced.compliance ? 'On' : 'Off'} />
            <Fact label="Integrations" value={integrations.length ? integrations.join(', ') : 'None'} />
          </div>
        </DetailCard>
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
          previewDisabled={false}
        />
      </aside>
    </div>
  )
}
