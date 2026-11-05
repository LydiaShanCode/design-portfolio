import { useEffect, useState } from 'react'
import Picture from '../Picture'
import Video from '../Video'
import { isPortrait } from './workFirst'

/**
 * A project's still with its clip fading in over it once playback starts.
 * `playing` follows Video: undefined plays while in view, a boolean is caller-controlled.
 */
function WorkMedia({
  project,
  variant = 'card',
  playing,
  preload,
  sizes = '480px',
  priority = false,
  still = false,
  className = '',
}) {
  const media = still ? null : variant === 'hero' ? project.video : project.cardVideo
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (playing === false) setReady(false)
  }, [playing])

  return (
    <div
      className={`wf-media${isPortrait(project) ? ' wf-media--portrait' : ''}${ready ? ' wf-media--ready' : ''} ${className}`}
    >
      <Picture
        image={project.cardImage}
        placeholder={project.cardImagePlaceholder}
        sizes={sizes}
        priority={priority}
        className="wf-media-still"
      />
      {media ? (
        <Video
          media={media}
          playing={playing}
          preload={preload}
          className="wf-media-video"
          aria-hidden="true"
          onPlaying={() => setReady(true)}
        />
      ) : null}
    </div>
  )
}

export default WorkMedia
