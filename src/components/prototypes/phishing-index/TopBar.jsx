import Icon from './icons'

function TopBar({ collapsed, onToggleSidebar, onAction }) {
  return (
    <header className="pi-topbar">
      <div className="pi-topbar__brand">
        <button type="button" className="pi-logo" aria-label="Adaptive home" onClick={() => onAction('home', 'Home')}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <rect width="14" height="14" rx="3.5" fill="currentColor" />
            <path d="M4.2 9.8V4.6h5.6v5.2" stroke="#f8f8f8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="7" cy="7.6" r="1" fill="#f8f8f8" />
          </svg>
          <span>Adaptive</span>
        </button>
        <div className="pi-topbar__tools">
          <button
            type="button"
            className="pi-icon-button pi-icon-button--large"
            aria-label="Sort"
            onClick={() => onAction('sort', 'Sort')}
          >
            <Icon name="sort" size={16} />
          </button>
          <button
            type="button"
            className="pi-icon-button pi-icon-button--large"
            aria-label={collapsed ? 'Expand sidebar (⌘+\\)' : 'Collapse sidebar (⌘+\\)'}
            aria-pressed={collapsed}
            onClick={onToggleSidebar}
          >
            <Icon name="panelLeft" size={16} />
          </button>
        </div>
      </div>

      <button type="button" className="pi-workspace" onClick={() => onAction('workspace', 'Workspace switcher')}>
        <span className="pi-workspace__avatar" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="20" height="20">
            <rect width="20" height="20" fill="#e3ef3a" />
            <path d="M6 14 10 5l4 9h-2.6L10 10.8 8.6 14z" fill="#1e2324" />
          </svg>
        </span>
        <span className="pi-workspace__name">AdaptiveSecurityTest</span>
      </button>

      <span className="pi-topbar__separator" aria-hidden="true" />

      <button type="button" className="pi-goto" onClick={() => onAction('go-to', 'Go to…')}>
        <Icon name="search" size={16} />
        <span>Go to...</span>
      </button>
    </header>
  )
}

export default TopBar
