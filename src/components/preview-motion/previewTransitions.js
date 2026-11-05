import { animate, cubicBezier } from 'framer-motion'

export const PREVIEW_VERSIONS = [
  { key: 'v1', label: 'Current', note: 'CSS flip that fades while it turns' },
  { key: 'v2', label: 'Turn over', note: 'The real card travels to centre and turns over; the preview is its back' },
  { key: 'v3', label: 'Grow', note: 'No flip: the card itself stretches open into the preview' },
  { key: 'v4', label: 'Pick up', note: 'Lifts and straightens in place first, then travels and turns over' },
  { key: 'v5', label: 'Flop', note: 'Turns top-over-bottom towards you on a little arc, like flipping a card off a table' },
  { key: 'v6', label: 'Open cover', note: 'The card arrives, then its front swings open on a hinge like a folder' },
]

export const MOTION_VERSIONS = new Set(['v2', 'v3', 'v4', 'v5', 'v6'])

const DURATION = { v2: 0.72, v3: 0.52, v4: 0.9, v5: 0.74, v6: 0.95 }
const CLOSE_SPEED = 0.78
const PERSPECTIVE = 1800
const MAX_SHADE = 0.32

const settle = cubicBezier(0.22, 1.08, 0.36, 1)
const smooth = cubicBezier(0.22, 0.61, 0.36, 1)
const turn = cubicBezier(0.45, 0, 0.25, 1)
const lift = cubicBezier(0.3, 0, 0.2, 1)

const lerp = (a, b, t) => a + (b - a) * t
const seg = (p, start, end, ease = smooth) => ease(Math.min(1, Math.max(0, (p - start) / (end - start))))
const shadeFor = (deg) => MAX_SHADE * (1 - Math.abs(Math.cos((deg * Math.PI) / 180)))

/** Where the clicked card sits on screen, including its fan tilt and scale. */
export function measureOrigin(node) {
  const rect = node.getBoundingClientRect()
  const style = getComputedStyle(node)
  const matrix = style.transform && style.transform !== 'none' ? new DOMMatrixReadOnly(style.transform) : null
  const a = matrix ? matrix.a : 1
  const b = matrix ? matrix.b : 0
  return {
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2,
    width: node.offsetWidth,
    height: node.offsetHeight,
    rotate: (Math.atan2(b, a) * 180) / Math.PI,
    scale: Math.hypot(a, b) || 1,
    radius: parseFloat(style.borderTopLeftRadius) || 8,
  }
}

/**
 * Geometry shared by every version. The preview card keeps its final layout the whole time; a
 * clip window cut to the small card's shape plus a transform makes it start exactly on the card.
 */
export function buildGeometry(origin, card) {
  // Layout box, not getBoundingClientRect: the card may still carry a transform when measured
  const parent = card.offsetParent.getBoundingClientRect()
  const rect = {
    width: card.offsetWidth,
    height: card.offsetHeight,
    cx: parent.left + card.offsetLeft + card.offsetWidth / 2,
    cy: parent.top + card.offsetTop + card.offsetHeight / 2,
  }
  const finalRadius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0
  const fit = Math.min(rect.width / origin.width, rect.height / origin.height)
  return {
    dx: origin.cx - rect.cx,
    dy: origin.cy - rect.cy,
    rotate: origin.rotate,
    startScale: origin.scale / fit,
    insetX: (rect.width - origin.width * fit) / 2,
    insetY: (rect.height - origin.height * fit) / 2,
    startRadius: (origin.radius * fit) / origin.scale,
    finalRadius,
    fit,
    faceWidth: origin.width * fit,
    faceHeight: origin.height * fit,
  }
}

const base = (g, travel, grow, open) => ({
  x: g.dx * (1 - travel),
  y: g.dy * (1 - travel),
  rotate: g.rotate * (1 - travel),
  scale: lerp(g.startScale, 1, grow),
  rotateX: 0,
  rotateY: 0,
  open,
  front: 0,
  shade: 0,
  hinge: null,
})

// Each timeline maps progress 0→1 to a pose; closing plays the same path backwards.
const TIMELINES = {
  v2(p, g) {
    const pose = base(g, seg(p, 0, 0.9, settle), seg(p, 0, 0.62), seg(p, 0.5, 1))
    pose.rotateY = lerp(-180, 0, seg(p, 0.08, 0.86, turn))
    pose.y -= 28 * Math.sin(Math.PI * seg(p, 0, 0.9))
    pose.front = pose.rotateY < -90 ? 1 : 0
    pose.shade = shadeFor(pose.rotateY)
    return pose
  },
  v3(p, g) {
    const pose = base(g, seg(p, 0, 1, settle), seg(p, 0, 1, settle), seg(p, 0.05, 0.95))
    pose.front = 1 - seg(p, 0.04, 0.34)
    return pose
  },
  v4(p, g) {
    const pick = seg(p, 0, 0.26, lift)
    const rest = seg(p, 0.22, 1, (t) => t)
    const pose = TIMELINES.v2(rest, g)
    const held = 1 - seg(p, 0.22, 0.5)
    pose.y -= 18 * pick * held
    pose.rotate = lerp(g.rotate, g.rotate * 0.2, pick) * (1 - seg(rest, 0, 0.9, settle))
    pose.scale *= 1 + 0.07 * pick * held
    return pose
  },
  v5(p, g) {
    const pose = base(g, seg(p, 0, 0.92, settle), seg(p, 0, 0.6), seg(p, 0.5, 1))
    pose.rotateX = lerp(180, 0, seg(p, 0.06, 0.86, turn))
    pose.y -= 64 * Math.sin(Math.PI * seg(p, 0, 0.92))
    pose.front = pose.rotateX > 90 ? 1 : 0
    pose.shade = shadeFor(pose.rotateX)
    return pose
  },
  v6(p, g) {
    const pose = base(g, seg(p, 0, 0.5, settle), seg(p, 0, 0.5), seg(p, 0.48, 1))
    const angle = lerp(0, -180, seg(p, 0.42, 0.96, turn))
    pose.hinge = { angle, front: angle > -90, shade: shadeFor(angle) }
    return pose
  },
}

function applyPose(pose, g, els) {
  const { card, front, shade, cover, hinge, hingeFront, hingeBack, hingeShade } = els
  const transform = `perspective(${PERSPECTIVE}px) translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg) `
    + `rotateX(${pose.rotateX}deg) rotateY(${pose.rotateY}deg) scale(${pose.scale})`
  const insetX = lerp(g.insetX, 0, pose.open)
  const insetY = lerp(g.insetY, 0, pose.open)
  card.style.transform = transform
  card.style.transformStyle = 'preserve-3d'
  card.style.clipPath = `inset(${insetY}px ${insetX}px round ${lerp(g.startRadius, g.finalRadius, pose.open)}px)`
  front.style.opacity = String(pose.front)
  shade.style.opacity = String(pose.shade)
  if (!pose.hinge) {
    cover.style.display = 'none'
    return
  }
  cover.style.display = ''
  cover.style.transform = `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg) scale(${pose.scale})`
  hinge.style.left = `${insetX}px`
  hinge.style.top = `${insetY}px`
  hinge.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${pose.hinge.angle}deg)`
  hingeFront.style.display = pose.hinge.front ? '' : 'none'
  hingeBack.style.display = pose.hinge.front ? 'none' : ''
  hingeShade.style.opacity = String(pose.hinge.shade)
}

function clearPose(els) {
  const { card, front, shade, cover } = els
  card.style.transform = ''
  card.style.transformStyle = 'flat'
  card.style.clipPath = ''
  front.style.opacity = '0'
  shade.style.opacity = '0'
  cover.style.display = 'none'
}

/** A static copy of the work card at its resting look, sized to the face it fills. */
export function cloneCardFace(node, fit) {
  const clone = node.cloneNode(true)
  clone.removeAttribute('data-hoverable')
  clone.removeAttribute('style')
  clone.classList.remove('work-card--hovered')
  clone.setAttribute('aria-hidden', 'true')
  clone.tabIndex = -1
  clone.querySelectorAll('video').forEach((video) => video.remove())
  clone.querySelectorAll('.work-card-video-overlay--hidden').forEach((el) => el.classList.remove('work-card-video-overlay--hidden'))
  Object.assign(clone.style, {
    backgroundImage: node.style.backgroundImage,
    position: 'absolute',
    left: '0',
    top: '0',
    width: `${node.offsetWidth}px`,
    height: `${node.offsetHeight}px`,
    maxWidth: 'none',
    transform: `scale(${fit})`,
    transformOrigin: '0 0',
    boxShadow: 'none',
    pointerEvents: 'none',
  })
  return clone
}

/** Plays a version's timeline from `from` to `to`, writing styles straight to the DOM each frame. */
export function playTimeline(version, geometry, els, { from, to, onComplete }) {
  const timeline = TIMELINES[version]
  const duration = DURATION[version] * (to < from ? CLOSE_SPEED : 1)
  applyPose(timeline(from, geometry), geometry, els)
  const controls = animate(from, to, {
    duration,
    ease: (t) => t,
    onUpdate: (p) => applyPose(timeline(p, geometry), geometry, els),
    onComplete: () => {
      if (to === 1) clearPose(els)
      onComplete?.()
    },
  })
  return controls
}

export function primePose(version, geometry, els) {
  applyPose(TIMELINES[version](0, geometry), geometry, els)
}
