import { useEffect, useRef } from 'react'
import Icon from './icons'

function Menu({ items, label, selectedValue, onSelect, align = 'start' }) {
  const ref = useRef(null)
  const isRadio = selectedValue !== undefined

  useEffect(() => {
    ref.current?.querySelector('[role^="menuitem"]')?.focus({ preventScroll: true })
  }, [])

  const onKeyDown = (event) => {
    const nodes = Array.from(ref.current?.querySelectorAll('[role^="menuitem"]') ?? [])
    const index = nodes.indexOf(document.activeElement)
    const move = (next) => {
      event.preventDefault()
      nodes[(next + nodes.length) % nodes.length]?.focus()
    }
    if (event.key === 'ArrowDown') move(index + 1)
    else if (event.key === 'ArrowUp') move(index - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(nodes.length - 1)
  }

  return (
    <div
      ref={ref}
      className={`pi-menu pi-menu--${align}`}
      role="menu"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const selected = isRadio && item.value === selectedValue
        return (
          <button
            key={item.value ?? item.id}
            type="button"
            role={isRadio ? 'menuitemradio' : 'menuitem'}
            aria-checked={isRadio ? selected : undefined}
            className={`pi-menu__item${item.tone === 'danger' ? ' pi-menu__item--danger' : ''}`}
            onClick={() => onSelect(item)}
          >
            {isRadio && (
              <span className="pi-menu__check">
                {selected && <Icon name="check" size={14} strokeWidth={2} />}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default Menu
