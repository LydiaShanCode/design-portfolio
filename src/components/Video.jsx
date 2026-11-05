import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// iOS (every browser) and desktop Safari will choose the AV1 source, fail to decode it
// inside a transformed card, and never continue to the H.264 source beside it. The work
// card then stays on its still and the flipped preview stays blank. H.264 paints there.
const skipAv1 = () => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const safari = /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg\/|OPR\/|FxiOS|Android/.test(ua)
  return iOS || safari
}

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
  const [skip, setSkip] = useState(0)
  const loadedKey = useRef('')
  const dropping = useRef(false)
  const mediaKey = media?.sources?.map((source) => source.src).join('|') ?? ''

  useEffect(() => {
    setSkip(0)
    dropping.current = false
  }, [mediaKey])

  const sources = useMemo(() => {
    if (!media?.sources?.length) return []
    const usable = skipAv1()
      ? media.sources.filter((source) => !source.type.includes('av01'))
      : media.sources
    const list = usable.length ? usable : media.sources
    return list.slice(Math.min(skip, Math.max(list.length - 1, 0)))
  }, [media, skip])

  const sourceKey = sources.map((source) => source.src).join('|')

  useEffect(() => {
    const video = ref.current
    if (!video || !sourceKey) return undefined
    const reduced = prefersReducedMotion()
    let want = controlled ? Boolean(playing) && !reduced : false

    if (loadedKey.current && loadedKey.current !== sourceKey) video.load()
    loadedKey.current = sourceKey
    dropping.current = false

    const sync = () => {
      if (want) {
        video.muted = true
        video.preload = 'auto'
        if (video.paused) video.play().catch(() => {})
      } else if (!video.paused) {
        video.pause()
      }
    }

    const onReady = () => {
      if (want && video.paused) sync()
    }

    // A source that errors out (AV1 the type check still accepted, a truncated file)
    // has to leave the element or the browser will not try the next one.
    const onError = () => {
      if (dropping.current || sources.length < 2) return
      dropping.current = true
      setSkip((n) => n + 1)
    }

    let observer
    if (!controlled) {
      if (!reduced) {
        observer = new IntersectionObserver(([entry]) => {
          want = entry.isIntersecting
          sync()
        }, { rootMargin: '200px 0px' })
        observer.observe(video)
      }
    } else {
      sync()
    }

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', onReady)
    video.addEventListener('error', onError)
    return () => {
      observer?.disconnect()
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onReady)
      video.removeEventListener('error', onError)
    }
  }, [controlled, playing, sourceKey, sources.length])

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
      {sources.map(({ src, type }) => (
        <source key={src} src={src} type={type} />
      ))}
    </video>
  )
})

export default Video
