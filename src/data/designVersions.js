// Hero explorations from explorations/hero-playground. Each swaps only the hero; the rest is V1.
// Island, dolphins, fling and the type ring stay in explorations/hero-playground.
// They are off the switcher; Ripple and X-ray stay.
const HERO_PLAYGROUND = [
  { key: 'ripple', name: 'Hero · Ripple', description: 'The hero sits under WebGL water. The cursor drags a wake through it; clicks drop stones.' },
  { key: 'xray', name: 'Hero · X-ray', description: 'The cursor is a lens that reveals the hero’s blueprint: grid, redlines and type specs.' },
]

export const HERO_PLAYGROUND_KEYS = HERO_PLAYGROUND.map((v) => v.key)

// Work-first home layouts: the projects are the landing view, with no hero in front of them.
// Each replaces the whole home page and carries its own header (see components/work-first).
// Billboard, strips, scenes and the reel live in src/archive/work-first and are off the switcher.
const WORK_FIRST = [
  { key: 'wall', label: 'Wall', name: 'Work first · Wall', description: 'Name pinned in a left rail; the right side is a staggered wall of large cards, every clip playing in view.' },
  { key: 'bento', label: 'Bento', name: 'Work first · Bento', description: 'A mosaic with one large lead, a tall cell for the mobile project, and the rest tiled underneath.' },
  { key: 'agent', label: 'AI', name: 'Work first · Agent', description: 'The bento work grid, with the spinning logo as an AI agent. Click it to ask about any project, the numbers, or the CV; the page picks out what it mentions.' },
  { key: 'onepager', label: 'One', name: 'Work first · One-pager', description: 'A small photo and a short bio, then straight into five projects, each with the results it moved. Reads top to bottom in about five minutes.' },
]

export const WORK_FIRST_KEYS = WORK_FIRST.map((v) => v.key)

// Overarching portfolio versions, newest first. The first entry is the default.
// `sinceSha` marks the commit a version started at, so the changelog can tag commits per version.
// Micro tweaks opt into a version with `useDesignVersion(id, versions, { scope: ['v1'] })`.
export const MAJOR_VERSIONS = [
  {
    key: 'v1',
    label: 'V1',
    name: 'Fanned Deck',
    description: 'Serif hero over the water canvas, project cards fanned like a hand, activity log below.',
    swatch: ['#001dd9', '#c5cee8'],
    sinceSha: '7d0b979',
  },
  {
    key: 'column',
    label: 'Col',
    name: 'Column',
    description: 'Name and links pinned left; one column of cards that roll over a drum as you scroll.',
    swatch: ['#f8f8fb', '#1c1c1c'],
  },
  ...WORK_FIRST.map((v) => ({ ...v, swatch: ['#fafbfd', '#001dd9'] })),
  ...HERO_PLAYGROUND.map((v) => ({
    ...v,
    label: v.key === 'ripple' ? 'Ripple' : 'X-ray',
    swatch: ['#ffffff', '#001dd9'],
  })),
]
