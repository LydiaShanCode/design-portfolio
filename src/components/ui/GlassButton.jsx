/**
 * GlassButton — glassmorphic icon button from the design system.
 * Renders a <button> by default, or an <a> when `href` is provided.
 *
 * Sizes: 'sm' (28px) | 'md' (34px, default) | 'lg' (44px)
 *
 * Usage:
 *   <GlassButton size="md" onClick={...}>
 *     <ArrowUpRightIcon />
 *   </GlassButton>
 *
 *   <GlassButton href="https://..." size="lg" aria-label="Open link">
 *     <ArrowUpRightIcon />
 *   </GlassButton>
 */
function GlassButton({ children, href, onClick, size = 'md', className = '', 'aria-label': ariaLabel, ...props }) {
  const cls = `glass-btn glass-btn--${size}${className ? ` ${className}` : ''}`

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-label={ariaLabel}
        data-hoverable
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      aria-label={ariaLabel}
      data-hoverable
      {...props}
    >
      {children}
    </button>
  )
}

export default GlassButton
