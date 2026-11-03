import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Icon } from './ui'
import { useDismiss, useEscape } from './hooks'
import { AUDIENCE_GROUPS, AUDIENCE_MEMBERSHIP } from './data'

function SelectButton({ icon, children, open, onClick, muted = false }) {
  return (
    <button
      type="button"
      className={`cp-select ${open ? 'cp-select--open' : ''} ${muted ? 'cp-select--muted' : ''}`}
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={onClick}
    >
      {icon ? <Icon name={icon} size={15} /> : null}
      <span>{children}</span>
      <Icon name="chevronDown" size={16} className="cp-select__chevron" />
    </button>
  )
}

function Menu({ children, className = '' }) {
  return (
    <div className={`cp-menu ${className}`.trim()} role="listbox">
      {children}
    </div>
  )
}

function MenuItem({ children, selected, onClick }) {
  return (
    <button type="button" role="option" aria-selected={selected} className="cp-menu__item" onClick={onClick}>
      {children}
    </button>
  )
}

function AnchoredSelect({ id, openId, setOpenId, label, icon, menu, muted }) {
  const ref = useRef(null)
  const open = openId === id
  const close = useCallback(() => setOpenId((current) => (current === id ? null : current)), [id, setOpenId])
  useDismiss(ref, open, close)
  return (
    <div className="cp-anchor" ref={ref}>
      <SelectButton icon={icon} open={open} muted={muted} onClick={() => setOpenId(open ? null : id)}>
        {label}
      </SelectButton>
      {open ? menu(() => setOpenId(null)) : null}
    </div>
  )
}

function GroupMenu({ groups, onPick, onCreate }) {
  const [query, setQuery] = useState('')
  const filtered = groups.filter((group) => group.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <div className="cp-menu cp-menu--search" role="listbox">
      <label className="cp-menu__search">
        <input
          autoFocus
          type="text"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search groups"
        />
        <Icon name="resSearch" size={16} />
      </label>
      <div className="cp-menu__scroll">
        {filtered.map((group) => (
          <MenuItem key={group} onClick={() => onPick(group)}>
            {group}
          </MenuItem>
        ))}
        {filtered.length === 0 ? <div className="cp-menu__empty">No groups found</div> : null}
      </div>
      <button type="button" className="cp-button cp-button--outline cp-button--sm cp-menu__create" onClick={onCreate}>
        Create new group
      </button>
    </div>
  )
}

export default function CreateDialog({ initial, onCancel, onCreate }) {
  const [name, setName] = useState(initial.name)
  const [learnerTitle, setLearnerTitle] = useState(null)
  const [description, setDescription] = useState(null)
  const [audienceType, setAudienceType] = useState(null)
  const [group, setGroup] = useState(null)
  const [membership, setMembership] = useState(AUDIENCE_MEMBERSHIP[0])
  const [groups, setGroups] = useState(AUDIENCE_GROUPS)
  const [openId, setOpenId] = useState(null)
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
    nameRef.current?.select()
  }, [])

  const handleEscape = useCallback(() => {
    if (openId) setOpenId(null)
    else onCancel()
  }, [openId, onCancel])
  useEscape(true, handleEscape)

  const audienceReady = audienceType === 'all' || (audienceType === 'groups' && group)
  const canCreate = name.trim().length > 0 && audienceReady

  const submit = () => {
    if (!canCreate) return
    onCreate({
      name: name.trim(),
      learnerTitle: learnerTitle?.trim() || null,
      description: description?.trim() || null,
      audience: { type: audienceType, group: audienceType === 'all' ? 'All employees' : group, membership },
    })
  }

  const createGroup = () => {
    const created = `New group ${groups.length - AUDIENCE_GROUPS.length + 1}`
    setGroups([...groups, created])
    setGroup(created)
    setOpenId(null)
  }

  const summaryTitle = `${audienceType === 'all' ? 'All employees' : group}: ${membership === AUDIENCE_MEMBERSHIP[0] ? 'Current and future' : membership === AUDIENCE_MEMBERSHIP[1] ? 'Future only' : 'Current only'}`

  return (
    <div className="cp-overlay" onPointerDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div className="cp-dialog" role="dialog" aria-modal="true" aria-labelledby="cp-create-title">
        <div className="cp-dialog__body">
          <h2 className="cp-dialog__title" id="cp-create-title">
            Create training campaign
          </h2>

          <div className="cp-field">
            <label className="cp-field__label" htmlFor="cp-campaign-name">
              Name
            </label>
            <input
              ref={nameRef}
              id="cp-campaign-name"
              className="cp-input"
              type="text"
              placeholder="Title of training campaign"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submit()}
            />
            <div className="cp-field__adders">
              {learnerTitle === null ? (
                <button type="button" className="cp-adder" onClick={() => setLearnerTitle('')}>
                  <Icon name="modalPlus" size={14} />
                  <span>Learner-facing title</span>
                </button>
              ) : null}
              {description === null ? (
                <button type="button" className="cp-adder" onClick={() => setDescription('')}>
                  <Icon name="modalPlus" size={14} />
                  <span>Description</span>
                </button>
              ) : null}
            </div>
          </div>

          {learnerTitle !== null ? (
            <div className="cp-field cp-field--enter">
              <label className="cp-field__label" htmlFor="cp-learner-title">
                Learner-facing title
              </label>
              <input
                autoFocus
                id="cp-learner-title"
                className="cp-input"
                type="text"
                placeholder="Complete your onboarding to Adaptive"
                value={learnerTitle}
                onChange={(event) => setLearnerTitle(event.target.value)}
              />
            </div>
          ) : null}

          {description !== null ? (
            <div className="cp-field cp-field--enter">
              <label className="cp-field__label" htmlFor="cp-description">
                Description
              </label>
              <textarea
                autoFocus
                id="cp-description"
                className="cp-input cp-input--area"
                rows={2}
                placeholder="What should learners know about this campaign?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          ) : null}

          <div className="cp-field">
            <span className="cp-field__label">Audience</span>
            <div className="cp-field__row">
              {audienceType === null ? (
                <AnchoredSelect
                  id="audience"
                  openId={openId}
                  setOpenId={setOpenId}
                  label="Select audience"
                  menu={(close) => (
                    <Menu>
                      <MenuItem
                        onClick={() => {
                          setAudienceType('groups')
                          close()
                          setOpenId('group')
                        }}
                      >
                        Groups
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setAudienceType('all')
                          close()
                        }}
                      >
                        All employees
                      </MenuItem>
                    </Menu>
                  )}
                />
              ) : (
                <>
                  <AnchoredSelect
                    id="audience"
                    openId={openId}
                    setOpenId={setOpenId}
                    label={audienceType === 'all' ? 'All employees' : 'Groups'}
                    icon={group || audienceType === 'all' ? 'usersMd' : undefined}
                    menu={(close) => (
                      <Menu>
                        <MenuItem
                          selected={audienceType === 'groups'}
                          onClick={() => {
                            setAudienceType('groups')
                            close()
                          }}
                        >
                          Groups
                        </MenuItem>
                        <MenuItem
                          selected={audienceType === 'all'}
                          onClick={() => {
                            setAudienceType('all')
                            close()
                          }}
                        >
                          All employees
                        </MenuItem>
                      </Menu>
                    )}
                  />
                  {audienceType === 'groups' ? (
                    <AnchoredSelect
                      id="group"
                      openId={openId}
                      setOpenId={setOpenId}
                      label={group || 'Select group'}
                      icon={group ? 'usersMd' : undefined}
                      menu={(close) => (
                        <GroupMenu
                          groups={groups}
                          onPick={(picked) => {
                            setGroup(picked)
                            close()
                          }}
                          onCreate={createGroup}
                        />
                      )}
                    />
                  ) : null}
                  {audienceReady ? (
                    <AnchoredSelect
                      id="membership"
                      openId={openId}
                      setOpenId={setOpenId}
                      label={membership}
                      menu={(close) => (
                        <Menu className="cp-menu--wide">
                          {AUDIENCE_MEMBERSHIP.map((option) => (
                            <MenuItem
                              key={option}
                              selected={option === membership}
                              onClick={() => {
                                setMembership(option)
                                close()
                              }}
                            >
                              {option}
                            </MenuItem>
                          ))}
                        </Menu>
                      )}
                    />
                  ) : null}
                </>
              )}
            </div>

            {audienceReady ? (
              <div className="cp-audience-summary">
                <div className="cp-audience-summary__main">
                  <p className="cp-audience-summary__title">{summaryTitle}</p>
                  <div className="cp-audience-summary__chips">
                    <span className="cp-chip">
                      <Icon name="usersSm" size={15} />
                      36 employees
                    </span>
                    <span className="cp-chip">
                      <Icon name="sliders" size={15} />
                      2 conditions
                    </span>
                    <span className="cp-chip">
                      <Icon name="calendarChip" size={15} />
                      Assigned to 2 campaigns
                    </span>
                  </div>
                </div>
                <p className="cp-audience-summary__note">
                  All existing employees will be enrolled on launch and all new members added to the group will be enrolled on a
                  rolling basis.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="cp-dialog__footer">
          <Button variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" disabled={!canCreate} onClick={submit}>
            Create campaign
          </Button>
        </div>
      </div>
    </div>
  )
}
