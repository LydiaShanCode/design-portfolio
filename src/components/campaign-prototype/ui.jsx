import assets from './assets'

export function Icon({ name, size = 16, className = '', style }) {
  return (
    <img
      src={assets[name]}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`cp-icon ${className}`.trim()}
      style={style}
    />
  )
}

export function Switch({ checked, onChange, disabled = false, label, size = 'md', className = '' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`cp-switch cp-switch--${size} ${checked ? 'cp-switch--on' : ''} ${className}`.trim()}
      onClick={() => onChange?.(!checked)}
    >
      <span className="cp-switch__track" />
      <span className="cp-switch__knob" />
    </button>
  )
}

export function Radio({ checked }) {
  return <span className={`cp-radio ${checked ? 'cp-radio--checked' : ''}`} aria-hidden="true" />
}

export function Badge({ children, icon, dot = false, tone = 'subtle', size = 'md', className = '' }) {
  return (
    <span className={`cp-badge cp-badge--${tone} cp-badge--${size} ${className}`.trim()}>
      {dot ? <span className="cp-badge__dot" /> : null}
      {icon ? <Icon name={icon} size={size === 'xs' ? 12 : 14} /> : null}
      <span>{children}</span>
    </span>
  )
}

export function Button({ variant = 'outline', size = 'md', icon, children, className = '', ...rest }) {
  return (
    <button type="button" className={`cp-button cp-button--${variant} cp-button--${size} ${className}`.trim()} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  )
}

const SLACK_PIECES = [
  { name: 'slackBlue', inset: '51.81% 51.81% 16.25% 16.25%' },
  { name: 'slackCyan', inset: '16.25% 51.81% 51.81% 16.25%' },
  { name: 'slackGreen', inset: '16.25% 16.25% 51.81% 51.82%' },
  { name: 'slackYellow', inset: '51.81% 16.25% 16.25% 51.82%' },
]

export function SlackMark({ size = 20 }) {
  return (
    <span className="cp-slack" style={{ width: size, height: size }} aria-hidden="true">
      {SLACK_PIECES.map((piece) => (
        <img key={piece.name} src={assets[piece.name]} alt="" draggable={false} style={{ inset: piece.inset }} />
      ))}
    </span>
  )
}

export function EmailThumb() {
  return (
    <span className="cp-email-thumb" aria-hidden="true">
      <span className="cp-email-thumb__page">
        <span className="cp-email-thumb__line cp-email-thumb__line--short" />
        <span className="cp-email-thumb__line" />
        <span className="cp-email-thumb__line cp-email-thumb__line--mid" />
        <span className="cp-email-thumb__button" />
      </span>
    </span>
  )
}

