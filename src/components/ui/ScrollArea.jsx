/**
 * ScrollArea — a styled scrollable container with a branded, pill-shaped thumb.
 *
 * Skinnable via CSS custom properties on the element or any ancestor:
 *   --scrollbar-thumb         default thumb color
 *   --scrollbar-thumb-hover   thumb on hover / active scroll
 *   --scrollbar-track         track background (usually transparent)
 *   --scrollbar-size          width (vertical) / height (horizontal) in px
 *
 * Variants: "minimal" (almost invisible), "branded" (blue accent), "neutral" (gray)
 * Orientation: "vertical" | "horizontal" | "both"
 */

const variantTokens = {
  branded: {
    '--scrollbar-thumb': 'rgba(0, 29, 217, 0.18)',
    '--scrollbar-thumb-hover': 'rgba(0, 29, 217, 0.55)',
    '--scrollbar-track': 'transparent',
    '--scrollbar-size': '5px',
  },
  minimal: {
    '--scrollbar-thumb': 'rgba(0, 29, 217, 0.08)',
    '--scrollbar-thumb-hover': 'rgba(0, 29, 217, 0.28)',
    '--scrollbar-track': 'transparent',
    '--scrollbar-size': '3px',
  },
  neutral: {
    '--scrollbar-thumb': 'rgba(139, 155, 196, 0.35)',
    '--scrollbar-thumb-hover': 'rgba(139, 155, 196, 0.75)',
    '--scrollbar-track': 'transparent',
    '--scrollbar-size': '5px',
  },
}

function ScrollArea({
  children,
  className = '',
  variant = 'branded',
  orientation = 'vertical',
  style = {},
  as: Tag = 'div',
}) {
  const overflowStyle =
    orientation === 'vertical'
      ? { overflowY: 'auto', overflowX: 'hidden' }
      : orientation === 'horizontal'
      ? { overflowX: 'auto', overflowY: 'hidden' }
      : { overflow: 'auto' }

  return (
    <Tag
      className={`scroll-area scroll-area--${variant} ${className}`.trim()}
      style={{ ...variantTokens[variant], ...overflowStyle, ...style }}
    >
      {children}
    </Tag>
  )
}

export default ScrollArea
