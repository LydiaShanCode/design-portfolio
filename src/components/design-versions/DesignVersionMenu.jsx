import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { LayoutGroup, MotionConfig, motion } from 'framer-motion'
import { inScope, useDesignVersionContext } from './DesignVersionProvider'

const DEFAULT_SHORTCUT = { key: 'v', ctrl: true }
const SPRING = { type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }
const NO_MAJORS = []
const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' })
const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

function formatShortcut(s) {
  return `${s.ctrl ? '⌃' : ''}${s.alt ? '⌥' : ''}${s.shift ? '⇧' : ''}${s.meta ? '⌘' : ''}${s.key.toUpperCase()}`
}

function ariaShortcut(s) {
  return [s.ctrl && 'Control', s.alt && 'Alt', s.shift && 'Shift', s.meta && 'Meta', s.key.toUpperCase()]
    .filter(Boolean)
    .join('+')
}

function matchesShortcut(e, s) {
  return (
    e.key.toLowerCase() === s.key.toLowerCase() &&
    e.ctrlKey === !!s.ctrl &&
    e.metaKey === !!s.meta &&
    e.altKey === !!s.alt &&
    e.shiftKey === !!s.shift
  )
}

function isEditable(target) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null
}

function relativeTime(iso) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return RELATIVE.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

// "feat(projects): restore payouts" reads as "Restore payouts" in a one-line changelog.
function readableSubject(subject) {
  const text = subject.replace(/^\w+(\([^)]*\))?!?:\s*/, '')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Commits are newest first; each one belongs to the latest major whose `sinceSha` precedes it.
function tagCommits(commits, majors) {
  const starts = majors.filter((m) => m.sinceSha)
  let current = majors[majors.length - 1]?.key
  const tags = new Array(commits.length)
  for (let i = commits.length - 1; i >= 0; i--) {
    const start = starts.find((m) => commits[i].sha.startsWith(m.sinceSha))
    if (start) current = start.key
    tags[i] = current
  }
  return tags
}

/**
 * `shortcut` defaults to physical Control+V (never Cmd+V, so macOS paste is untouched).
 * `loadHistory` resolves to `{ commits }` and is called on first open, keeping it out of the main bundle.
 */
export function DesignVersionMenu({ shortcut = DEFAULT_SHORTCUT, label = 'Versions', loadHistory }) {
  const ctx = useDesignVersionContext()
  const enabled = !!ctx?.enabled
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [focusedSurface, setFocusedSurface] = useState(null)
  const [history, setHistory] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const openRef = useRef(open)
  openRef.current = open
  const panelId = useId()

  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  const { key, ctrl, meta, alt, shift } = shortcut
  useEffect(() => {
    if (!enabled) return
    const combo = { key, ctrl, meta, alt, shift }
    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.repeat || !matchesShortcut(e, combo)) return
      if (isEditable(e.composedPath()[0] ?? e.target)) return
      e.preventDefault()
      if (openRef.current) close()
      else setOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, key, ctrl, meta, alt, shift, close])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector('[role="radio"][tabindex="0"]') ?? panelRef.current
      target?.focus()
    })
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close])

  useEffect(() => {
    if (!open || history || !loadHistory) return
    let cancelled = false
    Promise.resolve(loadHistory())
      .then((mod) => {
        if (!cancelled) setHistory((mod?.default ?? mod)?.commits ?? [])
      })
      .catch(() => {
        if (!cancelled) setHistory([])
      })
    return () => {
      cancelled = true
    }
  }, [open, history, loadHistory])

  const majors = ctx?.majors ?? NO_MAJORS
  const commitTags = useMemo(() => (history ? tagCommits(history, majors) : []), [history, majors])

  if (!ctx || !enabled) return null
  const { surfaces, selections, setVersion, reset, shareUrl, activeMajor, setMajor, currentIsDefault, saveAsDefault } =
    ctx
  const activeMajorDef = majors.find((m) => m.key === activeMajor)

  const visible = surfaces.filter((s) => inScope(s.scope, activeMajor))
  const globalTweaks = visible.filter((s) => !Array.isArray(s.scope))
  const scopedTweaks = visible.filter((s) => Array.isArray(s.scope))
  const orderedTweaks = [...globalTweaks, ...scopedTweaks]

  const activeKey = (id) => {
    const surface = surfaces.find((s) => s.id === id)
    if (!surface) return undefined
    const selected = selections[id]
    return surface.versions.some((v) => v.key === selected) ? selected : surface.defaultKey
  }

  const focusSegment = (id, versionKey) => {
    panelRef.current
      ?.querySelector(`[data-dv-surface="${CSS.escape(id)}"] [data-dv-key="${CSS.escape(versionKey)}"]`)
      ?.focus()
  }

  const step = (id, delta) => {
    const surface = surfaces.find((s) => s.id === id)
    const current = activeKey(id)
    if (!surface || current === undefined) return
    const index = surface.versions.findIndex((v) => v.key === current)
    const next = surface.versions[(index + delta + surface.versions.length) % surface.versions.length]
    setVersion(id, next.key)
    focusSegment(id, next.key)
  }

  const selectMajor = (majorKey) => {
    setMajor(majorKey)
    panelRef.current?.querySelector(`[data-dv-major="${CSS.escape(majorKey)}"]`)?.focus()
  }

  const onPanelKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
      return
    }
    if (e.key === '[' || e.key === ']') {
      const fromTarget = e.target.closest('[data-dv-surface]')?.dataset.dvSurface
      const id = fromTarget ?? focusedSurface ?? orderedTweaks[0]?.id
      if (!id) return
      e.preventDefault()
      step(id, e.key === ']' ? 1 : -1)
    }
  }

  const onMajorsKeyDown = (e) => {
    const index = majors.findIndex((m) => m.key === activeMajor)
    const deltas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    if (e.key in deltas) {
      e.preventDefault()
      selectMajor(majors[(index + deltas[e.key] + majors.length) % majors.length].key)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      selectMajor(majors[e.key === 'Home' ? 0 : majors.length - 1].key)
    }
  }

  const onGroupKeyDown = (e, id) => {
    const surface = surfaces.find((s) => s.id === id)
    if (!surface) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      step(id, e.key === 'ArrowRight' ? 1 : -1)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const target = surface.versions[e.key === 'Home' ? 0 : surface.versions.length - 1]
      setVersion(id, target.key)
      focusSegment(id, target.key)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const index = orderedTweaks.findIndex((s) => s.id === id)
      const neighbor = orderedTweaks[index + (e.key === 'ArrowDown' ? 1 : -1)]
      const neighborKey = neighbor && activeKey(neighbor.id)
      if (neighbor && neighborKey) focusSegment(neighbor.id, neighborKey)
    }
  }

  const saveDefault = async () => {
    setSaveState('saving')
    try {
      const mode = await saveAsDefault()
      setSaveState(mode)
      window.setTimeout(() => setSaveState('idle'), 1800)
    } catch {
      setSaveState('error')
      window.setTimeout(() => setSaveState('idle'), 1800)
    }
  }

  const copyLink = async () => {
    const url = shareUrl()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link', url)
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const renderTweak = (surface) => {
    const active = activeKey(surface.id) ?? surface.defaultKey
    const note = surface.versions.find((v) => v.key === active)?.note
    const labelId = `${panelId}-${surface.id}`
    return (
      <div
        key={surface.id}
        className="dv-tweak"
        data-dv-surface={surface.id}
        onFocus={() => setFocusedSurface(surface.id)}
      >
        <span className="dv-tweak__label" id={labelId}>
          {surface.label}
        </span>
        <div className="dv-tweak__control">
          <div
            role="radiogroup"
            aria-labelledby={labelId}
            className="dv-tweak__options"
            onKeyDown={(e) => onGroupKeyDown(e, surface.id)}
          >
            {surface.versions.map((version) => {
              const isActive = version.key === active
              return (
                <button
                  key={version.key}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={isActive ? 0 : -1}
                  title={version.note}
                  data-dv-key={version.key}
                  data-hoverable
                  className={`dv-tweak__option${isActive ? ' dv-tweak__option--active' : ''}`}
                  onClick={() => setVersion(surface.id, version.key)}
                >
                  {isActive && <motion.span layoutId={`dv-tweak-${surface.id}`} className="dv-tweak__pill" />}
                  <span className="dv-tweak__option-label">{version.label}</span>
                </button>
              )
            })}
          </div>
          {surface.versions.some((v) => v.note) && (
            <p className="dv-tweak__note" aria-live="polite">
              {note ?? '\u00a0'}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="dv-menu" ref={rootRef} data-open={open}>
      <button
        ref={triggerRef}
        type="button"
        className="dv-menu__trigger dv-menu__glass"
        aria-expanded={open}
        aria-controls={panelId}
        aria-keyshortcuts={ariaShortcut(shortcut)}
        aria-label={`Design versions, viewing ${activeMajorDef?.name ?? 'default'}`}
        data-hoverable
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="dv-menu__dot" aria-hidden="true" />
        <span className="dv-menu__label">{label}</span>
        {activeMajorDef && <span className="dv-menu__count">{activeMajorDef.label}</span>}
        <kbd className="dv-menu__kbd">{formatShortcut(shortcut)}</kbd>
      </button>

      <MotionConfig transition={SPRING} reducedMotion="user">
        <LayoutGroup id={panelId}>
          <div
            ref={panelRef}
            id={panelId}
            className="dv-menu__panel dv-menu__glass"
            role="dialog"
            aria-label="Design versions"
            tabIndex={-1}
            onKeyDown={onPanelKeyDown}
          >
            <header className="dv-menu__header">
              <h2 className="dv-menu__title">{label}</h2>
              <span className="dv-menu__meta">
                {majors.length} {majors.length === 1 ? 'design' : 'designs'}
                {history && ` · ${history.length} commits`}
              </span>
              <kbd className="dv-menu__kbd dv-menu__header-kbd">{formatShortcut(shortcut)}</kbd>
              <button
                type="button"
                className="dv-menu__close"
                aria-label="Close versions"
                data-hoverable
                onClick={() => close()}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="dv-menu__body">
            {majors.length > 0 && (
              <div
                role="radiogroup"
                aria-label="Design"
                className="dv-majors"
                onKeyDown={onMajorsKeyDown}
              >
                {majors.map((major) => {
                  const isActive = major.key === activeMajor
                  const [from, to] = major.swatch ?? []
                  return (
                    <button
                      key={major.key}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      tabIndex={isActive ? 0 : -1}
                      data-dv-major={major.key}
                      data-hoverable
                      className={`dv-major${isActive ? ' dv-major--active' : ''}`}
                      onClick={() => setMajor(major.key)}
                    >
                      {isActive && <motion.span layoutId="dv-major-ring" className="dv-major__ring" />}
                      <span
                        className="dv-major__thumb"
                        aria-hidden="true"
                        style={from ? { '--dv-swatch-from': from, '--dv-swatch-to': to ?? from } : undefined}
                      >
                        Aa
                      </span>
                      <span className="dv-major__body">
                        <span className="dv-major__eyebrow">
                          {major.label}
                          {isActive && <span className="dv-major__viewing">Viewing</span>}
                        </span>
                        <span className="dv-major__name">{major.name}</span>
                        {major.description && <span className="dv-major__desc">{major.description}</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {orderedTweaks.length > 0 && (
              <section className="dv-section" aria-label="Tweaks">
                {globalTweaks.length > 0 && (
                  <div className="dv-tweak-group">
                    <h3 className="dv-section__label">Tweaks</h3>
                    {globalTweaks.map(renderTweak)}
                  </div>
                )}
                {scopedTweaks.length > 0 && (
                  <div className="dv-tweak-group">
                    <h3 className="dv-section__label">For {activeMajorDef?.name ?? 'this version'}</h3>
                    {scopedTweaks.map(renderTweak)}
                  </div>
                )}
              </section>
            )}

            {loadHistory && (
              <section className="dv-section" aria-label="Changelog">
                <h3 className="dv-section__label">Changelog</h3>
                {history === null ? (
                  <p className="dv-menu__empty">Loading commits…</p>
                ) : history.length === 0 ? (
                  <p className="dv-menu__empty">No commit history yet.</p>
                ) : (
                  <ol className="dv-changelog">
                    {history.map((commit, i) => {
                      const href = commit.previewUrl ?? commit.prUrl ?? commit.commitUrl
                      const dimmed = majors.length > 1 && commitTags[i] !== activeMajor
                      return (
                        <li key={commit.sha} className="dv-changelog__item">
                          <a
                            className="dv-commit"
                            href={href ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-dimmed={dimmed || undefined}
                            data-hoverable
                            title={`${commit.subject}${commit.previewUrl ? ' · open preview' : ''}`}
                          >
                            <span className="dv-commit__dot" aria-hidden="true" />
                            <code className="dv-commit__sha">{commit.sha.slice(0, 7)}</code>
                            {i === 0 && <span className="dv-commit__latest">Latest</span>}
                            <span className="dv-commit__subject">{readableSubject(commit.subject)}</span>
                            <time className="dv-commit__time" dateTime={commit.date}>
                              {relativeTime(commit.date)}
                            </time>
                          </a>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </section>
            )}
            </div>

            <div className="dv-menu__actions">
              <button
                type="button"
                className="dv-menu__action dv-menu__action--primary"
                data-hoverable
                disabled={saveState === 'saving' || (currentIsDefault && saveState === 'idle')}
                onClick={saveDefault}
              >
                {saveState === 'saving'
                  ? 'Saving'
                  : saveState === 'saved'
                    ? 'Saved'
                    : saveState === 'downloaded'
                      ? 'Downloaded'
                      : saveState === 'error'
                        ? 'Couldn’t save'
                        : currentIsDefault
                          ? 'Saved as default'
                          : 'Save as Default'}
              </button>
              <button type="button" className="dv-menu__action" data-hoverable onClick={copyLink}>
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                className="dv-menu__action"
                data-hoverable
                aria-label="Reset to defaults"
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </div>
        </LayoutGroup>
      </MotionConfig>
    </div>
  )
}
