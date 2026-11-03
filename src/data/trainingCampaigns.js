import slideWorkingSecurely from '../assets/prototypes/training-campaigns/img/slide-working-securely.webp'
import slideDeepfakeQuiz from '../assets/prototypes/training-campaigns/img/slide-deepfake-quiz.webp'
import slideVoicePhishing from '../assets/prototypes/training-campaigns/img/slide-voice-phishing.webp'
import slideFakeItSupport from '../assets/prototypes/training-campaigns/img/slide-fake-it-support.webp'
import slideEmailPhishing from '../assets/prototypes/training-campaigns/img/slide-email-phishing.webp'
import module1 from '../assets/prototypes/training-campaigns/img/module-1.webp'
import module2 from '../assets/prototypes/training-campaigns/img/module-2.webp'
import module3 from '../assets/prototypes/training-campaigns/img/module-3.webp'
import module4 from '../assets/prototypes/training-campaigns/img/module-4.webp'
import module5 from '../assets/prototypes/training-campaigns/img/module-5.webp'

export const PAGE_SIZE = 8
export const TOTAL_PAGES = 36
export const PROTOTYPE_TODAY = '2026-08-15'
export const ENDING_SOON_DAYS = 7
export const STARTING_SOON_DAYS = 2

export const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'one-time', label: 'One-time' },
  { value: 'auto-enroll', label: 'Auto-enroll' },
  { value: 'fixed', label: 'Fixed dates' },
]

export const STATUS_LABELS = {
  live: 'Live',
  scheduled: 'Scheduled',
  'past-due': 'Past due',
  ended: 'Ended',
  draft: 'Draft',
}

export const MODULES = [
  { id: 'phi', title: 'Protecting PHI', image: module1 },
  { id: 'eu-ai', title: 'EU AI Act', image: module2 },
  { id: 'deepfake', title: 'Deepfake attacks', image: module3 },
  { id: 'it-support', title: 'Fake IT Support', image: module4 },
  { id: 'think-click', title: 'Think Before You Click', image: module5 },
  { id: 'password', title: 'Your Password Is Not Enough', image: module1 },
  { id: 'reporting', title: 'Reporting Suspicious Activity', image: module4 },
  { id: 'mfa', title: 'Multi-factor Fatigue', image: module5 },
]

const SLIDES = {
  workingSecurely: slideWorkingSecurely,
  deepfakeQuiz: slideDeepfakeQuiz,
  voicePhishing: slideVoicePhishing,
  fakeItSupport: slideFakeItSupport,
  emailPhishing: slideEmailPhishing,
}

const TITLE = 'Annual training for 2026 New designers'
const NEW_HIRES = { kind: 'group', label: 'New hires', enrolled: 100 }

/*
 * tier orders the list the way the card-sorting spec does: live, scheduled,
 * past due, ended, draft. Older generated campaigns sit after the draft so the
 * first page matches the mockup while the pager still reaches 36 pages.
 */
const TIER = { live: 1, scheduled: 2, 'past-due': 3, ended: 4, draft: 5, archived: 6 }

export const SEED_CAMPAIGNS = [
  {
    id: 'c-1',
    title: TITLE,
    status: 'live',
    type: 'one-time',
    slide: SLIDES.workingSecurely,
    stackCount: 5,
    start: '2026-06-01',
    end: '2026-06-22',
    dateIcon: 'clock',
    audience: NEW_HIRES,
    completed: 70,
    overdue: 10,
    total: 100,
  },
  {
    id: 'c-2',
    title: TITLE,
    status: 'live',
    type: 'fixed',
    slide: SLIDES.deepfakeQuiz,
    stackCount: 5,
    start: '2026-08-01',
    end: '2026-09-01',
    audience: NEW_HIRES,
    completed: 50,
    overdue: 10,
    total: 100,
  },
  {
    id: 'c-3',
    title: TITLE,
    status: 'scheduled',
    type: 'auto-enroll',
    slide: SLIDES.fakeItSupport,
    stackCount: 5,
    start: '2026-08-17',
    durationDays: 14,
    startsInDays: 2,
    audience: { kind: 'all', label: 'All employees', enrolled: 1500 },
  },
  {
    id: 'c-4',
    title: TITLE,
    status: 'past-due',
    type: 'fixed',
    slide: SLIDES.voicePhishing,
    stackCount: 5,
    start: '2025-08-01',
    end: '2026-08-01',
    audience: NEW_HIRES,
    completed: 70,
    overdue: 10,
    total: 100,
  },
  {
    id: 'c-5',
    title: TITLE,
    status: 'past-due',
    type: 'fixed',
    slide: SLIDES.voicePhishing,
    stackCount: 5,
    start: '2025-08-01',
    end: '2026-08-01',
    audience: NEW_HIRES,
    completed: 70,
    overdue: 10,
    total: 100,
  },
  {
    id: 'c-6',
    title: TITLE,
    status: 'ended',
    type: 'auto-enroll',
    slide: SLIDES.emailPhishing,
    stackCount: 5,
    start: '2025-07-26',
    end: '2026-07-27',
    audience: NEW_HIRES,
    completed: 100,
    overdue: 0,
    total: 100,
  },
  {
    id: 'c-7',
    title: TITLE,
    status: 'ended',
    type: 'fixed',
    slide: SLIDES.voicePhishing,
    stackCount: 5,
    start: '2025-04-26',
    end: '2026-04-27',
    audience: NEW_HIRES,
    completed: 90,
    overdue: 10,
    total: 100,
  },
  {
    id: 'c-8',
    title: TITLE,
    status: 'draft',
    type: 'fixed',
    slide: SLIDES.workingSecurely,
    stackCount: 5,
    createdAt: '2026-08-10',
  },
]

const ARCHIVE_TITLES = [
  'Phishing awareness for finance',
  'Secure remote work essentials',
  'Data handling for support teams',
  'Quarterly security refresher',
  'Password hygiene for contractors',
  'Social engineering for executives',
  'Safe file sharing',
  'Incident reporting basics',
  'Vendor risk for procurement',
  'Mobile device safety',
  'Insider risk awareness',
  'Privacy fundamentals',
]
const ARCHIVE_AUDIENCES = [
  NEW_HIRES,
  { kind: 'all', label: 'All employees', enrolled: 1500 },
  { kind: 'group', label: 'Engineering', enrolled: 240 },
  { kind: 'group', label: 'Customer support', enrolled: 86 },
  { kind: 'people', names: ['Lydia Shan', 'Kelley Nguyen'], extra: 3, enrolled: 5 },
]
const ARCHIVE_SLIDES = Object.values(SLIDES)
const ARCHIVE_TYPES = ['fixed', 'auto-enroll', 'one-time', 'fixed']

const MS_PER_DAY = 86_400_000
const toIso = (time) => new Date(time).toISOString().slice(0, 10)

function seeded(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildArchive(count) {
  const newest = Date.UTC(2026, 2, 28)
  return Array.from({ length: count }, (_, i) => {
    const total = [40, 100, 240, 86, 12][i % 5]
    const completed = Math.max(0, total - Math.round(seeded(i + 3) * total * 0.18))
    const overdue = Math.min(total - completed, Math.round(seeded(i + 11) * total * 0.08))
    const endMs = newest - i * 9 * MS_PER_DAY
    const durationDays = 14 + Math.round(seeded(i + 5) * 60)
    return {
      id: `a-${i + 1}`,
      title: ARCHIVE_TITLES[i % ARCHIVE_TITLES.length],
      status: 'ended',
      archived: true,
      type: ARCHIVE_TYPES[i % ARCHIVE_TYPES.length],
      slide: ARCHIVE_SLIDES[i % ARCHIVE_SLIDES.length],
      stackCount: 3 + (i % 4),
      start: toIso(endMs - durationDays * MS_PER_DAY),
      end: toIso(endMs),
      audience: { ...ARCHIVE_AUDIENCES[i % ARCHIVE_AUDIENCES.length], enrolled: total },
      completed,
      overdue,
      total,
      compliance: i % 7 === 3,
    }
  })
}

export function createInitialCampaigns() {
  return [...SEED_CAMPAIGNS, ...buildArchive(PAGE_SIZE * TOTAL_PAGES - SEED_CAMPAIGNS.length)]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parseIso = (iso) => {
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month: month - 1, day }
}

const formatDay = ({ month, day }) => `${MONTHS[month]} ${String(day).padStart(2, '0')}`

export function formatDate(iso, { withYear = false } = {}) {
  const parts = parseIso(iso)
  return withYear ? `${formatDay(parts)}, ${parts.year}` : formatDay(parts)
}

/** Years only appear when the campaign spans more than one calendar year. */
export function formatRange(startIso, endIso) {
  const start = parseIso(startIso)
  const end = parseIso(endIso)
  const withYear = start.year !== end.year
  return `${formatDate(startIso, { withYear })} - ${formatDate(endIso, { withYear })}`
}

export function getTier(campaign) {
  return campaign.archived ? TIER.archived : TIER[campaign.status]
}

const sortKey = {
  live: (c) => c.end,
  scheduled: (c) => c.start,
  'past-due': (c) => c.end,
}

export function sortCampaigns(campaigns) {
  return [...campaigns].sort((a, b) => {
    const tierDelta = getTier(a) - getTier(b)
    if (tierDelta) return tierDelta
    const ascending = sortKey[a.status]
    if (ascending && !a.archived) return ascending(a).localeCompare(ascending(b))
    const recency = (c) => c.endedAt || c.end || c.createdAt || ''
    return recency(b).localeCompare(recency(a))
  })
}

export function matchesFilters(campaign, { query, type }) {
  if (type !== 'all' && campaign.type !== type) return false
  const needle = query.trim().toLowerCase()
  return !needle || campaign.title.toLowerCase().includes(needle)
}

export const hasMetrics = (campaign) => campaign.status !== 'draft' && campaign.status !== 'scheduled'

export const percent = (value, total) => (total ? Math.round((value / total) * 100) : 0)

export function audienceLabel(audience) {
  if (!audience) return null
  if (audience.kind === 'people') {
    const names = audience.names.join(', ')
    return audience.extra ? `${names} +${audience.extra}` : names
  }
  return `${audience.label} · ${audience.enrolled.toLocaleString('en-US')} enrolled`
}

const dayNumber = (iso) => {
  const { year, month, day } = parseIso(iso)
  return Math.round(Date.UTC(year, month, day) / MS_PER_DAY)
}

export const daysUntil = (iso) => dayNumber(iso) - dayNumber(PROTOTYPE_TODAY)

export function getEndingSoonDays(campaign) {
  if (campaign.status !== 'live' || !campaign.end) return null
  const days = daysUntil(campaign.end)
  return days >= 0 && days <= ENDING_SOON_DAYS ? days : null
}

export function getStartingSoonDays(campaign) {
  if (campaign.status !== 'scheduled' || !campaign.start) return null
  const days = daysUntil(campaign.start)
  return days >= 0 && days <= STARTING_SOON_DAYS ? days : null
}

export function createDraft(overrides = {}) {
  return {
    id: `d-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Untitled campaign',
    status: 'draft',
    type: 'fixed',
    slide: SLIDES.workingSecurely,
    stackCount: 5,
    createdAt: PROTOTYPE_TODAY,
    ...overrides,
  }
}

export function duplicateCampaign(campaign) {
  return createDraft({
    title: `${campaign.title} (copy)`,
    type: campaign.type,
    slide: campaign.slide,
    stackCount: campaign.stackCount,
    audience: campaign.audience,
  })
}

export function endCampaign(campaign) {
  return { ...campaign, status: 'ended', end: PROTOTYPE_TODAY, endedAt: PROTOTYPE_TODAY, endedManually: true }
}
