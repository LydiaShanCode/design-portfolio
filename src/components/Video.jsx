import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Muted looping video built from getVideo() data.
 *
 * playing: undefined → autoplay while in view (IntersectionObserver)
 *          boolean   → controlled by the caller (e.g. hover previews)
 * preload: 'none' until the caller (or visibility) says the clip is wanted
 */
const Video = forwardRef(function Video({
  media,
  playing,
  preload = 'metadata',
  className,
  style,
  onPlaying,
  ...videoProps
}, forwardedRef) {
  const ref = useRef(null)
  useImperativeHandle(forwardedRef, () => ref.current)
  const controlled = typeof playing === 'boolean'

  useEffect(() => {
    const video = ref.current
    if (!video || controlled) return
    if (prefersReducedMotion()) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.preload = 'auto'
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }, { rootMargin: '200px 0px' })
    observer.observe(video)
    return () => observer.disconnect()
  }, [controlled, media])

  useEffect(() => {
    const video = ref.current
    if (!video || !controlled) return
    if (playing && !prefersReducedMotion()) {
      video.preload = 'auto'
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [controlled, playing])

  if (!media) return null

  return (
    <video
      ref={ref}
      className={className}
      poster={media.poster || undefined}
      width={media.width}
      height={media.height}
      preload={preload}
      muted
      loop
      playsInline
      disablePictureInPicture
      style={{ aspectRatio: `${media.width} / ${media.height}`, ...style }}
      onPlaying={onPlaying}
      {...videoProps}
    >
      {media.sources.map(({ src, type }) => (
        <source key={src} src={src} type={type} />
      ))}
    </video>
  )
})

export default Video
