import { badgePillClass } from './Badge'

function Chip({ href, children, className = '', icon = null, target = '_blank', rel = 'noreferrer' }) {
  return (
    <a
      href={href}
      className={`${badgePillClass} btn-hover gap-1 ${className}`}
      target={target}
      rel={rel}
    >
      <span>{children}</span>
      {icon}
    </a>
  )
}

export default Chip
