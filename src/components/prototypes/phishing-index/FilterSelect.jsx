import Icon from './icons'
import Menu from './Menu'
import usePopover from './usePopover'

function FilterSelect({ label, options, value, onChange, className = '' }) {
  const { open, close, toggle, rootRef } = usePopover()
  const current = options.find((option) => option.value === value)
  const items = [{ value: '', label: `All ${label.toLowerCase()}s` }, ...options]

  return (
    <div ref={rootRef} className={`pi-popover ${className}`.trim()}>
      <button
        type="button"
        className={`pi-select${current ? ' pi-select--active' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="pi-select__label">{current ? current.label : label}</span>
        <Icon name="chevronDown" size={16} className="pi-select__chevron" />
      </button>
      {open && (
        <Menu
          items={items}
          label={label}
          selectedValue={value ?? ''}
          align="end"
          onSelect={(item) => {
            onChange(item.value || null)
            close()
          }}
        />
      )}
    </div>
  )
}

export default FilterSelect
