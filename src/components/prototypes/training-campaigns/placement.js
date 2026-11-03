/**
 * Decides whether a popover should open upward. Measures in layout units so the
 * result stays correct when the prototype is scaled down inside a case study.
 */
export function shouldFlip(anchor, neededHeight) {
  const scroller = anchor?.closest('.tc-panel__scroll')
  if (!scroller) return false
  const anchorRect = anchor.getBoundingClientRect()
  const scrollerRect = scroller.getBoundingClientRect()
  const scale = anchorRect.width / (anchor.offsetWidth || anchorRect.width) || 1
  const below = (scrollerRect.bottom - anchorRect.bottom) / scale
  const above = (anchorRect.top - scrollerRect.top) / scale
  return below < neededHeight && above > below
}
