export const badgePillClass =
  'inline-flex items-center rounded-full border border-dotted border-[var(--color-badge-border)] body-text px-[10px] py-1 text-[12px] font-medium whitespace-nowrap'

function Badge({ children, className = '' }) {
  return <span className={`${badgePillClass} ${className}`.trim()}>{children}</span>
}

export default Badge
