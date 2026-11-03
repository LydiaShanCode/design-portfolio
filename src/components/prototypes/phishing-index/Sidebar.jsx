import Icon from './icons'

const NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    children: [
      { id: 'reports', label: 'Reports' },
      { id: 'boards', label: 'Boards' },
      { id: 'leaderboard', label: 'Leaderboard' },
    ],
  },
  { id: 'employees', label: 'Employees', icon: 'employees' },
  { divider: true },
  {
    id: 'training',
    label: 'Training',
    icon: 'training',
    children: [
      { id: 'content-library', label: 'Content Library' },
      { id: 'policies', label: 'Policies' },
    ],
  },
  { id: 'phishing', label: 'Phishing', icon: 'phishing' },
  { id: 'phish-triage', label: 'Phish Triage', icon: 'inbox', badge: '13' },
  { id: 'email-security', label: 'Email Security', icon: 'mail', locked: true },
  { id: 'ai-governance', label: 'AI Governance', icon: 'bot', locked: true },
  { divider: true },
  { id: 'risk', label: 'Risk', icon: 'shield' },
  { id: 'ai-personas', label: 'AI Personas', icon: 'persona' },
  { id: 'feature-preview', label: 'Feature Preview', icon: 'flask' },
]

function NavItem({ item, active, onSelect, nested = false }) {
  return (
    <button
      type="button"
      className={`pi-nav__item${active ? ' pi-nav__item--active' : ''}${nested ? ' pi-nav__item--nested' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item)}
    >
      {item.icon && <Icon name={item.icon} size={16} />}
      <span className="pi-nav__label">{item.label}</span>
      {item.badge && <span className="pi-nav__badge">{item.badge}</span>}
      {item.locked && <Icon name="lock" size={12} className="pi-nav__lock" />}
    </button>
  )
}

function Sidebar({ collapsed, activeId, onSelect }) {
  return (
    <aside className={`pi-sidebar${collapsed ? ' pi-sidebar--collapsed' : ''}`} aria-hidden={collapsed || undefined} inert={collapsed ? '' : undefined}>
      <div className="pi-sidebar__inner">
        <nav className="pi-nav" aria-label="Primary">
          {NAV.map((item, index) => {
            if (item.divider) return <hr key={`divider-${index}`} className="pi-nav__divider" />
            return (
              <div key={item.id} className="pi-nav__group">
                <NavItem item={item} active={activeId === item.id} onSelect={onSelect} />
                {item.children && (
                  <div className="pi-nav__children">
                    {item.children.map((child) => (
                      <NavItem key={child.id} item={child} nested active={activeId === child.id} onSelect={onSelect} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="pi-sidebar__footer">
          <NavItem
            item={{ id: 'settings', label: 'Settings', icon: 'settings' }}
            active={activeId === 'settings'}
            onSelect={onSelect}
          />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
