import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AgentMark from './AgentMark'
import WorkMedia from './WorkMedia'
import { STARTERS, projectBySlug } from './agentKnowledge'
import { withProjectAssets } from '../../data/projectAssets'
import { yearOf } from './workFirst'

const projectCache = new Map()
const projectFor = (slug) => {
  if (!projectCache.has(slug)) {
    const base = projectBySlug(slug)
    projectCache.set(slug, base ? withProjectAssets(base) : null)
  }
  return projectCache.get(slug)
}

function ProjectChip({ slug, onOpenProject }) {
  const ref = useRef(null)
  const project = projectFor(slug)
  if (!project) return null
  return (
    <button
      type="button"
      ref={ref}
      className="wf-chat-project"
      onClick={() => onOpenProject(project, ref.current)}
      data-hoverable
    >
      <WorkMedia project={project} still sizes="96px" className="wf-chat-project-thumb" />
      <span className="wf-chat-project-text">
        <span className="wf-chat-project-title">{project.title}</span>
        <span className="wf-chat-project-meta">{project.company} · {yearOf(project)}</span>
      </span>
      <span className="wf-chat-project-go" aria-hidden="true">→</span>
    </button>
  )
}

function AgentLink({ link }) {
  const external = link.href && !link.href.startsWith('mailto')
  const className = 'wf-chat-link'
  if (link.to) return <Link to={link.to} className={className} data-hoverable>{link.label}</Link>
  return (
    <a
      href={link.href}
      className={className}
      data-hoverable
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {link.label}
    </a>
  )
}

function Message({ message, onOpenProject, onAsk, busy, isLast }) {
  if (message.role === 'user') {
    return <li className="wf-chat-msg wf-chat-msg--user">{message.text}</li>
  }
  const thinking = message.status === 'thinking'
  const working = thinking || message.status === 'streaming'
  return (
    <li className="wf-chat-msg wf-chat-msg--agent">
      <AgentMark size={22} busy={working} />
      <div className="wf-chat-body">
        {thinking ? (
          <p className="wf-chat-thinking">Looking through the work</p>
        ) : (
          <p className="wf-chat-text">{message.text}</p>
        )}
        {message.status === 'done' && message.projects.length ? (
          <div className="wf-chat-projects">
            {message.projects.map((slug) => (
              <ProjectChip key={slug} slug={slug} onOpenProject={onOpenProject} />
            ))}
          </div>
        ) : null}
        {message.status === 'done' && message.links.length ? (
          <div className="wf-chat-links">
            {message.links.map((link) => (
              <AgentLink key={link.label} link={link} />
            ))}
          </div>
        ) : null}
        {message.status === 'done' && isLast && message.followUps.length ? (
          <div className="wf-chat-suggestions" aria-label="Suggested questions">
            {message.followUps.map((item) => (
              <button
                key={item}
                type="button"
                className="wf-chat-chip"
                onClick={() => onAsk(item)}
                disabled={busy}
                data-hoverable
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  )
}

function AgentPanel({ open, onClose, messages, busy, onAsk, onOpenProject }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const logRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const touchOnly = window.matchMedia('(hover: none)').matches
    const focusTimer = touchOnly ? 0 : setTimeout(() => inputRef.current?.focus(), 80)
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages])

  const submit = (event) => {
    event.preventDefault()
    if (onAsk(draft)) setDraft('')
  }

  const empty = messages.length === 0
  const lastMessage = messages[messages.length - 1]

  return (
    <>
      <div className={`wf-agent-scrim${open ? ' wf-agent-scrim--open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`wf-agent${open ? ' wf-agent--open' : ''}`}
        role="dialog"
        aria-label="Ask Lydia's agent"
        aria-hidden={!open}
      >
        <header className="wf-agent-head">
          <AgentMark size={28} busy={busy} />
          <div className="wf-agent-title">
            <h2>Lydia&apos;s agent</h2>
            <p>Answers come from the projects and CV on this site.</p>
          </div>
          <button type="button" className="wf-round wf-agent-close" onClick={onClose} aria-label="Close chat" data-hoverable>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="wf-agent-log" ref={logRef}>
          {empty ? (
            <div className="wf-agent-empty">
              <h3 className="wf-agent-welcome">Ask about the work.</h3>
              <p>
                I can walk you through any project, point to what shipped in code, or share the numbers behind it.
              </p>
              <div className="wf-chat-suggestions">
                {STARTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="wf-chat-chip"
                    onClick={() => onAsk(item)}
                    disabled={busy}
                    data-hoverable
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="wf-chat-list" aria-live="polite">
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  onOpenProject={onOpenProject}
                  onAsk={onAsk}
                  busy={busy}
                  isLast={message === lastMessage}
                />
              ))}
            </ol>
          )}
        </div>

        <form className="wf-agent-composer" onSubmit={submit}>
          <label className="wf-visually-hidden" htmlFor="wf-agent-input">Ask a question</label>
          <input
            id="wf-agent-input"
            ref={inputRef}
            className="wf-agent-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about a project, the CV, anything"
            autoComplete="off"
            enterKeyHint="send"
          />
          <button
            type="submit"
            className="wf-agent-send"
            disabled={busy || !draft.trim()}
            aria-label="Send"
            data-hoverable
          >
            <span aria-hidden="true">↑</span>
          </button>
        </form>
      </aside>
    </>
  )
}

export default AgentPanel
