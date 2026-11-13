import { useCallback, useEffect, useRef, useState } from 'react'
import { followUpsFor, respond } from './agentKnowledge'

const THINK_MS = 650
const TOKEN_MS = 22

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Message state and a streamed reply. `onFocusProjects` receives the slugs an answer points at. */
export function useAgentChat({ onFocusProjects }) {
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const timer = useRef(0)
  const busyRef = useRef(false)
  const asked = useRef([])
  const nextId = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const patch = useCallback((id, changes) => {
    setMessages((list) => list.map((message) => (message.id === id ? { ...message, ...changes } : message)))
  }, [])

  const ask = useCallback(
    (raw) => {
      const query = raw.trim()
      if (!query || busyRef.current) return false
      busyRef.current = true
      setBusy(true)
      asked.current.push(query)

      const replyId = ++nextId.current
      setMessages((list) => [
        ...list,
        { id: ++nextId.current, role: 'user', text: query },
        { id: replyId, role: 'agent', text: '', status: 'thinking', projects: [], links: [], followUps: [] },
      ])

      const reply = respond(query)
      const instant = prefersReducedMotion()
      const tokens = reply.text.split(/(\s+)/)
      const step = Math.max(2, Math.ceil(tokens.length / 90))

      const finish = () => {
        patch(replyId, {
          text: reply.text,
          status: 'done',
          projects: reply.projects,
          links: reply.links,
          followUps: followUpsFor(asked.current),
        })
        onFocusProjects(reply.projects)
        busyRef.current = false
        setBusy(false)
      }

      if (instant) {
        timer.current = setTimeout(finish, 0)
        return true
      }

      let cursor = 0
      const stream = () => {
        cursor = Math.min(cursor + step, tokens.length)
        if (cursor >= tokens.length) {
          finish()
          return
        }
        patch(replyId, { text: tokens.slice(0, cursor).join(''), status: 'streaming' })
        timer.current = setTimeout(stream, TOKEN_MS)
      }
      timer.current = setTimeout(stream, THINK_MS)
      return true
    },
    [onFocusProjects, patch],
  )

  return { messages, busy, ask }
}
