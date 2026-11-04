const sources = import.meta.glob('../../../assets/prototypes/training-campaigns/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const iconUrls = Object.fromEntries(
  Object.entries(sources).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url]),
)

export const iconUrl = (name) => iconUrls[name]

export default function Icon({ name, size = 16, className = '' }) {
  return (
    <span
      className={`tc-icon ${className}`.trim()}
      style={{ '--tc-icon': `url("${iconUrls[name]}")`, width: size, height: size }}
      aria-hidden="true"
    />
  )
}
