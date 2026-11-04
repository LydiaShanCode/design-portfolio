import { useId } from 'react'

const THEMES = {
  phi: { tile: '#e6f7ef', from: '#5fdcab', to: '#16996b' },
  'eu-ai': { tile: '#e9ecff', from: '#5b78ff', to: '#2140d6' },
  deepfake: { tile: '#f1ebff', from: '#bd98ff', to: '#7a4ee6' },
  'it-support': { tile: '#fdecef', from: '#63a9ff', to: '#2f6fe8' },
  'think-click': { tile: '#fff3e3', from: '#ffbe5c', to: '#f07a1a' },
  password: { tile: '#e5f5ff', from: '#62cdff', to: '#1f8fe0' },
  reporting: { tile: '#ffece9', from: '#ff8a7a', to: '#e0433a' },
  mfa: { tile: '#efedff', from: '#9b89ff', to: '#5a45e0' },
}

function Glyph({ id, fill }) {
  switch (id) {
    case 'phi':
      return (
        <>
          <path d="M20 8.5 29.5 12v7.4c0 5.8-3.9 9.9-9.5 12.1-5.6-2.2-9.5-6.3-9.5-12.1V12z" fill={fill} />
          <path d="M18.4 14.6h3.2v3.6h3.6v3.2h-3.6V25h-3.2v-3.6h-3.6v-3.2h3.6z" fill="#fff" />
        </>
      )
    case 'eu-ai':
      return (
        <>
          <circle cx="20" cy="20" r="11.5" fill={fill} />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return <circle key={i} cx={20 + Math.cos(angle) * 7} cy={20 + Math.sin(angle) * 7} r="1.35" fill="#ffd84d" />
          })}
        </>
      )
    case 'deepfake':
      return (
        <>
          <path d="M10.5 12.2Q20 7.6 29.5 12.2v7.6c0 6.2-4.3 10.7-9.5 10.7s-9.5-4.5-9.5-10.7z" fill={fill} />
          <ellipse cx="16" cy="18.2" rx="2.5" ry="1.7" fill="#fff" />
          <ellipse cx="24" cy="18.2" rx="2.5" ry="1.7" fill="#fff" />
          <path d="M16.4 24q3.6 2.6 7.2 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      )
    case 'it-support':
      return (
        <>
          <rect x="7.5" y="9.5" width="25" height="21" rx="4" fill={fill} />
          <circle cx="11.4" cy="13.2" r="1" fill="#fff" fillOpacity="0.85" />
          <circle cx="14.4" cy="13.2" r="1" fill="#fff" fillOpacity="0.85" />
          <circle cx="17.4" cy="13.2" r="1" fill="#fff" fillOpacity="0.85" />
          <path d="m12 19 3 2.5-3 2.5M17.5 25.2h5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )
    case 'think-click':
      return (
        <>
          <path d="M15 11 28.5 22.6l-6.1.8 3.3 6.4-3 1.5-3.2-6.4-4.5 4.2z" fill={fill} />
          <path d="M11.6 9.6 10 7.4M9.4 12.4l-2.5-.7M14.6 8.6V6" stroke="#f07a1a" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )
    case 'password':
      return (
        <>
          <circle cx="15" cy="17.5" r="6.5" fill={fill} />
          <circle cx="15" cy="17.5" r="2.2" fill="#fff" />
          <rect x="19.5" y="15.9" width="12" height="3.2" rx="1.6" fill={fill} />
          <rect x="25" y="18" width="2.6" height="4.6" rx="1" fill={fill} />
          <rect x="28.6" y="18" width="2.6" height="3.4" rx="1" fill={fill} />
        </>
      )
    case 'reporting':
      return (
        <>
          <rect x="11.5" y="8.5" width="2.6" height="23" rx="1.3" fill="#a3aab2" />
          <path d="M14.1 10H29l-3.4 5.3L29 20.6H14.1z" fill={fill} />
        </>
      )
    case 'mfa':
      return (
        <>
          <rect x="12.5" y="7.5" width="15" height="25" rx="3.6" fill={fill} />
          <rect x="14.8" y="10.8" width="10.4" height="16.6" rx="1.6" fill="#fff" fillOpacity="0.92" />
          <circle cx="17.3" cy="19" r="1.1" fill="#5a45e0" />
          <circle cx="20" cy="19" r="1.1" fill="#5a45e0" />
          <circle cx="22.7" cy="19" r="1.1" fill="#5a45e0" />
        </>
      )
    default:
      return <rect x="11" y="11" width="18" height="18" rx="4" fill={fill} />
  }
}

export default function ModuleIcon({ id, size = 40, className = '' }) {
  const gradientId = `tc-mi${useId().replace(/:/g, '')}`
  const theme = THEMES[id] || THEMES['it-support']
  return (
    <svg
      className={`tc-module-icon ${className}`.trim()}
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={theme.from} />
          <stop offset="1" stopColor={theme.to} />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="9.5" fill={theme.tile} stroke="#fff" strokeWidth="1.5" />
      <Glyph id={id} fill={`url(#${gradientId})`} />
    </svg>
  )
}
