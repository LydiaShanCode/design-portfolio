import { useEffect, useRef, useState } from 'react'
import { TYPE_OPTIONS } from '../../../data/trainingCampaigns'
import Icon from './Icon'

function TypeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = TYPE_OPTIONS.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      rootRef.current?.querySelector('button')?.focus()
    }
  }

  return (
    <div ref={rootRef} className="tc-select" onKeyDown={onKeyDown}>
      <button
        type="button"
        className="tc-select__trigger"
        data-filled={value !== 'all' || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value === 'all' ? 'Type' : selected.label}</span>
        <Icon name="chevron-down" size={16} className="tc-select__chevron" />
      </button>
      {open ? (
        <ul className="tc-menu tc-menu--select" role="listbox" aria-label="Campaign type">
          {TYPE_OPTIONS.map((option) => (
            <li key={option.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className="tc-menu__item"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span>{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default function Toolbar({ query, onQueryChange, type, onTypeChange, view, onViewChange }) {
  return (
    <div className="tc-toolbar">
      <label className="tc-search">
        <Icon name="search" size={16} />
        <input
          type="search"
          value={query}
          placeholder="Search by campaign name"
          aria-label="Search by campaign name"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <div className="tc-toolbar__controls">
        <TypeSelect value={type} onChange={onTypeChange} />
        <div className="tc-segmented" role="group" aria-label="Layout">
          {[
            { key: 'grid', icon: 'layout-grid', label: 'Thumbnail view' },
            { key: 'list', icon: 'list', label: 'List view' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              className="tc-segmented__button"
              aria-label={option.label}
              aria-pressed={view === option.key}
              onClick={() => onViewChange(option.key)}
            >
              <Icon name={option.icon} size={13} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
