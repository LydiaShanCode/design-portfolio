import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import assets from './assets'
import { Badge, EmailThumb, Icon, Radio, SlackMark, Switch } from './ui'
import { useDismiss } from './hooks'
import { AUDIENCE_GROUPS, DURATION_OPTIONS, REMINDERS } from './data'
import { addDays, formatDate, formatDuration, formatTime, parseDate } from './dates'

function CardHeader({ icon, iconSize = 18, title, action, subtitle }) {
  return (
    <div className="cp-card__header">
      <div className="cp-card__heading">
        <div className="cp-card__title">
          <Icon name={icon} size={iconSize} />
          <h2 className="cp-heading cp-heading--card">{title}</h2>
        </div>
        {subtitle ? <p className="cp-card__subtitle">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

function StatePill({ on }) {
  return <span className={`cp-state-pill ${on ? 'cp-state-pill--on' : ''}`}>{on ? 'On' : 'Off'}</span>
}

function ModuleThumb({ module }) {
  return (
    <span className={`cp-module-thumb cp-module-thumb--${module.tone}`}>
      <img src={module.icon} alt="" draggable={false} />
    </span>
  )
}

export function TrainingContentCard({ modules, policies, options, onEdit, onAdd }) {
  if (modules.length === 0 && policies.length === 0) {
    return (
      <section className="cp-card cp-empty-content" aria-label="Training content">
        <div className="cp-empty-content__grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="cp-empty-content__tile" />
          ))}
        </div>
        <div className="cp-empty-content__body">
          <span className="cp-empty-content__icon" aria-hidden="true">
            <span />
            <span />
            <span className="cp-empty-content__plus">+</span>
          </span>
          <p className="cp-empty-content__title">No training content yet</p>
          <p className="cp-empty-content__text">Content you select will appear here.</p>
          <button type="button" className="cp-button cp-button--primary cp-button--md" onClick={onAdd}>
            <span className="cp-button__plus" aria-hidden="true">
              +
            </span>
            <span>Add content</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="cp-card" aria-label="Training content">
      <CardHeader
        icon="bookMarked"
        title="Training content"
        action={
          <button type="button" className="cp-icon-button cp-icon-button--sm" aria-label="Edit training content" onClick={onEdit}>
            <Icon name="pencil" size={16} />
          </button>
        }
      />
      <div className="cp-card__rule" />
      <div className="cp-content-list">
        <AnimatePresence initial={false}>
          {modules.map((module) => (
            <motion.div
              key={module.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
              className="cp-module-row"
            >
              <ModuleThumb module={module} />
              <span className="cp-module-row__title">{module.title}</span>
              <span className="cp-module-row__time">
                <Icon name="clockSm" size={12} />~{module.minutes}m
              </span>
              <button type="button" className="cp-icon-button cp-icon-button--md" aria-label={`Preview ${module.title}`}>
                <Icon name="playCircle" size={20} />
              </button>
            </motion.div>
          ))}
          {policies.map((policy) => (
            <motion.div
              key={policy.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
              className="cp-module-row"
            >
              <span className="cp-module-thumb cp-module-thumb--policy">
                <Icon name="fileText" size={16} />
              </span>
              <span className="cp-module-row__title">{policy.title}</span>
              <span className="cp-module-row__time">Policy</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="cp-content-options">
        <div className="cp-content-options__row">
          <Icon name="thumbsUp" size={14} />
          <span>Module feedback</span>
          <StatePill on={options.feedback} />
        </div>
        <div className="cp-content-options__row">
          <Icon name="circlePlay" size={14} />
          <span>Autoplay</span>
          <StatePill on={options.autoplay} />
        </div>
        <div className="cp-content-options__row">
          <Icon name="clipboard" size={14} />
          <span>Test out</span>
          <StatePill on={options.testOut} />
        </div>
      </div>
    </section>
  )
}

function DateField({ value, onChange, disabled, label }) {
  const inputRef = useRef(null)
  return (
    <div className={`cp-datefield ${disabled ? 'cp-datefield--disabled' : ''}`}>
      <input ref={inputRef} type="date" value={value} disabled={disabled} aria-label={label} onChange={(event) => event.target.value && onChange(event.target.value)} />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        className="cp-datefield__button"
        onClick={() => inputRef.current?.showPicker?.()}
      >
        <Icon name="calendarSm" size={12} />
      </button>
    </div>
  )
}

function TimeField({ value, onChange, disabled, label }) {
  const inputRef = useRef(null)
  return (
    <div className={`cp-timefield ${disabled ? 'cp-timefield--disabled' : ''}`}>
      <input ref={inputRef} type="time" value={value} disabled={disabled} aria-label={label} onChange={(event) => event.target.value && onChange(event.target.value)} />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        className="cp-timefield__button"
        onClick={() => inputRef.current?.showPicker?.()}
      >
        <Icon name="clockField" size={14} />
      </button>
    </div>
  )
}

function DurationSelect({ days, onChange }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  const options = DURATION_OPTIONS.some((option) => option.days === days)
    ? DURATION_OPTIONS
    : [...DURATION_OPTIONS, { label: `${days} days`, days }].sort((a, b) => a.days - b.days)
  const current = options.find((option) => option.days === days)
  return (
    <div className="cp-anchor cp-anchor--duration" ref={ref}>
      <button type="button" className={`cp-select cp-select--field ${open ? 'cp-select--open' : ''}`} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(!open)}>
        <span>{current.label}</span>
        <Icon name="chevronDown" size={16} className="cp-select__chevron" />
      </button>
      {open ? (
        <div className="cp-menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              key={option.days}
              role="option"
              aria-selected={option.days === days}
              className="cp-menu__item"
              onClick={() => {
                onChange(option.days)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ScheduleCard({ schedule, onChange }) {
  const immediate = schedule.mode === 'immediate'
  const endDate = addDays(parseDate(schedule.startDate), schedule.days - 1)
  const endValue = formatDate(endDate, 'iso')

  const handleEndDate = (value) => {
    const days = Math.round((parseDate(value) - parseDate(schedule.startDate)) / 86400000) + 1
    if (days >= 1 && days <= 365) onChange({ days })
  }

  return (
    <section className="cp-card" aria-label="Schedule">
      <CardHeader icon="calendarClock" title="Schedule" />
      <div className="cp-card__rule" />
      <div className="cp-card__body cp-schedule">
        <div className="cp-schedule__modes" role="radiogroup" aria-label="Start">
          <button
            type="button"
            role="radio"
            aria-checked={!immediate}
            className={`cp-mode ${!immediate ? 'cp-mode--selected' : ''}`}
            onClick={() => onChange({ mode: 'scheduled' })}
          >
            <Radio checked={!immediate} />
            <span className="cp-mode__text">
              <span className="cp-mode__label">
                <Icon name="calendar" size={15} />
                Schedule on
              </span>
              <span className="cp-mode__hint">Start on fixed date and time</span>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={immediate}
            className={`cp-mode ${immediate ? 'cp-mode--selected' : ''}`}
            onClick={() => onChange({ mode: 'immediate' })}
          >
            <Radio checked={immediate} />
            <span className="cp-mode__text">
              <span className="cp-mode__label">
                <Icon name="rocket" size={15} />
                Immediately launch
              </span>
              <span className="cp-mode__hint">Enroll when the campaign launches</span>
            </span>
          </button>
        </div>

        <div className="cp-schedule__fields">
          <div className="cp-schedule__row">
            <span className="cp-schedule__label">Start date</span>
            <DateField value={schedule.startDate} disabled={immediate} onChange={(startDate) => onChange({ startDate })} label="Start date" />
            <TimeField value={schedule.startTime} disabled={immediate} onChange={(startTime) => onChange({ startTime })} label="Start time" />
            <span className="cp-schedule__zone">EDT</span>
          </div>
          <div className="cp-schedule__row">
            <span className="cp-schedule__label">Duration</span>
            <DurationSelect days={schedule.days} onChange={(days) => onChange({ days })} />
            <span className="cp-schedule__spacer" />
          </div>
          <div className="cp-schedule__row">
            <span className="cp-schedule__label">End date</span>
            <DateField value={endValue} disabled={immediate} onChange={handleEndDate} label="End date" />
            <TimeField value={schedule.endTime} disabled={immediate} onChange={(endTime) => onChange({ endTime })} label="End time" />
            <span className="cp-schedule__zone">EDT</span>
          </div>
        </div>
      </div>
      <div className="cp-card__rule" />
      <div className="cp-card__body cp-toggle-row">
        <span className="cp-toggle-row__label">
          <Icon name="alarmTimer" size={15} />
          Accept late completions
        </span>
        <Switch checked={schedule.acceptLate} onChange={(acceptLate) => onChange({ acceptLate })} label="Accept late completions" />
      </div>
    </section>
  )
}

function GroupChip({ children, groups, onPick, picker }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  return (
    <div className="cp-anchor" ref={ref}>
      <button type="button" className={`cp-chip-button ${open ? 'cp-chip-button--open' : ''}`} aria-expanded={open} aria-haspopup="listbox" onClick={() => picker && setOpen(!open)}>
        <Icon name="usersMd" size={15} />
        <span>{children}</span>
      </button>
      {open ? (
        <div className="cp-menu" role="listbox">
          {groups.map((group) => (
            <button
              type="button"
              key={group}
              role="option"
              aria-selected={group === children}
              className="cp-menu__item"
              onClick={() => {
                onPick(group)
                setOpen(false)
              }}
            >
              {group}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function AudienceCard({ audience, onGroupChange, toggles, onToggle }) {
  return (
    <section className="cp-card" aria-label="Audience">
      <CardHeader icon="usersLg" iconSize={18} title="Audience" />
      <div className="cp-card__rule" />
      <div className="cp-card__body cp-audience">
        <div className="cp-audience__chips">
          <GroupChip groups={['Groups']} onPick={() => {}}>
            Groups
          </GroupChip>
          <GroupChip groups={[...AUDIENCE_GROUPS, 'New hires'].filter((g) => g !== audience.group)} onPick={onGroupChange} picker>
            {audience.group}
          </GroupChip>
        </div>
        <div className="cp-group-card">
          <div className="cp-group-card__head">
            <span className="cp-group-card__name">{audience.group}</span>
            <div className="cp-group-card__chips">
              <Badge icon="usersSm" size="sm">
                36 employees
              </Badge>
              <Badge icon="sliders" size="sm">
                2 conditions
              </Badge>
              <Badge icon="calendarChip" size="sm">
                Assigned to 2 campaigns
              </Badge>
            </div>
          </div>
          <div className="cp-group-card__toggles">
            <div className="cp-mini-toggle">
              <span className="cp-mini-toggle__label">
                <Icon name="zap" size={15} />
                <strong>Auto-enroll</strong>
                <span>Automatically enroll future members of the group</span>
              </span>
              <Switch checked={toggles.autoEnroll} onChange={(value) => onToggle({ autoEnroll: value, includeExisting: value ? toggles.includeExisting : false })} label="Auto-enroll" />
            </div>
            <div className={`cp-mini-toggle ${toggles.autoEnroll ? '' : 'cp-mini-toggle--disabled'}`}>
              <span className="cp-mini-toggle__label">
                <Icon name="userPlus" size={15} />
                <strong>Include existing</strong>
                <span>Include existing members of the group to enrollment</span>
              </span>
              <Switch
                checked={toggles.includeExisting}
                disabled={!toggles.autoEnroll}
                onChange={(value) => onToggle({ includeExisting: value })}
                label="Include existing"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ReminderRow({ reminder, when, enabled, onToggle }) {
  return (
    <div className="cp-reminder">
      <div className="cp-reminder__rail">
        <Icon name={reminder.icon} size={16} />
      </div>
      <div className="cp-reminder__main">
        <div className="cp-reminder__head">
          <span className="cp-reminder__label">{reminder.label}</span>
          <span className="cp-reminder__when">{when}</span>
        </div>
        <div className="cp-reminder__card">
          <EmailThumb />
          <div className="cp-reminder__text">
            <div className="cp-reminder__title">
              <span>{reminder.title}</span>
              <Badge icon="languages" size="xs">
                9 languages
              </Badge>
            </div>
            <p>{reminder.description}</p>
          </div>
          <div className="cp-reminder__actions">
            <button type="button" className="cp-icon-button cp-icon-button--sm" aria-label={`Edit ${reminder.title}`}>
              <Icon name="pencilSm" size={16} />
            </button>
            <span className="cp-reminder__divider" />
            <Switch checked={enabled} onChange={onToggle} label={reminder.title} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsCard({ endDate, notifications, onChange }) {
  const dueLabel = formatDate(endDate, 'short')
  return (
    <section className="cp-card" aria-label="Notifications">
      <CardHeader icon="bell" iconSize={18} title="Notifications" />
      <div className="cp-card__body cp-card__body--tight">
        <div className="cp-note">
          <p>
            Messages are sent from <strong>notifications@mail.adaptivesecuritytest.com</strong> during your company business days:{' '}
            <strong>Weekdays only (Mon-Fri) · Eastern Time (US &amp; Canada)</strong>
          </p>
          <button type="button" className="cp-link">
            <span>Managed in global settings</span>
            <Icon name="externalLink" size={12} />
          </button>
        </div>
      </div>
      <div className="cp-card__rule" />
      <div className="cp-card__body cp-notifications">
        <div className="cp-notifications__head">
          <h3>Employee notifications</h3>
          <button type="button" className="cp-icon-button cp-icon-button--sm" aria-label="Notification settings">
            <Icon name="gear" size={16} />
          </button>
        </div>
        <div className="cp-reminders">
          {REMINDERS.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              when={reminder.when === 'due' ? dueLabel : reminder.when}
              enabled={notifications[reminder.id]}
              onToggle={(value) => onChange({ [reminder.id]: value })}
            />
          ))}
        </div>
      </div>
      <div className="cp-card__rule" />
      <div className="cp-card__body cp-escalations">
        <div className="cp-escalations__head">
          <h3>Manager escalations</h3>
          <Switch checked={notifications.managers} onChange={(managers) => onChange({ managers })} label="Manager escalations" />
        </div>
        <div className="cp-reminder cp-reminder--manager">
          <div className="cp-reminder__rail">
            <Icon name="circle" size={16} />
          </div>
          <div className="cp-reminder__card">
            <EmailThumb />
            <div className="cp-reminder__text">
              <div className="cp-reminder__title">
                <span>Completion</span>
                <Badge icon="languages" size="xs">
                  9 languages
                </Badge>
              </div>
              <p>Sends daily at 9:00 AM</p>
            </div>
            <button type="button" className="cp-link cp-link--plain">
              <span>Edit in Settings</span>
              <Icon name="externalLink" size={12} />
            </button>
          </div>
        </div>
      </div>
      <div className="cp-card__rule" />
      <div className="cp-card__body cp-toggle-row">
        <span className="cp-toggle-row__label cp-toggle-row__label--slack">
          <SlackMark size={20} />
          Send supplemental notifications in Slack
        </span>
        <Switch checked={notifications.slack} onChange={(slack) => onChange({ slack })} label="Send supplemental notifications in Slack" />
      </div>
    </section>
  )
}

function SettingRow({ icon, logo, title, description, checked, onChange, tone }) {
  return (
    <div className={`cp-setting ${tone ? `cp-setting--${tone}` : ''}`}>
      {logo || (
        <span className="cp-setting__icon">
          <img src={assets.ellipsisBg} alt="" width="24" height="24" draggable={false} />
          <Icon name={icon} size={14} />
        </span>
      )}
      <div className="cp-setting__text">
        <div className="cp-setting__head">
          <span>{title}</span>
          <Switch checked={checked} onChange={onChange} label={title} />
        </div>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function AdvancedCard({ advanced, onChange }) {
  return (
    <section className="cp-card" aria-label="Advanced settings">
      <CardHeader
        icon="settingsAdv"
        title="Advanced settings"
        subtitle="A campaign can’t be connected to a postback retroactively after it’s launched."
      />
      <div className="cp-card__rule" />
      <div className="cp-card__body cp-advanced">
        <div className="cp-advanced__group">
          <SettingRow
            icon="fileChartLine"
            title="Compliance Training Reporting"
            description="Mark this campaign for compliance to report metrics separately."
            checked={advanced.compliance}
            onChange={(compliance) => onChange({ compliance })}
            tone="raised"
          />
          <SettingRow
            logo={<img className="cp-setting__logo" src={assets.vanta} alt="" width="24" height="24" draggable={false} />}
            title="Send Proof of Completion to Vanta"
            description="Add Completed Security Training Evidence to Vanta in a PDF format."
            checked={advanced.vanta}
            onChange={(vanta) => onChange({ vanta })}
          />
          <SettingRow
            logo={<img className="cp-setting__logo" src={assets.drata} alt="" width="24" height="24" draggable={false} />}
            title="Send Proof of Completion to Drata"
            description="Add Completed Security Training Evidence to Drata in a PDF format."
            checked={advanced.drata}
            onChange={(drata) => onChange({ drata })}
          />
        </div>
        <SettingRow
          logo={
            <span className="cp-setting__logo cp-setting__logo--bamboo">
              <img src={assets.bamboo} alt="" draggable={false} />
            </span>
          }
          title="Send Training Data to BambooHR"
          description="Add Completed Security Training Evidence to Drata in a PDF format."
          checked={advanced.bamboo}
          onChange={(bamboo) => onChange({ bamboo })}
          tone="card"
        />
      </div>
    </section>
  )
}

function OverviewRow({ icon, label, value }) {
  return (
    <div className="cp-overview__row">
      <span className="cp-overview__label">
        <Icon name={icon} size={14} />
        {label}
      </span>
      <span className="cp-overview__value">{value}</span>
    </div>
  )
}

export function OverviewCard({ modules, policies, audience, schedule, notifications, startDate, endDate, previewDisabled }) {
  const minutes = modules.reduce((sum, module) => sum + module.minutes, 0)
  const hasContent = modules.length > 0 || policies.length > 0
  const autoEnrollLabel = audience.membership === 'Current members only' ? 'Off' : 'Future hires only'
  const immediate = schedule.mode === 'immediate'

  return (
    <section className="cp-card cp-overview" aria-label="Overview">
      <div className="cp-card__header cp-card__header--stack">
        <h2 className="cp-heading cp-heading--card">Overview</h2>
        {hasContent ? (
          <div className="cp-overview__chips">
            <Badge icon="clockOv">{minutes}min</Badge>
            <Badge icon="bookMarkedOv">{modules.length} {modules.length === 1 ? 'module' : 'modules'}</Badge>
            <Badge icon="fileText">{policies.length} {policies.length === 1 ? 'policy' : 'policies'}</Badge>
          </div>
        ) : null}
      </div>

      <div className="cp-overview__preview">
        {hasContent ? (
          <div className="cp-overview__sheet">
            <div className="cp-overview__sheet-head">
              <span>
                <Icon name="bookMarkedTrainings" size={12} />
                Trainings
              </span>
              <em>{modules.length} {modules.length === 1 ? 'module' : 'modules'}</em>
            </div>
            {modules.slice(0, 3).map((module) => (
              <div key={module.id} className="cp-overview__sheet-row">
                <ModuleThumb module={module} />
                <span>{module.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="cp-overview__hint">Select training content to see preview</p>
            <div className="cp-overview__sheet cp-overview__sheet--ghost">
              <div className="cp-overview__sheet-head">
                <span>
                  <Icon name="bookMarkedTrainings" size={12} />
                  Trainings
                </span>
              </div>
              <div className="cp-overview__ghost-row">
                <i />
                <b />
              </div>
              <div className="cp-overview__ghost-row">
                <i />
                <b />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="cp-overview__rows">
        <OverviewRow icon="usersOv" label="Employee group" value={audience.group} />
        <OverviewRow icon="zapOv" label="Auto enroll" value={autoEnrollLabel} />
        <OverviewRow icon="calendarClockOv" label="Starts" value={immediate ? 'On launch' : `${formatDate(startDate, 'long')} - ${formatTime(schedule.startTime)}`} />
        <OverviewRow icon="clockDuration" label="Duration" value={formatDuration(schedule.days)} />
        <OverviewRow icon="clockDuration" label="Due" value={`${formatDate(endDate, 'long')} - ${formatTime(schedule.endTime)}`} />
        <OverviewRow icon="alarmClockCheck" label="Late completions" value={schedule.acceptLate ? 'Accepting' : 'Not accepting'} />
        <OverviewRow icon="bellOv" label="Employee notifications" value={notifications.slack ? 'Email and Slack' : 'Email'} />
        <OverviewRow icon="bellOv" label="Manager escalations" value={notifications.managers ? 'On' : 'Off'} />
      </div>

      <div className="cp-overview__footer">
        <button type="button" className="cp-button cp-button--outline cp-button--md cp-button--block" disabled={previewDisabled}>
          <Icon name="link" size={14} />
          <span>Preview</span>
        </button>
      </div>
    </section>
  )
}
