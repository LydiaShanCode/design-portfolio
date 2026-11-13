import logo from '@src/assets/logo.svg'

/** The site's pixel-circle logo, standing in as the agent's icon. It spins while the agent works. */
function AgentMark({ busy = false, size = 24, className = '' }) {
  return (
    <img
      src={logo}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`wf-agent-mark${busy ? ' wf-agent-mark--busy' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default AgentMark
