import Icon from './icons'

const TONES = {
  sms: [
    { bg: '#f6d7c9', fg: '#c46a45' },
    { bg: '#d9e6c8', fg: '#6b8f3f' },
    { bg: '#d6d1f2', fg: '#6d5bd0' },
    { bg: '#f2d0e2', fg: '#c04f8d' },
  ],
  voice: [
    { bg: '#d9c3a9', fg: '#6a4a30' },
    { bg: '#cdbba6', fg: '#3f2c1d' },
    { bg: '#e8d3bd', fg: '#8a6446' },
    { bg: '#c9b19a', fg: '#45301f' },
  ],
}

function Person({ bg, fg }) {
  return (
    <svg viewBox="0 0 28 28" width="100%" height="100%" aria-hidden="true" focusable="false">
      <rect width="28" height="28" fill={bg} />
      <circle cx="14" cy="11" r="5" fill={fg} />
      <path d="M4 28c0-6 4.5-9.5 10-9.5S24 22 24 28z" fill={fg} />
    </svg>
  )
}

function OrgLogo({ variant }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      {variant === 0 ? (
        <>
          <path d="M2 2.5 13.5 8 2 13.5l2.4-5.5z" fill="#2f6bff" />
          <path d="M4.4 8 13.5 8" stroke="#a9c2ff" strokeWidth="1.2" />
        </>
      ) : (
        <>
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="#5b4be0" />
          <path d="M5 11V5l3 3 3-3v6" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

const TYPE_ICON = { email: 'mail', sms: 'message', voice: 'phone' }

function Avatars({ type, typeLabel, typeDetail }) {
  const people = TONES[type]
  return (
    <div className="pi-avatars">
      <span className="pi-avatars__type" style={{ zIndex: 6 }}>
        <Icon name={TYPE_ICON[type]} size={14} />
        <span>{typeLabel}</span>
        {typeDetail && (
          <>
            <span aria-hidden="true">·</span>
            <span>{typeDetail}</span>
          </>
        )}
      </span>
      {type === 'email'
        ? [0, 1].map((variant) => (
            <span key={variant} className="pi-avatars__item pi-avatars__item--org" style={{ zIndex: 5 - variant }}>
              <OrgLogo variant={variant} />
            </span>
          ))
        : people.map((tone, index) => (
            <span key={index} className="pi-avatars__item" style={{ zIndex: 5 - index }}>
              <Person {...tone} />
            </span>
          ))}
    </div>
  )
}

export default Avatars
