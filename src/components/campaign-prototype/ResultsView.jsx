import { useCallback, useMemo, useRef, useState } from 'react'
import { Icon } from './ui'
import { useDismiss, useEscape } from './hooks'
import { EMPLOYEES } from './data'

const FILTERS = [
  { id: 'all', label: 'Enrolled', icon: 'usersSm', caption: 'Employees' },
  { id: 'pending', label: 'Pending', icon: 'resPending' },
  { id: 'completed', label: 'Completed', icon: 'resCheck' },
  { id: 'unenrolled', label: 'Unenrolled', icon: 'resUnenrolled' },
]

const PAGE_SIZES = [10, 25, 50]

function matchesFilter(employee, filter) {
  if (filter === 'all') return true
  return employee.status === filter
}

function pageList(page, pageCount) {
  if (pageCount <= 6) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const head = Math.min(Math.max(page, 3), pageCount - 3)
  const pages = new Set([1, head - 1, head, head + 1, pageCount])
  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)
  const result = []
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push('gap')
    result.push(value)
  })
  return result
}

function StatusBadge({ status }) {
  const completed = status === 'completed'
  return (
    <span className={`cp-pill cp-pill--${completed ? 'completed' : 'pending'}`}>
      <Icon name={completed ? 'resCheck' : 'resPending'} size={12} />
      {completed ? 'Completed' : 'Pending'}
    </span>
  )
}

function FilterMenu({ filter, onPick }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  useEscape(open, close)
  return (
    <div className="cp-anchor" ref={ref}>
      <button type="button" className={`cp-button cp-button--outline cp-button--sm ${filter !== 'all' || open ? 'cp-button--open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="resFilter" size={14} />
        <span>Filter</span>
      </button>
      {open ? (
        <div className="cp-menu" role="listbox">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={option.id === filter}
              className="cp-menu__item"
              onClick={() => {
                onPick(option.id)
                setOpen(false)
              }}
            >
              {option.id === 'all' ? 'All employees' : option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function RowsSelect({ value, onChange }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  useEscape(open, close)
  return (
    <div className="cp-anchor cp-anchor--rows" ref={ref}>
      <button type="button" className={`cp-select cp-select--rows ${open ? 'cp-select--open' : ''}`} aria-haspopup="listbox" aria-expanded={open} aria-label="Rows per page" onClick={() => setOpen(!open)}>
        <span>{value}</span>
        <Icon name="resSelectArrow" size={14} className="cp-select__chevron" />
      </button>
      {open ? (
        <div className="cp-menu cp-menu--up" role="listbox">
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              role="option"
              aria-selected={size === value}
              className="cp-menu__item"
              onClick={() => {
                onChange(size)
                setOpen(false)
              }}
            >
              {size}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function ResultsView({ paused = false }) {
  const [employees, setEmployees] = useState(EMPLOYEES)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const total = employees.length
  const counts = useMemo(
    () => ({
      all: total,
      pending: employees.filter((employee) => employee.status === 'pending').length,
      completed: employees.filter((employee) => employee.status === 'completed').length,
      unenrolled: 0,
    }),
    [employees, total],
  )

  const needle = query.trim().toLowerCase()
  const rows = useMemo(
    () =>
      employees.filter(
        (employee) => matchesFilter(employee, filter) && (!needle || `${employee.name} ${employee.email}`.toLowerCase().includes(needle)),
      ),
    [employees, filter, needle],
  )

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pageCount)
  const visible = rows.slice((current - 1) * pageSize, current * pageSize)

  const applyFilter = (next) => {
    setFilter(next)
    setPage(1)
  }

  const addEmployee = () => {
    setEmployees((list) => [
      {
        id: `added-${list.length}`,
        name: 'Alex Morgan',
        email: 'amorgan@acme.co',
        enrolled: 'Just now',
        due: '6/23 at 9:55 AM EDT',
        status: 'pending',
        modules: 0,
        policies: 0,
      },
      ...list,
    ])
    setFilter('all')
    setPage(1)
  }

  return (
    <div className="cp-results">
      <div className="cp-stats" role="group" aria-label="Filter by status">
        {FILTERS.map((option) => {
          const count = counts[option.id]
          const selected = filter === option.id
          return (
            <button key={option.id} type="button" className={`cp-stat ${selected ? 'cp-stat--selected' : ''}`} aria-pressed={selected} onClick={() => applyFilter(option.id)}>
              <span className="cp-stat__label">
                <Icon name={option.icon} size={14} />
                {option.label}
              </span>
              <span className="cp-stat__value">{option.id === 'all' ? count : `${total ? Math.round((count / total) * 100) : 0}%`}</span>
              <span className="cp-stat__caption">{option.id === 'all' ? option.caption : `${count} of ${total} employees`}</span>
            </button>
          )
        })}
      </div>

      <section className="cp-results__card" aria-label="Employees">
        <div className="cp-results__toolbar">
          <span className="cp-results__count">{rows.length} results</span>
          <label className="cp-results__search">
            <Icon name="resSearch" size={14} />
            <input
              type="text"
              placeholder="Search employee"
              value={query}
              aria-label="Search employee"
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <FilterMenu filter={filter} onPick={applyFilter} />
          <span className="cp-results__spacer" />
          <button type="button" className="cp-button cp-button--outline cp-button--sm" onClick={addEmployee} disabled={paused}>
            <Icon name="resPlus" size={14} />
            <span>Add employee</span>
          </button>
        </div>

        <div className="cp-results__table" role="table">
          <div className="cp-results__row cp-results__row--head" role="row">
            <span role="columnheader">Employee</span>
            <span role="columnheader">Date Enrolled</span>
            <span role="columnheader">Due Date</span>
            <span role="columnheader">Training status</span>
            <span role="columnheader">Module Progress</span>
            <span role="columnheader">Policies</span>
          </div>
          {visible.map((employee) => (
            <div key={employee.id} className="cp-results__row" role="row">
              <span className="cp-results__person">
                <strong>{employee.name}</strong>
                <em>{employee.email}</em>
              </span>
              <span>{employee.enrolled}</span>
              <span>{employee.due}</span>
              <span>
                <StatusBadge status={employee.status} />
              </span>
              <span>{employee.modules}/5</span>
              <span>{employee.policies}/3</span>
            </div>
          ))}
          {visible.length === 0 ? (
            <div className="cp-results__empty">
              <p>No employees found</p>
              <span>Try a different search or status filter.</span>
            </div>
          ) : null}
        </div>

        <footer className="cp-pagination">
          <span className="cp-pagination__label">Rows per page:</span>
          <RowsSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
          <span className="cp-pagination__spacer" />
          <nav className="cp-pagination__pages" aria-label="Pagination">
            <button type="button" className="cp-page-button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}>
              <Icon name="resChevronLeft" size={14} />
            </button>
            {pageList(current, pageCount).map((entry, index) =>
              entry === 'gap' ? (
                <span key={`gap-${index}`} className="cp-pagination__gap" aria-hidden="true">
                  …
                </span>
              ) : (
                <button key={entry} type="button" className={`cp-page-button ${entry === current ? 'cp-page-button--active' : ''}`} aria-current={entry === current ? 'page' : undefined} onClick={() => setPage(entry)}>
                  {entry}
                </button>
              ),
            )}
            <button type="button" className="cp-page-button cp-page-button--next" aria-label="Next page" disabled={current === pageCount} onClick={() => setPage(current + 1)}>
              <Icon name="resChevronLeft" size={14} />
            </button>
          </nav>
        </footer>
      </section>
    </div>
  )
}
