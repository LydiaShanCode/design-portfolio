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
    key: 'pond',
    label: 'Pond',
    name: 'Pond',
    description: 'Same page. A blue water texture shows under the cursor and ripples as it moves.',
    swatch: ['#001dd9', '#ffffff'],
  },
  ...HERO_PLAYGROUND.map((v, i) => ({ ...v, label: `H${i + 1}`, swatch: ['#ffffff', '#001dd9'] })),
]
