import { useState } from 'react'
import Icon from './icons'
import Menu from './Menu'
import Sparkline from './Sparkline'
import usePopover from './usePopover'
import { FAILURE_BY_RANGE, HIGH_RISK_EMPLOYEES, TIME_RANGES } from './data'

const FAILURE_PATH =
  'M0 17 C45 12 100 3 160 3 C215 3 235 20 270 38 C295 50 310 51 340 51 L608 51'
const REPORTED_PATH = 'M0 22 C25 20 45 14 75 18 C110 24 130 30 165 24 C215 15 265 8 322 4'

const dayLabel = (ratio) => {
  const day = 15 + Math.round(ratio * 29)
  return day > 31 ? `Sep ${day - 31}` : `Aug ${day}`
}

const formatFailure = (ratio, y) => `${dayLabel(ratio)} · ${(3.2 + ((52 - y) / 49) * 8.8).toFixed(1)}%`
const formatReported = (ratio, y) => `${dayLabel(ratio)} · ${(5.4 + ((46 - y) / 42) * 2.8).toFixed(1)}%`

function ReportLink({ children, onClick, className = '' }) {
  return (
    <button type="button" className={`pi-link ${className}`.trim()} onClick={onClick}>
      <span>{children}</span>
      <Icon name="arrowUpRight" size={14} className="pi-link__arrow" />
    </button>
  )
}

function Delta({ direction, children, size = 'm' }) {
  return (
    <div className={`pi-delta pi-delta--${size}`}>
      <Icon name={direction === 'down' ? 'arrowDownRight' : 'arrowUpRight'} size={14} className="pi-delta__arrow" />
      {children}
    </div>
  )
}

function RangeSelect({ value, onChange }) {
  const { open, close, toggle, rootRef } = usePopover()
  const current = TIME_RANGES.find((range) => range.value === value)

  return (
    <div ref={rootRef} className="pi-popover">
      <button
        type="button"
        className="pi-range"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <Icon name="calendar" size={12} />
        <span>{current.label}</span>
        <Icon name="chevronDown" size={12} className="pi-range__chevron" />
      </button>
      {open && (
        <Menu
          items={TIME_RANGES}
          label="Time range"
          selectedValue={value}
          onSelect={(item) => {
            onChange(item.value)
            close()
          }}
        />
      )}
    </div>
  )
}

function SummaryCards({ onAction }) {
  const [range, setRange] = useState('30d')
  const failure = FAILURE_BY_RANGE[range]

  return (
    <section className="pi-summary" aria-label="Phishing campaign summary">
      <div className="pi-panel pi-failure">
        <div className="pi-failure__head">
          <div className="pi-failure__title">
            <span className="pi-label">Failure rates</span>
            <RangeSelect value={range} onChange={setRange} />
          </div>
          <ReportLink onClick={() => onAction('reports', 'Reports')}>See full report</ReportLink>
        </div>

        <div className="pi-failure__figure">
          <div className="pi-figure">
            <span className="pi-figure__value" key={range}>{failure.rate}</span>
            <span className="pi-figure__unit">%</span>
          </div>
          <Delta direction={failure.direction}>
            <span>{failure.delta}</span>
            <span aria-hidden="true">·</span>
            <span>{failure.failed} employees failed</span>
          </Delta>
        </div>

        <Sparkline
          className="pi-failure__chart"
          path={FAILURE_PATH}
          width={608}
          height={54}
          baselineY={9}
          format={formatFailure}
        />

        <div className="pi-failure__footer">
          <span className="pi-label">120 enrolled in remediation</span>
          <button type="button" className="pi-button-ghost" onClick={() => onAction('remediation', 'Remediation')}>
            <span>View remediation</span>
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </div>

      <div className="pi-summary__side">
        <div className="pi-panel pi-reported">
          <div className="pi-reported__body">
            <span className="pi-label">Reported rate via PAB</span>
            <div className="pi-reported__figure">
              <span className="pi-heading">8.2%</span>
              <Delta direction="up" size="s">
                <span>3.0%</span>
                <span aria-hidden="true">·</span>
                <span>12 employees reported</span>
              </Delta>
            </div>
          </div>
          <Sparkline
            className="pi-reported__chart"
            path={REPORTED_PATH}
            width={324}
            height={43}
            format={formatReported}
          />
          <ReportLink className="pi-reported__link" onClick={() => onAction('reports', 'Reports')}>
            See full report
          </ReportLink>
        </div>

        <div className="pi-panel pi-risk">
          <div className="pi-risk__head">
            <span className="pi-label">High risk employees</span>
            <button type="button" className="pi-link pi-link--small" onClick={() => onAction('high-risk', 'Employees')}>
              View all
            </button>
          </div>
          <span className="pi-heading">10</span>
          <ul className="pi-risk__list">
            {HIGH_RISK_EMPLOYEES.map((employee) => (
              <li key={employee.id}>
                <button
                  type="button"
                  className="pi-risk__row"
                  onClick={() => onAction('employee', employee.name)}
                >
                  {employee.name} · {employee.email}
                </button>
              </li>
            ))}
          </ul>
          <span className="pi-risk__fade" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default SummaryCards
