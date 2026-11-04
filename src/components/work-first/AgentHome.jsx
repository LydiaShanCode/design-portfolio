import { useCallback, useEffect, useRef, useState } from 'react'
import AgentMark from './AgentMark'
import AgentPanel from './AgentPanel'
import BentoGrid from './BentoGrid'
import WorkBar from './WorkBar'
import WorkFooter from './WorkFooter'
import WorkShell from './WorkShell'
import { STARTERS } from './agentKnowledge'
import { WORK_TAGLINE, useWorkPreview, useWorkProjects } from './workFirst'
import { useAgentChat } from './useAgentChat'

const isTyping = (target) =>
  target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable]') !== null

function AgentHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()
  const [chatOpen, setChatOpen] = useState(false)
  const [focus, setFocus] = useState([])
  const triggerRef = useRef(null)
  const gridRef = useRef(null)

  const focusProjects = useCallback((slugs) => setFocus(slugs), [])
  const { messages, busy, ask } = useAgentChat({ onFocusProjects: focusProjects })

  const openChat = useCallback(() => setChatOpen(true), [])
  const closeChat = useCallback(() => {
    setChatOpen(false)
    setFocus([])
    if (panelHadFocus()) triggerRef.current?.focus()
  }, [])

  const askFromPage = (query) => {
    setChatOpen(true)
    ask(query)
  }

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      event.preventDefault()
      setChatOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!focus.length) return
    const target = gridRef.current?.querySelector(`[data-slug="${focus[0]}"]`)
    if (!target) return
    const rect = target.getBoundingClientRect()
    const hidden = rect.top < 72 || rect.bottom > window.innerHeight - 24
    if (hidden) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focus])

  return (
    <WorkShell layout="agent" chatOpen={chatOpen} selected={selected} onClose={close}>
      <WorkBar
        leading={
          <button
            type="button"
            ref={triggerRef}
            className="wf-agent-trigger"
            onClick={() => (chatOpen ? closeChat() : openChat())}
            aria-label="Ask Lydia's agent"
            aria-expanded={chatOpen}
            data-hoverable
          >
            <AgentMark busy={busy} size={24} />
            <span className="wf-agent-trigger-label">Ask my agent</span>
          </button>
        }
      />
      <main id="work" className="wf-bento" aria-label="Selected work">
        <div className="wf-agent-intro">
          <p className="wf-bento-intro">{WORK_TAGLINE}</p>
          <div className="wf-chat-suggestions wf-agent-prompts" aria-label="Ask the agent">
            {STARTERS.slice(0, 3).map((item) => (
              <button
                key={item}
                type="button"
                className="wf-chat-chip"
                onClick={() => askFromPage(item)}
                data-hoverable
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div ref={gridRef}>
          <BentoGrid projects={projects} onOpen={open} focus={focus} />
        </div>
      </main>
      <WorkFooter />
      <AgentPanel
        open={chatOpen}
        onClose={closeChat}
        messages={messages}
        busy={busy}
        onAsk={ask}
        onOpenProject={open}
      />
    </WorkShell>
  )
}

function panelHadFocus() {
  return Boolean(document.activeElement?.closest?.('.wf-agent'))
}

export default AgentHome
