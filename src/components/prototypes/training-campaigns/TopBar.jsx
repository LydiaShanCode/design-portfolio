import logo from '../../../assets/prototypes/training-campaigns/icons/adaptive-logo.svg'
import avatar from '../../../assets/prototypes/training-campaigns/img/org-avatar.png'
import Icon from './Icon'

export default function TopBar({ sidebarOpen, onToggleSidebar, onNavigate }) {
  return (
    <header className="tc-topbar">
      <div className="tc-topbar__brand">
        <img className="tc-topbar__logo" src={logo} alt="Adaptive" width="87" height="16" />
        <div className="tc-topbar__tools">
          <button type="button" className="tc-icon-button tc-icon-button--lg" aria-label="Sort navigation" onClick={() => onNavigate('Sorting')}>
            <Icon name="sort" size={16} />
          </button>
          <button
            type="button"
            className="tc-icon-button tc-icon-button--lg"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-controls="tc-sidebar"
            onClick={onToggleSidebar}
          >
            <Icon name="panel-left" size={16} />
          </button>
        </div>
      </div>
      <button type="button" className="tc-topbar__org" onClick={() => onNavigate('Organization switcher')}>
        <img src={avatar} alt="" width="20" height="20" />
        <span>AdaptiveSecurityTest</span>
      </button>
      <span className="tc-topbar__divider" aria-hidden="true" />
      <button type="button" className="tc-topbar__goto" onClick={() => onNavigate('Go to')}>
        <Icon name="search" size={16} />
        <span>Go to...</span>
        <span className="tc-topbar__kbd" aria-hidden="true" />
      </button>
    </header>
  )
}
