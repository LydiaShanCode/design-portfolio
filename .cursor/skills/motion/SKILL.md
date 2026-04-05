---
name: motion
description: Motion and animation settings for this portfolio. Defines the canonical spring physics, easing tokens, and Framer Motion patterns used across all interactive components. Use when adding animations, transitions, or interactive motion to any component.
---

# Motion

## Canonical Spring

All interactive motion in this portfolio uses one spring. Tabs, sliding image viewers, draggable elements — they all share the same physical character.

```js
{ type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }
```

**What this feels like:** the element has weight. It travels with momentum, decelerates, and lands with a microscopic overshoot — like a physical object hitting a rubber stopper.

## Easing Tokens

Defined in `:root` in `index.css`:

| Token | Value | Use |
|---|---|---|
| `--ease-smooth` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | UI state changes (height, opacity, color) |
| `--ease-dramatic` | `cubic-bezier(0.12, 0.8, 0.2, 1)` | Theatrical entrance animations |

## Split Transitions

When animating both position and opacity together, give each property its own timing:

```js
{
  x: { type: 'spring', stiffness: 380, damping: 28, mass: 1.1 },
  opacity: { duration: 0.2, ease: 'easeInOut' },
}
```

The spring handles spatial travel; the short opacity fade covers the first/last frames where content would otherwise clip hard against container edges.

## Sliding Tab Pill

Active state is a single `motion.span` with `layoutId` scoped per group via `<LayoutGroup>`. Never crossfade two pills — move the one.

```jsx
<LayoutGroup id={`tabs-${groupIdx}`}>
  {tabs.map((label, tabIdx) => (
    <button key={label} className={`iterations-tab${tabIdx === activeIdx ? ' iterations-tab--active' : ''}`}>
      {tabIdx === activeIdx && (
        <motion.span
          layoutId="tab-pill"
          className="iterations-tab-pill"
          transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 1.1 }}
        />
      )}
      <span className="iterations-tab-label">{label}</span>
    </button>
  ))}
</LayoutGroup>
```

## Directional Image Slide

Track direction from previous index, pass as `custom` to variants. Use `mode="popLayout"` so the exiting element leaves the document flow and the entering element drives container height.

```js
const slideVariants = {
  enter: (dir) => ({ x: dir * -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * 48, opacity: 0 }),
}
```

```jsx
// Track direction
const prevIdxRef = useRef(activeIdx)
const [direction, setDirection] = useState(1)
useEffect(() => {
  if (prevIdxRef.current !== activeIdx) {
    setDirection(activeIdx > prevIdxRef.current ? 1 : -1)
    prevIdxRef.current = activeIdx
  }
}, [activeIdx])

// AnimatePresence
<AnimatePresence mode="popLayout" custom={direction}>
  <motion.img
    key={activeImage}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={slideTransition}
  />
</AnimatePresence>
```

## Anti-patterns

- Don't use `linear` easing for any UI motion
- Don't use `mode="wait"` for image carousels — it creates a blank frame between transitions
- Don't crossfade two active-state indicators — use a shared `layoutId` instead
- Don't mix arbitrary spring values; use the canonical spring above for consistency
