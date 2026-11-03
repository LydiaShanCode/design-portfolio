export const CAMPAIGN_TITLE = 'Recognizing Phishing Emails & Social Engineering'

export const TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'voice', label: 'Voice' },
]

export const STATUS_OPTIONS = [
  { value: 'live', label: 'Live' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ended', label: 'Ended' },
  { value: 'draft', label: 'Draft' },
]

export const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]))
export const TYPE_LABEL = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]))

export const TIME_RANGES = [
  { value: '7d', label: 'Last 7d' },
  { value: '30d', label: 'Last 30d' },
  { value: '90d', label: 'Last 90d' },
]

export const FAILURE_BY_RANGE = {
  '7d': { rate: '9.1', delta: '0.6%', direction: 'up', failed: 34 },
  '30d': { rate: '8.5', delta: '3.0%', direction: 'down', failed: 120 },
  '90d': { rate: '10.2', delta: '1.4%', direction: 'down', failed: 342 },
}

export const HIGH_RISK_EMPLOYEES = [
  { id: 'e1', name: 'John Doe Smith', email: 'john.doesmith@company.com' },
  { id: 'e2', name: 'John Doe', email: 'john.doesmith@company.com' },
  { id: 'e3', name: 'John Doe', email: 'john.doesmith@company.com' },
]

const EMAIL_STATS = [
  { tone: 'fail', value: '8%', label: '64/800 Failed' },
  { tone: 'report', value: '52%', label: '416/800 Reported' },
]

export const INITIAL_CAMPAIGNS = [
  {
    id: 'c1',
    status: 'live',
    cadence: 'Series 3: Aug 15 - Sep 14',
    cadenceIcon: 'refresh',
    type: 'email',
    typeDetail: 'AutoPhish',
    scenarios: null,
    enrolled: 'New hires · 1,800 enrolled',
    stats: EMAIL_STATS,
    footnote: '350 left to deliver by Sep 14',
  },
  {
    id: 'c2',
    status: 'live',
    cadence: 'Series 3: Aug 15 - Sep 14',
    cadenceIcon: 'refresh',
    type: 'sms',
    scenarios: '12 scenarios',
    enrolled: 'New hires · 100 enrolled',
    stats: [{ tone: 'fail', value: '8%', label: '4/50 Responded' }],
    footnote: '50 employees left to target',
  },
  {
    id: 'c3',
    status: 'live',
    cadence: 'One time: Aug 15 - Sep 14',
    cadenceIcon: 'calendar',
    type: 'voice',
    scenarios: '12 scenarios',
    enrolled: 'New hires · 100 enrolled',
    stats: [{ tone: 'fail', value: '8%', label: '4/50 Picked up' }],
    footnote: '50 employees left to target',
  },
  {
    id: 'c4',
    status: 'scheduled',
    cadence: 'One time: Aug 15 - Sep 14',
    cadenceIcon: 'calendar',
    type: 'voice',
    scenarios: '12 scenarios',
    enrolled: 'New hires · 100 enrolled',
    stats: [{ tone: 'fail', value: '8%', label: '4/50 Picked up' }],
    footnote: '50 employees left to target',
  },
  {
    id: 'c5',
    status: 'ended',
    cadence: 'One time: Aug 15 - Sep 14',
    cadenceIcon: 'calendar',
    type: 'email',
    scenarios: '12 scenarios',
    enrolled: 'New hires · 1,800 enrolled',
    stats: EMAIL_STATS,
    footnote: '350 left to deliver by Sep 14',
  },
  {
    id: 'c6',
    status: 'ended',
    cadence: 'One time: Aug 15 - Sep 14',
    cadenceIcon: 'calendar',
    type: 'email',
    scenarios: '12 scenarios',
    enrolled: 'New hires · 1,800 enrolled',
    stats: EMAIL_STATS,
    footnote: '350 left to deliver by Sep 14',
  },
  {
    id: 'c7',
    status: 'draft',
    cadence: 'One time: Aug 15 - Sep 14',
    cadenceIcon: 'calendar',
    type: 'email',
    scenarios: '12 scenarios',
    enrolled: 'New hires · 1,800 enrolled',
    stats: [
      { tone: 'fail', value: '——', label: '0/800 Failed' },
      { tone: 'report', value: '——', label: '0/800 Reported' },
    ],
    footnote: '800 to deliver by Sep 14',
  },
]

export const CARD_ACTIONS = {
  live: [
    { id: 'report', label: 'View report' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'end', label: 'End campaign', tone: 'danger' },
  ],
  scheduled: [
    { id: 'edit', label: 'Edit campaign' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Cancel campaign', tone: 'danger' },
  ],
  ended: [
    { id: 'report', label: 'View report' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete', tone: 'danger' },
  ],
  draft: [
    { id: 'edit', label: 'Continue editing' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete', tone: 'danger' },
  ],
}

export const TOTAL_PAGES = 36
