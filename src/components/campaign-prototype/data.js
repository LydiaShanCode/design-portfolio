import assets from './assets'

export const STAGE_WIDTH = 1440
export const STAGE_HEIGHT = 900

export const MODULES = [
  { id: 'deepfake-1', title: 'Deepfake attacks', minutes: 5, rating: 4.8, date: 'Jun. 2025', icon: assets.modulePeople, tone: 'green' },
  { id: 'deepfake-2', title: 'Deepfake attacks', minutes: 5, rating: 4.8, date: 'Jun. 2025', icon: assets.modulePassword, tone: 'orange' },
  { id: 'deepfake-3', title: 'Deepfake attacks', minutes: 5, rating: 4.8, date: 'Jun. 2025', icon: assets.moduleBall, tone: 'neutral' },
  { id: 'deepfake-4', title: 'Deepfake attacks', minutes: 5, rating: 4.8, date: 'Jun. 2025', icon: assets.moduleBall, tone: 'neutral' },
  { id: 'deepfake-5', title: 'Deepfake attacks', minutes: 5, rating: 4.8, date: 'Jun. 2025', icon: assets.moduleBall, tone: 'neutral' },
]

export const FOLDER_MODULES = Array.from({ length: 6 }, (_, i) => ({
  id: `deepfake-masks-${i + 1}`,
  title: 'Deep Fake Attacks',
  minutes: 4,
  rating: 4.8,
  date: 'Jun. 2025',
  icon: assets.moduleMasks,
  tone: 'blue',
  brand: true,
}))

export const FOLDERS = [
  { id: 'finance-cohort', title: 'Finance Cohort: 2026 New Hires', minutes: 4, count: 7, modules: FOLDER_MODULES.map((m) => ({ ...m, id: `finance-${m.id}` })) },
  { id: 'annual-2027', title: '2027 annual training', modules: FOLDER_MODULES.map((m) => ({ ...m, id: `annual-${m.id}` })) },
  { id: 'q127-supplemental', title: 'Q127 supplemental', modules: FOLDER_MODULES.map((m) => ({ ...m, id: `q127-${m.id}` })) },
  { id: 'finance-cohort-b', title: 'Finance Cohort: 2026 New Hires', modules: FOLDER_MODULES.map((m) => ({ ...m, id: `financeb-${m.id}` })) },
]

export const FOLDER_STACK = [
  { tone: 'teal', left: 104.09, top: 1.98, rotate: 6.37, width: 143.73 },
  { tone: 'orange', left: 80.13, top: 10.69, rotate: 1.17, width: 143.73, flat: true },
  { tone: 'pink', left: 60.53, top: 10.69, rotate: 1.17, width: 143.73 },
  { tone: 'green', left: 40.94, top: 8.51, rotate: 0, width: 152.16, scale: 1.06 },
  { tone: 'blue', left: 17.42, top: 4.36, rotate: -2.99, width: 145.07, scale: 1.02 },
]

export const COLLECTIONS = [
  { id: 'security-essentials-1', title: 'Security Essentials', minutes: 4, count: 7, tone: 'lavender' },
  { id: 'security-essentials-2', title: 'Security Essentials', minutes: 4, count: 7, tone: 'teal' },
  { id: 'security-essentials-3', title: 'Security Essentials', minutes: 4, count: 7, tone: 'rose' },
  { id: 'security-essentials-4', title: 'Security Essentials', minutes: 4, count: 7, tone: 'lavender' },
  { id: 'security-essentials-5', title: 'Security Essentials', minutes: 4, count: 7, tone: 'teal' },
  { id: 'security-essentials-6', title: 'Security Essentials', minutes: 4, count: 7, tone: 'lavender' },
].map((collection) => ({
  ...collection,
  modules: MODULES.slice(0, 3).map((m) => ({ ...m, id: `${collection.id}-${m.id}` })),
}))

export const LIBRARY_MODULES = [
  { id: 'lib-crypto', title: 'Cryptographic Failures', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modCrypto, tone: 'peach' },
  { id: 'lib-abusive', title: 'Recognizing Abusive Conduct (IL)', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modAbusive, tone: 'sky' },
  { id: 'lib-atom', title: 'Safe Web Browsing', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modAtom, tone: 'mint' },
  { id: 'lib-insider', title: 'Insider Trading', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modInsider, tone: 'pink' },
  { id: 'lib-pii', title: 'Protecting PII', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modPii, tone: 'sky' },
  { id: 'lib-web-1', title: 'Safe Web Browsing', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modSafeWeb, tone: 'mint' },
  { id: 'lib-web-2', title: 'Safe Web Browsing', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modSafeWeb, tone: 'mint' },
  { id: 'lib-web-3', title: 'Safe Web Browsing', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modSafeWeb, tone: 'mint' },
  { id: 'lib-web-4', title: 'Safe Web Browsing', minutes: 4, rating: 4.8, date: 'Jun. 2025', icon: assets.modSafeWeb, tone: 'mint' },
]

export const POLICIES = [
  { id: 'pol-handbook', title: 'Employee Security Handbook' },
  { id: 'pol-kg', title: 'KG TEST' },
  { id: 'pol-raghu-only', title: 'raghu only' },
  { id: 'pol-raghu-test', title: 'raghu test' },
  { id: 'pol-reegan', title: 'Reegan Test' },
  { id: 'pol-sg', title: 'SG TEST' },
  { id: 'pol-test', title: 'test', subtitle: 'test' },
  { id: 'pol-test-policy', title: 'Test policy', subtitle: 'test', hasDoc: true },
]

export const INITIAL_SELECTION = [
  MODULES[0],
  MODULES[1],
  MODULES[2],
  MODULES[3],
  MODULES[4],
]

export const MODAL_TABS = ['Folders', 'Favourites', 'Collections', 'Modules', 'Policies']

export const AUDIENCE_GROUPS = ['All engineers', 'All designers', 'All hires', '2026 - New hires']

export const AUDIENCE_MEMBERSHIP = ['Current and future members', 'Future members only', 'Current members only']

export const DURATION_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '21 days', days: 21 },
  { label: '30 days', days: 30 },
]

export const REMINDERS = [
  {
    id: 'enrollment',
    label: 'Enrollment',
    when: 'Launch',
    icon: 'circleCheck',
    title: 'Enrollment',
    description: 'Sent when a learner is invited to training.',
    editable: true,
  },
  {
    id: 'gentle',
    label: 'Leading up to due date',
    when: 'Day 7',
    icon: 'circle',
    title: 'Gentle Nudges',
    description: 'Sends weekly at 9:00 AM',
  },
  {
    id: 'urgent',
    label: 'Final 5 days',
    when: 'Day 15',
    icon: 'circle',
    title: 'Urgent Nudges',
    description: 'Sends weekly at 9:00 AM',
  },
  {
    id: 'completion',
    label: 'Due date',
    when: 'due',
    icon: 'circleDot',
    title: 'Completion',
    description: 'Sent when a learner completes all assigned modules.',
  },
  {
    id: 'overdue',
    label: 'Past due date',
    when: 'Overdue',
    icon: 'circleAlert',
    title: 'Overdue Alerts',
    description: 'Sends daily at 9:00 AM',
  },
]

const FIRST_NAMES = ['David', 'Sam', 'Eli', 'Maya', 'Noah', 'Priya', 'Lena', 'Omar', 'Chloe', 'Arjun']
const LAST_NAMES = ['Wu', 'Rivera', 'Bernstein', 'Okafor', 'Patel', 'Nguyen', 'Haddad', 'Larsen', 'Ito', 'Moreno']

const LEAD_NAMES = ['David Wu', 'David Wu', 'David Wu', 'Sam Rivera', 'Eli Bernstein', 'Sam Rivera', 'Eli Bernstein', 'Sam Rivera', 'Eli Bernstein', 'Eli Bernstein']

export const EMPLOYEES = Array.from({ length: 100 }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length]
  const last = LAST_NAMES[(i * 3 + Math.floor(i / 10)) % LAST_NAMES.length]
  const completed = i < 10 ? [2, 4, 7, 8, 9].includes(i) : i % 2 === 1
  const name = i < 10 ? LEAD_NAMES[i] : `${first} ${last}`
  const [given, family] = name.split(' ')
  return {
    id: i,
    name,
    email: `${given[0].toLowerCase()}${family.toLowerCase()}@acme.co`,
    enrolled: '6/23 at 9:55 AM EDT',
    due: '6/23 at 9:55 AM EDT',
    status: completed ? 'completed' : 'pending',
    modules: completed ? 5 : 0,
    policies: completed ? 3 : 0,
  }
})

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'navDashboard', active: true, children: ['Reports', 'Boards', 'Leaderboard'] },
  { id: 'employees', label: 'Employees', icon: 'navEmployees' },
  { id: 'training', label: 'Training', icon: 'navTraining' },
  { id: 'phishing', label: 'Phishing', icon: 'navPhishing' },
  { id: 'triage', label: 'Phish Triage', icon: 'navPhishTriage', count: 13 },
  { id: 'email', label: 'Email Security', icon: 'navEmail', locked: true },
  { id: 'governance', label: 'AI Governance', icon: 'navAiGov', locked: true },
  { divider: true },
  { id: 'risk', label: 'Risk', icon: 'navRisk' },
  { id: 'personas', label: 'AI Personas', icon: 'navPersonas' },
  { id: 'feature', label: 'Feature Preview', icon: 'navFeature' },
]

export const LIST_TRIGGERED = [
  { id: 't1', title: 'Security Essentials Campaign', status: 'live', enrolled: '239', overdue: '23', activated: 'Jun 12', length: '7 days' },
  { id: 't2', title: 'Security Essentials Campaign', status: 'draft', enrolled: '-', overdue: '-', activated: '-', length: '-' },
  { id: 't3', title: 'Security Essentials Campaign', status: 'ended', enrolled: '98', overdue: '7', activated: 'Dec. 24, 2023', length: '14 days' },
]

export const LIST_SCHEDULED = [
  { id: 's1', title: 'Annual Training 2024', status: 'overdue', completion: '10%', start: 'Jan. 5', due: 'Apr. 26' },
  { id: 's2', title: 'Security Essentials Campaign', status: 'live', completion: '10%', start: 'Jan. 5', due: 'Apr. 26' },
  { id: 's3', title: '2024 Core Program', status: 'scheduled', completion: '95%', start: 'Apri. 26', due: 'Mar. 1' },
  { id: 's4', title: 'New Hire Onboarding Campaign (2)', status: 'draft', completion: '-', start: 'Jan. 2', due: '-' },
  { id: 's5', title: 'Security Essentials', status: 'ended', completion: '100%', start: 'Aug. 24, 2023', due: 'Dec. 24, 2023' },
]
