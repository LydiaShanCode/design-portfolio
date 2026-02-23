function Chip({ href, children, className = '', icon = null, target = '_blank', rel = 'noreferrer' }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 body-text px-[10px] py-1 text-[12px] font-medium hover:bg-blue-50 transition-colors ${className}`}
      target={target}
      rel={rel}
    >
      <span>{children}</span>
      {icon}
    </a>
  )
}

export default Chip
