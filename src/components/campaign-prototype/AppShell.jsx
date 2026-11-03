import assets from './assets'
import { Icon } from './ui'
import { SIDEBAR_ITEMS } from './data'

function SidebarItem({ item, onSelect }) {
  const classes = ['cp-nav__item']
  if (item.active) classes.push('cp-nav__item--active')
  return (
    <div className="cp-nav__group">
      <button type="button" className={classes.join(' ')} onClick={() => onSelect?.(item.id)}>
        <Icon name={item.icon} size={16} />
        <span className="cp-nav__label">{item.label}</span>
        {item.count ? <span className="cp-nav__count">{item.count}</span> : null}
        {item.locked ? <Icon name="navLock" size={12} className="cp-nav__lock" /> : null}
      </button>
      {item.children ? (
        <div className="cp-nav__children">
          {item.children.map((child) => (
            <button type="button" key={child} className="cp-nav__child">
              {child}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function AppShell({ children, onNavigate }) {
  return (
    <div className="cp-shell">
      <header className="cp-topbar">
        <div className="cp-topbar__left">
          <div className="cp-topbar__brand">
            <img src={assets.logo} alt="Adaptive" width="87" height="16" draggable={false} />
          </div>
          <div className="cp-topbar__tools">
            <button type="button" className="cp-icon-button" aria-label="Sort navigation">
              <Icon name="topSort" size={16} />
            </button>
            <button type="button" className="cp-icon-button" aria-label="Collapse sidebar">
              <Icon name="topPanel" size={16} />
            </button>
          </div>
          <span className="cp-topbar__separator" />
          <button type="button" className="cp-topbar__org">
            <Icon name="orgAvatar" size={20} className="cp-topbar__avatar" />
            <span>AdaptiveSecurityTest</span>
          </button>
          <span className="cp-topbar__separator" />
          <button type="button" className="cp-topbar__goto">
            <Icon name="topSearch" size={16} />
            <span>Go to...</span>
          </button>
        </div>
      </header>

      <div className="cp-body">
        <nav className="cp-nav" aria-label="Product">
          <div className="cp-nav__list">
            {SIDEBAR_ITEMS.map((item, index) =>
              item.divider ? (
                <div key={`divider-${index}`} className="cp-nav__divider" />
              ) : (
                <SidebarItem key={item.id} item={item} onSelect={onNavigate} />
              ),
            )}
          </div>
          <div className="cp-nav__footer">
            <button type="button" className="cp-nav__item">
              <Icon name="navSettings" size={16} />
              <span className="cp-nav__label">Settings</span>
            </button>
          </div>
        </nav>
        <main className="cp-main">{children}</main>
      </div>
    </div>
  )
}
