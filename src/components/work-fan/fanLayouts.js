// Desktop fan: one entry per stack slot
export const FAN_OFFSET = [-2, -1, 0, 1, 2]
export const FAN_TILT = [-8, -4, 0, 4, 8]
export const FAN_MIDDLE = FAN_OFFSET.indexOf(0)
export const FAN_EDGE = 2
export const FAN_CARD_WIDTH = 340
export const FAN_TIGHTEN = 0.82

// Make way
const FAN_GAP = 32
const FAN_PACK = 24
const FAN_HOVER_LIFT = -64
const FAN_HOVER_SCALE = 1.03
const FAN_HOVER_TILT_MAX = 12

const NEUTRAL_FILTER = 'brightness(1) saturate(1)'

export const FAN_VERSIONS = [
  { key: 'v1', label: 'Make way', note: 'Neighbours slide aside, the hovered card lifts out straight' },
  { key: 'v2', label: 'Spotlight', note: 'Everything else shrinks and dims so one card pops' },
  { key: 'v3', label: 'Dock', note: 'Magnify by distance, like the macOS dock' },
  { key: 'v4', label: '3D tilt', note: 'Hovered card tilts toward the pointer, others recede' },
  { key: 'v5', label: 'Hand', note: 'Cards pivot from below like a hand of playing cards' },
  { key: 'v6', label: 'Ripple', note: 'A gentle wave lifts the neighbours in turn' },
  { key: 'v7', label: 'Pull out', note: 'Ripple, but the card slides out from behind before coming to the front' },
  { key: 'v8', label: 'Around', note: 'Ripple, but the card travels out past the front card and swings around in front of it' },
  { key: 'v9', label: 'Restraint', note: 'Emil Kowalski\'s "you don\'t need animations": fan holds still, hovered card rises 14px in 150ms' },
]

// Versions that wait for the hovered card to clear its neighbour before layering it on top
export const FAN_FRONT_DELAY = { v7: 210, v8: 370 }

// Hand of cards pivots around a point well below each card
export const FAN_ORIGIN_Y = { v5: 1.9 }
// Only the 3D version follows the pointer
export const FAN_POINTER_TILT = { v4: 10 }

const restX = (spreadBase, slot) => spreadBase * FAN_TIGHTEN * FAN_OFFSET[slot]

const pose = ({ x = 0, y = 0, rotate = 0, scale = 1, filter = NEUTRAL_FILTER, transition }) => (
  transition ? { x, y, rotate, scale, filter, transition } : { x, y, rotate, scale, filter }
)

const restPoses = (spreadBase) =>
  FAN_OFFSET.map((_, slot) => pose({ x: restX(spreadBase, slot), rotate: FAN_TILT[slot] }))

const relation = (slot, hoverIndex) => ({
  side: Math.sign(slot - hoverIndex),
  depth: Math.abs(slot - hoverIndex),
})

/**
 * The hovered card holds its spot and stands straight. On each side, the nearest card clears
 * room beside it and the rest spread evenly out to the fan's edge, tilting further the further
 * out they sit, so both the spacing and the tilt taper at the same rate.
 * `anchorX` pins the hovered card where it already sits, so it can't slide out from under the pointer.
 */
function makeWay({ hoverIndex, spreadBase, edgeLimit, anchorX }) {
  const xs = FAN_OFFSET.map((_, slot) => restX(spreadBase, slot))
  const rotations = [...FAN_TILT]

  if (anchorX !== null) xs[hoverIndex] = anchorX
  rotations[hoverIndex] = 0
  const last = FAN_OFFSET.length - 1
  for (const side of [-1, 1]) {
    const outermost = side < 0 ? 0 : last
    const outside = Math.abs(outermost - hoverIndex)
    if (!outside) continue
    const fanEdge = spreadBase * FAN_EDGE
    const room = Math.max(0, Math.max(fanEdge, edgeLimit) - side * xs[hoverIndex] - (outside - 1) * FAN_PACK)
    const nearest = xs[hoverIndex] + side * Math.min(FAN_CARD_WIDTH + FAN_GAP, room)
    // The far end stays inside the fan unless the minimum packing pushes it past
    const far = side * Math.max(fanEdge, side * nearest + (outside - 1) * FAN_PACK)
    for (let depth = 1; depth <= outside; depth += 1) {
      const slot = hoverIndex + side * depth
      const t = outside === 1 ? 0 : (depth - 1) / (outside - 1)
      xs[slot] = nearest + (far - nearest) * t
      rotations[slot] = side * FAN_HOVER_TILT_MAX * (depth / outside)
    }
  }

  return xs.map((x, slot) => {
    const lift = slot === hoverIndex ? FAN_HOVER_LIFT : 0
    // The lift travels along the card's own (rotated) axis
    const tilt = (rotations[slot] * Math.PI) / 180
    return pose({
      x: x - lift * Math.sin(tilt),
      y: lift * Math.cos(tilt),
      rotate: rotations[slot],
      scale: slot === hoverIndex ? FAN_HOVER_SCALE : 1,
    })
  })
}

function spotlight({ hoverIndex, spreadBase }) {
  return FAN_OFFSET.map((_, slot) => {
    const { side, depth } = relation(slot, hoverIndex)
    if (!depth) return pose({ x: restX(spreadBase, slot), y: -48, scale: 1.06 })
    return pose({
      x: restX(spreadBase, slot) + side * 28,
      y: 18,
      rotate: FAN_TILT[slot] * 1.2,
      scale: 0.88,
      filter: 'brightness(0.97) saturate(0.55)',
    })
  })
}

function dock({ hoverIndex, spreadBase }) {
  const center = restX(spreadBase, hoverIndex)
  return FAN_OFFSET.map((_, slot) => {
    const { side, depth } = relation(slot, hoverIndex)
    if (!depth) return pose({ x: center, y: -40, scale: 1.08 })
    return pose({
      x: center + (restX(spreadBase, slot) - center) * 1.12 + side * 30,
      y: 14 * depth,
      rotate: FAN_TILT[slot],
      scale: Math.max(0.8, 1 - 0.07 * depth),
    })
  })
}

function recede({ hoverIndex, spreadBase }) {
  return FAN_OFFSET.map((_, slot) => {
    const { side, depth } = relation(slot, hoverIndex)
    if (!depth) return pose({ x: restX(spreadBase, slot), y: -40, scale: 1.05 })
    return pose({
      x: restX(spreadBase, slot) + side * 20,
      y: 10,
      rotate: FAN_TILT[slot],
      scale: 0.93,
      filter: 'brightness(0.98) saturate(0.8)',
    })
  })
}

const HAND_SPACING = 0.55
const HAND_ANGLE = 6
const HAND_SPRING = { type: 'spring', stiffness: 360, damping: 24, mass: 1.05 }

function hand({ hoverIndex, spreadBase }) {
  return FAN_OFFSET.map((offset, slot) => {
    const x = restX(spreadBase, slot) * HAND_SPACING
    const rotate = offset * HAND_ANGLE
    if (hoverIndex === null) return pose({ x, rotate, transition: HAND_SPRING })
    const { side, depth } = relation(slot, hoverIndex)
    if (!depth) return pose({ x, y: -72, rotate, scale: 1.04, transition: HAND_SPRING })
    return pose({ x, rotate: rotate + side * 5, transition: HAND_SPRING })
  })
}

const RIPPLE_LIFT = -88
const RIPPLE_SPRING = { type: 'spring', stiffness: 300, damping: 22, mass: 1 }

function ripple({ hoverIndex, spreadBase }) {
  if (hoverIndex === null) {
    return restPoses(spreadBase).map((rest) => ({ ...rest, transition: RIPPLE_SPRING }))
  }
  return FAN_OFFSET.map((_, slot) => {
    const { side, depth } = relation(slot, hoverIndex)
    const transition = { ...RIPPLE_SPRING, delay: depth * 0.04 }
    if (!depth) return pose({ x: restX(spreadBase, slot), y: RIPPLE_LIFT, scale: 1.04, transition })
    return pose({
      x: restX(spreadBase, slot) + side * (32 / depth),
      y: RIPPLE_LIFT * 0.42 ** depth,
      rotate: FAN_TILT[slot] + side * (3 / depth),
      transition,
    })
  })
}

const SWAP_OUT = 44
const SWAP_RISE = -28
const SWAP_TILT = 4
// The layer swap lands at the 42% keyframe, matching FAN_FRONT_DELAY.v7
const SWAP_TWEEN = { type: 'tween', duration: 0.5, times: [0, 0.42, 1], ease: ['easeOut', [0.34, 1.25, 0.64, 1]] }

function pullOut({ hoverIndex, hoverFrom, spreadBase }) {
  const poses = ripple({ hoverIndex, spreadBase })
  if (hoverIndex === null) return poses
  const side = Math.sign(hoverIndex - (hoverFrom ?? hoverIndex))
  if (!side) return poses
  const target = poses[hoverIndex]
  poses[hoverIndex] = {
    ...target,
    x: [null, target.x + side * SWAP_OUT, target.x],
    y: [null, target.y + SWAP_RISE, target.y],
    rotate: [null, target.rotate + side * SWAP_TILT, target.rotate],
    transition: { default: target.transition, x: SWAP_TWEEN, y: SWAP_TWEEN, rotate: SWAP_TWEEN },
  }
  return poses
}

// Fraction of a card width the moving card must clear before it can pass in front
const AROUND_CLEAR = 1.2
const AROUND_RISE = -64
const AROUND_TILT = 16
const AROUND_BEHIND_SCALE = 0.92
const AROUND_FRONT_SCALE = 1.1
// Out behind (0→0.42), swing in front while still clear (0.42→0.56), settle home (0.56→1).
// The layer swap lands inside the clear window, matching FAN_FRONT_DELAY.v8
const AROUND_TWEEN = {
  type: 'tween',
  duration: 0.8,
  times: [0, 0.42, 0.56, 1],
  ease: ['easeOut', 'easeInOut', [0.3, 1.25, 0.6, 1]],
}

const AROUND_YIELD_X = 22
const AROUND_YIELD_TILT = 7
const AROUND_YIELD_TWEEN = { ...AROUND_TWEEN, ease: ['easeOut', 'easeInOut', [0.3, 1.2, 0.6, 1]] }

function goAround({ hoverIndex, hoverFrom, spreadBase }) {
  const poses = ripple({ hoverIndex, spreadBase })
  if (hoverIndex === null || hoverFrom === null || hoverFrom === hoverIndex) return poses
  const side = Math.sign(hoverIndex - hoverFrom)
  const target = poses[hoverIndex]
  const front = poses[hoverFrom]
  const gap = Math.abs(target.x - front.x)
  const out = side * Math.max(120, FAN_CARD_WIDTH * AROUND_CLEAR - gap)
  poses[hoverIndex] = {
    ...target,
    x: [null, target.x + out, target.x + out * 0.88, target.x],
    y: [null, target.y + AROUND_RISE * 0.4, target.y + AROUND_RISE, target.y],
    rotate: [null, target.rotate + side * AROUND_TILT, target.rotate + side * AROUND_TILT * 0.5, target.rotate],
    scale: [null, AROUND_BEHIND_SCALE, AROUND_FRONT_SCALE, target.scale],
    transition: { default: target.transition, x: AROUND_TWEEN, y: AROUND_TWEEN, rotate: AROUND_TWEEN, scale: AROUND_TWEEN },
  }
  // The card being passed leans away from the one swinging around it, then settles
  poses[hoverFrom] = {
    ...front,
    x: [null, front.x - side * AROUND_YIELD_X, front.x - side * AROUND_YIELD_X * 0.7, front.x],
    rotate: [null, front.rotate - side * AROUND_YIELD_TILT, front.rotate - side * AROUND_YIELD_TILT * 0.8, front.rotate],
    transition: { default: front.transition, x: AROUND_YIELD_TWEEN, rotate: AROUND_YIELD_TWEEN },
  }
  return poses
}

// Hover is seen tens of times a visit, so it gets the near-imperceptible version: the fan holds
// still and only the hovered card rises a little, fast, with no spring and no neighbour motion
const RESTRAINT_LIFT = -14
const RESTRAINT_TWEEN = { type: 'tween', duration: 0.15, ease: 'easeOut' }

function restraint({ hoverIndex, spreadBase }) {
  return restPoses(spreadBase).map((rest, slot) => ({
    ...rest,
    y: slot === hoverIndex ? RESTRAINT_LIFT : 0,
    transition: RESTRAINT_TWEEN,
  }))
}

const LAYOUTS = { v1: makeWay, v2: spotlight, v3: dock, v4: recede, v5: hand, v6: ripple, v7: pullOut, v8: goAround, v9: restraint }

export function fanPoses(version, { hoverIndex, hoverFrom = null, spreadBase, edgeLimit, anchorX = null }) {
  const layout = LAYOUTS[version] || makeWay
  if (hoverIndex === null && ![hand, ripple, pullOut, goAround, restraint].includes(layout)) return restPoses(spreadBase)
  return layout({ hoverIndex, hoverFrom, spreadBase, edgeLimit, anchorX: version === 'v1' ? anchorX : null })
}
