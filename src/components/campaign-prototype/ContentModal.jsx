import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion'
import assets from './assets'
import { Badge, Icon, Switch } from './ui'
import { useEscape } from './hooks'
import { COLLECTIONS, FOLDERS, FOLDER_STACK, LIBRARY_MODULES, MODAL_TABS, POLICIES } from './data'

const EASE = [0.22, 0.61, 0.36, 1]

function PolicyGlyph({ size = 28 }) {
  return (
    <span className="cp-policy-glyph" style={{ width: size, height: size }} aria-hidden="true">
      <span />
    </span>
  )
}

function ModuleCard({ module, selected, onToggle, layout = 'grid' }) {
  return (
    <button
      type="button"
      className={`cp-mcard cp-mcard--${layout} ${selected ? 'cp-mcard--selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onToggle(module)}
    >
      <span className={`cp-mcard__art cp-tone cp-tone--${module.tone}`}>
        <img src={module.icon} alt="" draggable={false} />
        {module.brand ? <img className="cp-mcard__brand" src={assets.moduleBrand} alt="" draggable={false} /> : null}
        <span className="cp-mcard__check" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5L5 9l4.5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className="cp-mcard__title">{module.title}</span>
      <span className="cp-mcard__meta">
        <span>
          <Icon name="modalHistory" size={12} />~{module.minutes} m
        </span>
        <span>
          <Icon name="modalStar" size={12} />
          {module.rating}
        </span>
        <span className="cp-mcard__date">{module.date}</span>
      </span>
    </button>
  )
}

function FolderStack() {
  return (
    <div className="cp-folder__stack" aria-hidden="true">
      {FOLDER_STACK.map((card) => (
        <span
          key={card.tone}
          className={`cp-folder__mini cp-folder__mini--${card.tone}`}
          style={{ left: card.left, top: card.top, width: card.width, transform: `rotate(${card.rotate}deg)` }}
        >
          <span className="cp-folder__mini-art">
            <img src={assets.moduleMasks} alt="" draggable={false} />
          </span>
          <span className="cp-folder__mini-title">Deep Fake Attacks</span>
        </span>
      ))}
      <span className="cp-folder__fade" />
    </div>
  )
}

function FolderCard({ folder, expanded, onToggleExpand, selectedIds, onToggleModule }) {
  return (
    <motion.div
      layout="position"
      transition={{ duration: 0.28, ease: EASE }}
      className={`cp-folder ${expanded ? 'cp-folder--expanded' : ''}`}
    >
      <div className="cp-folder__head">
        <div className="cp-folder__titles">
          <h3>{folder.title}</h3>
          {folder.minutes && !expanded ? (
            <div className="cp-folder__chips">
              <span className="cp-chip cp-chip--plain">
                <Icon name="modalTimer" size={14} />~{folder.minutes} min
              </span>
              <span className="cp-chip cp-chip--plain">
                <Icon name="modalBook" size={14} />
                {folder.count} Modules
              </span>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="cp-folder__toggle"
          aria-label={expanded ? `Collapse ${folder.title}` : `Expand ${folder.title}`}
          aria-expanded={expanded}
          onClick={onToggleExpand}
        >
          <Icon name="modalChevron" size={20} className={expanded ? 'cp-folder__chevron cp-folder__chevron--up' : 'cp-folder__chevron'} />
        </button>
      </div>
      {expanded ? (
        <motion.div
          className="cp-folder__grid"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE }}
        >
          {folder.modules.map((module) => (
            <ModuleCard key={module.id} module={module} layout="compact" selected={selectedIds.has(module.id)} onToggle={onToggleModule} />
          ))}
        </motion.div>
      ) : (
        <FolderStack />
      )}
    </motion.div>
  )
}

function CollectionRow({ collection, added, onToggle }) {
  return (
    <div className={`cp-collection cp-collection--${collection.tone}`}>
      <div className="cp-collection__body">
        <h3>{collection.title}</h3>
        <div className="cp-folder__chips">
          <span className="cp-chip cp-chip--plain">
            <Icon name="modalTimer" size={14} />~{collection.minutes} min
          </span>
          <span className="cp-chip cp-chip--plain">
            <Icon name="modalBook" size={14} />
            {collection.count} Modules
          </span>
        </div>
      </div>
      <button type="button" className={`cp-button cp-button--outline cp-button--sm cp-collection__add ${added ? 'cp-collection__add--added' : ''}`} onClick={() => onToggle(collection)}>
        {added ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6.5L5 9l4.5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <Icon name="modalPlus" size={14} />
        )}
        <span>{added ? 'Added' : 'Add all'}</span>
      </button>
    </div>
  )
}

function PolicyRow({ policy, added, onToggle }) {
  return (
    <div className="cp-policy-row">
      <PolicyGlyph />
      <div className="cp-policy-row__text">
        <span>{policy.title}</span>
        {policy.hasDoc ? <Icon name="fileText" size={12} /> : null}
        {policy.subtitle ? <em>{policy.subtitle}</em> : null}
      </div>
      <button type="button" className="cp-icon-button cp-icon-button--sm" aria-label={`Preview ${policy.title}`}>
        <Icon name="modalCirclePlay" size={16} />
      </button>
      <button
        type="button"
        className={`cp-icon-button cp-icon-button--sm ${added ? 'cp-icon-button--active' : ''}`}
        aria-label={added ? `Remove ${policy.title}` : `Add ${policy.title}`}
        aria-pressed={added}
        onClick={() => onToggle(policy)}
      >
        {added ? (
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6.5L5 9l4.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <Icon name="modalPlus" size={16} />
        )}
      </button>
    </div>
  )
}

function SelectedItem({ item, onRemove }) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="cp-selected__item"
      transition={{ duration: 0.2, ease: EASE }}
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 20px rgba(61,66,65,0.14)', zIndex: 2 }}
      exit={{ opacity: 0, height: 0 }}
    >
      <span className="cp-selected__grip" aria-hidden="true" onPointerDown={(event) => controls.start(event)} />
      {item.type === 'policy' ? (
        <PolicyGlyph size={34} />
      ) : (
        <span className={`cp-selected__thumb cp-tone cp-tone--${item.tone}`}>
          <img src={item.icon} alt="" draggable={false} />
        </span>
      )}
      <div className="cp-selected__text">
        <span>{item.title}</span>
        <em>
          <Icon name="modalTimer" size={12} />~{item.type === 'policy' ? 2 : item.minutes + 3} min
        </em>
      </div>
      <button type="button" className="cp-icon-button cp-icon-button--sm" aria-label={`Remove ${item.title}`} onClick={() => onRemove(item)}>
        <Icon name="modalX" size={16} />
      </button>
    </Reorder.Item>
  )
}

function SelectedPanel({ items, setItems, options, setOptions }) {
  const moduleCount = items.filter((item) => item.type !== 'policy').length
  const minutes = items.reduce((sum, item) => sum + (item.type === 'policy' ? 2 : item.minutes + 3), 0)
  const empty = items.length === 0
  return (
    <aside className="cp-selected" aria-label="Selected modules">
      <div className="cp-selected__card">
        <div className="cp-selected__head">
          <h3>Selected modules</h3>
          <div className="cp-selected__chips">
            {empty ? (
              <Badge icon="modalPalette" size="sm">
                Branding off
              </Badge>
            ) : (
              <>
                <Badge icon="modalTimer" size="sm">
                  ~{minutes} min
                </Badge>
                <Badge icon="modalBook" size="sm">
                  {moduleCount} modules
                </Badge>
                <Badge icon="modalPaletteOn" size="sm">
                  Branding on
                </Badge>
              </>
            )}
          </div>
        </div>
        {empty ? (
          <div className="cp-selected__empty">
            <span className="cp-selected__ghost" />
            <span className="cp-selected__ghost" />
            <span className="cp-selected__ghost" />
            <span className="cp-selected__ghost" />
            <div className="cp-selected__empty-copy">
              <span className="cp-selected__empty-icon" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <p>
                Modules you select will
                <br />
                appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="cp-selected__list-wrap">
            <p className="cp-selected__hint">Drag to reorder</p>
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="cp-selected__list">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <SelectedItem key={item.id} item={item} onRemove={(removed) => setItems(items.filter((entry) => entry.id !== removed.id))} />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        )}
      </div>
      <div className="cp-selected__options">
        <div className="cp-selected__option">
          <Icon name="modalThumbsUp" size={14} />
          <span>Module feedback</span>
          <Switch checked={options.feedback} onChange={(feedback) => setOptions({ ...options, feedback })} label="Module feedback" />
        </div>
        <div className="cp-selected__option">
          <Icon name="modalCirclePlay" size={14} />
          <span>Autoplay</span>
          <Switch checked={options.autoplay} onChange={(autoplay) => setOptions({ ...options, autoplay })} label="Autoplay" />
        </div>
        <div className="cp-selected__option">
          <Icon name="modalClipboard" size={14} />
          <span>Test out</span>
          <Switch checked={options.testOut} onChange={(testOut) => setOptions({ ...options, testOut })} label="Test out" />
        </div>
      </div>
    </aside>
  )
}

export default function ContentModal({ initialItems, initialOptions, onSave, onClose }) {
  const [tab, setTab] = useState('Folders')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState(initialItems)
  const [options, setOptions] = useState(initialOptions)
  const [expandedFolder, setExpandedFolder] = useState(null)

  useEscape(true, onClose)

  const selectedIds = useMemo(() => new Set(items.map((item) => item.id)), [items])

  const toggleModule = useCallback((module) => {
    setItems((current) =>
      current.some((item) => item.id === module.id)
        ? current.filter((item) => item.id !== module.id)
        : [...current, { ...module, type: 'module' }],
    )
  }, [])

  const togglePolicy = useCallback((policy) => {
    setItems((current) =>
      current.some((item) => item.id === policy.id)
        ? current.filter((item) => item.id !== policy.id)
        : [...current, { ...policy, type: 'policy' }],
    )
  }, [])

  const toggleCollection = useCallback((collection) => {
    setItems((current) => {
      const ids = collection.modules.map((module) => module.id)
      const allAdded = ids.every((id) => current.some((item) => item.id === id))
      if (allAdded) return current.filter((item) => !ids.includes(item.id))
      const missing = collection.modules.filter((module) => !current.some((item) => item.id === module.id))
      return [...current, ...missing.map((module) => ({ ...module, type: 'module' }))]
    })
  }, [])

  const needle = query.trim().toLowerCase()
  const matches = (title) => !needle || title.toLowerCase().includes(needle)

  const folders = FOLDERS.filter((folder) => matches(folder.title))
  const collections = COLLECTIONS.filter((collection) => matches(collection.title))
  const library = LIBRARY_MODULES.filter((module) => matches(module.title))
  const policies = POLICIES.filter((policy) => matches(policy.title))

  const selectedCount = items.length

  return (
    <div className="cp-overlay cp-overlay--modal" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.div
        className="cp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-content-title"
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.26, ease: EASE }}
      >
        <header className="cp-modal__header">
          <div className="cp-modal__title">
            <Icon name="bookMarked" size={18} />
            <h2 id="cp-content-title" className="cp-heading cp-heading--card">
              Select content
            </h2>
          </div>
          <Badge size="sm" className="cp-modal__count">
            {selectedCount} selected
          </Badge>
        </header>

        <div className="cp-modal__toolbar">
          <div className="cp-tabs" role="tablist">
            {MODAL_TABS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                className={`cp-tabs__tab ${tab === name ? 'cp-tabs__tab--active' : ''}`}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="cp-search">
            <input type="text" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search content" />
            <Icon name="modalSearch" size={20} />
          </label>
        </div>

        <div className="cp-modal__body">
          <div className="cp-modal__main" role="tabpanel">
            {tab === 'Folders' ? (
              <div className="cp-folders">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    expanded={expandedFolder === folder.id}
                    onToggleExpand={() => setExpandedFolder(expandedFolder === folder.id ? null : folder.id)}
                    selectedIds={selectedIds}
                    onToggleModule={toggleModule}
                  />
                ))}
              </div>
            ) : null}
            {tab === 'Favourites' ? (
              <div className="cp-modal__empty">
                <p>No favourites yet</p>
                <span>Star modules in the library to find them here.</span>
              </div>
            ) : null}
            {tab === 'Collections' ? (
              <div className="cp-collections">
                {collections.map((collection) => (
                  <CollectionRow
                    key={collection.id}
                    collection={collection}
                    added={collection.modules.every((module) => selectedIds.has(module.id))}
                    onToggle={toggleCollection}
                  />
                ))}
              </div>
            ) : null}
            {tab === 'Modules' ? (
              <div className="cp-library">
                {library.map((module) => (
                  <ModuleCard key={module.id} module={module} selected={selectedIds.has(module.id)} onToggle={toggleModule} />
                ))}
              </div>
            ) : null}
            {tab === 'Policies' ? (
              <div className="cp-policies">
                {policies.map((policy) => (
                  <PolicyRow key={policy.id} policy={policy} added={selectedIds.has(policy.id)} onToggle={togglePolicy} />
                ))}
              </div>
            ) : null}
          </div>
          <SelectedPanel items={items} setItems={setItems} options={options} setOptions={setOptions} />
        </div>

        <footer className="cp-modal__footer">
          <button type="button" className="cp-button cp-button--primary cp-button--md" onClick={() => onSave({ items, options })}>
            Save
          </button>
        </footer>
      </motion.div>
    </div>
  )
}
