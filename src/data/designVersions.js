// Hero explorations from explorations/hero-playground. Each swaps only the hero; the rest is V1.
const HERO_PLAYGROUND = [
  { key: 'island', name: 'Hero · 3D Island', description: 'Walk a little character around an island with WASD, arrows or a joystick. The copy lives on signs.' },
  { key: 'ripple', name: 'Hero · Ripple', description: 'The hero sits under WebGL water. The cursor drags a wake through it; clicks drop stones.' },
  { key: 'dolphins', name: 'Hero · Dolphins', description: 'A school of ASCII dolphins swims around the copy, curious about the cursor until it gets close.' },
  { key: 'fling', name: 'Hero · Fling', description: 'Grab any letter of the headline and throw it. Tidy up springs them home.' },
  { key: 'ring', name: 'Hero · Type Ring', description: 'The verbs orbit the koi on a tilted ring. Drag to spin; it snaps to finish the sentence.' },
  { key: 'xray', name: 'Hero · X-ray', description: 'The cursor is a lens that reveals the hero’s blueprint: grid, redlines and type specs.' },
]

export const HERO_PLAYGROUND_KEYS = HERO_PLAYGROUND.map((v) => v.key)

// Work-first home layouts: the projects are the landing view, with no hero in front of them.
// Each replaces the whole home page and carries its own header (see components/work-first).
const WORK_FIRST = [
  { key: 'billboard', label: 'Bill', name: 'Work first · Billboard', description: 'One project on a wide stage with its clip playing, the other four on a shelf beside it. Rotates until you take over.' },
  { key: 'wall', label: 'Wall', name: 'Work first · Wall', description: 'Name pinned in a left rail; the right side is a staggered wall of large cards, every clip playing in view.' },
  { key: 'strips', label: 'Strip', name: 'Work first · Strips', description: 'All five projects as full-width bands that fill the screen. Rest on one and it opens to play its clip.' },
  { key: 'scenes', label: 'Scene', name: 'Work first · Scenes', description: 'One project per screen, video on the left and the story on the right, with a numbered index that tracks your scroll.' },
  { key: 'gallery', label: 'Reel', name: 'Work first · Reel', description: 'A horizontal gallery of tall cards. Scroll, drag, or use the arrows.' },
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
  {
    key: 'pond',
    label: 'Pond',
    name: 'Pond',
    description: 'Same page. A blue water texture shows under the cursor and ripples as it moves.',
    swatch: ['#001dd9', '#ffffff'],
  },
  ...WORK_FIRST.map((v) => ({ ...v, swatch: ['#fafbfd', '#001dd9'] })),
  ...HERO_PLAYGROUND.map((v, i) => ({ ...v, label: `H${i + 1}`, swatch: ['#ffffff', '#001dd9'] })),
]
