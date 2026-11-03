import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import { Agentation } from 'agentation'

// Endpoint is the agentation-mcp server from .cursor/mcp.json, so annotations reach the agent
export default function DevTools() {
  return (
    <>
      <DialRoot />
      <Agentation endpoint="http://localhost:4747" />
    </>
  )
}
