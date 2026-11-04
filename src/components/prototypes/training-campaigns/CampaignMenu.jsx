import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function CampaignMenu({ id, groups, placement = 'below', onSelect, onClose, labelledBy }) {
  const menuRef = useRef(null)

  useEffect(() => {
    menuRef.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true })
  }, [])

  const onKeyDown = (event) => {
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')]
    const index = items.indexOf(document.activeElement)
    const move = (next) => {
      event.preventDefault()
      items[(next + items.length) % items.length]?.focus()
    }
    if (event.key === 'ArrowDown') move(index + 1)
    else if (event.key === 'ArrowUp') move(index - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(items.length - 1)
    else if (event.key === 'Tab') onClose({ restoreFocus: false })
    else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose({ restoreFocus: true })
    }
  }

  return (
    <div
      ref={menuRef}
      id={id}
      className={`tc-menu tc-menu--${placement}`}
      role="menu"
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
    >
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="tc-menu__group" role="group">
          {group.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className={`tc-menu__item${item.destructive ? ' tc-menu__item--destructive' : ''}`}
              onClick={() => onSelect(item.key)}
            >
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
