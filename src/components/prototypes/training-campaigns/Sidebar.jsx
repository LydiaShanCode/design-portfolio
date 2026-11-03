import Icon from './Icon'

const NAV = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'nav-dashboard',
    children: ['Reports', 'Boards', 'Leaderboard'],
  },
  { key: 'employees', label: 'Employees', icon: 'nav-employees' },
  { separator: true },
  {
    key: 'training',
    label: 'Training',
    icon: 'nav-training',
    active: true,
    children: ['Content Library', 'Policies'],
  },
  { key: 'phishing', label: 'Phishing', icon: 'nav-phishing' },
  { key: 'triage', label: 'Phish Triage', icon: 'nav-triage', count: 13 },
  { key: 'email', label: 'Email Security', icon: 'nav-email', locked: true },
  { key: 'governance', label: 'AI Governance', icon: 'nav-governance', locked: true },
  { separator: true },
  { key: 'risk', label: 'Risk', icon: 'nav-risk' },
  { key: 'personas', label: 'AI Personas', icon: 'nav-personas' },
  { key: 'preview', label: 'Feature Preview', icon: 'nav-preview' },
]

function NavItem({ item, label = item.label, sub = false, onNavigate }) {
  const active = item.active && !sub
  return (
    <button
      type="button"
      className="tc-nav__item"
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      onClick={() => onNavigate(label)}
    >
      {sub ? <span className="tc-nav__spacer" aria-hidden="true" /> : <Icon name={item.icon} size={16} />}
      <span className="tc-nav__label">{label}</span>
      {item.count ? <span className="tc-nav__count">{item.count}</span> : null}
      {item.locked ? <Icon name="lock" size={12} className="tc-nav__lock" /> : null}
    </button>
  )
}

export default function Sidebar({ onNavigate }) {
  return (
    <nav className="tc-sidebar__nav" aria-label="Primary">
      {NAV.map((item, index) => {
        if (item.separator) return <div key={`sep-${index}`} className="tc-nav__separator" role="separator" />
        return (
          <div key={item.key} className="tc-nav__group">
            <NavItem item={item} onNavigate={onNavigate} />
            {item.children ? (
              <div className="tc-nav__children">
                {item.children.map((label) => (
                  <NavItem key={label} item={{}} label={label} sub onNavigate={onNavigate} />
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
