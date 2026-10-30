import { useEffect, useRef, useState } from 'react'

// imagetools clamps requested widths to the intrinsic size, so small sources repeat the same width
const dedupeSrcset = (srcset) =>
  [...new Map(srcset.split(', ').map((entry) => [entry.split(' ').pop(), entry])).values()].join(', ')

/**
 * Renders `?responsive` imports (see vite.config.js) as <picture>. Plain URL strings
 * (SVG, GIF) fall through to a regular <img> so callers don't need to branch.
 */
function Picture({
  image,
  placeholder,
  alt = '',
  sizes = '100vw',
  priority = false,
  className,
  style,
  onLoad,
  ...imgProps
}) {
  const imgRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [image])

  if (!image) return null

  const isResponsive = typeof image === 'object'
  const src = isResponsive ? image.img.src : image
  const placeholderStyle = placeholder && !loaded
    ? { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : null

  const img = (
    <img
      ref={imgRef}
      src={src}
      width={isResponsive ? image.img.w : undefined}
      height={isResponsive ? image.img.h : undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
      style={placeholderStyle ? { ...placeholderStyle, ...style } : style}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      {...imgProps}
    />
  )

  if (!isResponsive) return img

  return (
    <picture style={{ display: 'contents' }}>
      {Object.entries(image.sources).map(([format, srcset]) => (
        <source key={format} type={`image/${format}`} srcSet={dedupeSrcset(srcset)} sizes={sizes} />
      ))}
      {img}
    </picture>
  )
}

export default Picture
