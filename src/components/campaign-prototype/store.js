import { useCallback, useMemo, useState } from 'react'
import { addDays, formatDate, parseDate } from './dates'

export const DEFAULT_CAMPAIGN = {
  name: 'Annual Training 2027',
  learnerTitle: '',
  description: '',
}

const DEFAULT_START = '2026-07-15'

function createInitialState() {
  return {
    view: 'list',
    dialog: false,
    contentModal: false,
    created: false,
    status: 'draft',
    tab: 'results',
    campaign: DEFAULT_CAMPAIGN,
    audience: { type: 'groups', group: 'New hires', membership: 'Current and future members' },
    items: [],
    options: { feedback: true, autoplay: true, testOut: true },
    schedule: { mode: 'scheduled', startDate: DEFAULT_START, startTime: '09:00', endTime: '21:00', days: 14, acceptLate: true },
    toggles: { autoEnroll: true, includeExisting: false },
    notifications: { enrollment: true, gentle: true, urgent: true, completion: true, overdue: true, managers: true, slack: true },
    advanced: { compliance: false, vanta: false, drata: false, bamboo: true },
  }
}

export function useCampaignStore() {
  const [state, setState] = useState(createInitialState)

  const patch = useCallback((changes) => setState((current) => ({ ...current, ...changes })), [])
  const patchIn = useCallback(
    (key, changes) => setState((current) => ({ ...current, [key]: { ...current[key], ...changes } })),
    [],
  )

  const actions = useMemo(
    () => ({
      openDialog: () => patch({ dialog: true }),
      closeDialog: () => patch({ dialog: false }),
      createCampaign: ({ name, learnerTitle, description, audience }) =>
        patch({
          dialog: false,
          view: 'campaign',
          created: true,
          status: 'draft',
          tab: 'results',
          campaign: { name, learnerTitle: learnerTitle ?? '', description: description ?? '' },
          audience,
          items: [],
        }),
      openContent: () => patch({ contentModal: true }),
      closeContent: () => patch({ contentModal: false }),
      saveContent: ({ items, options }) => setState((current) => ({ ...current, contentModal: false, items, options })),
      patchCampaign: (changes) => patchIn('campaign', changes),
      patchSchedule: (changes) => patchIn('schedule', changes),
      patchToggles: (changes) => patchIn('toggles', changes),
      patchNotifications: (changes) => patchIn('notifications', changes),
      patchAdvanced: (changes) => patchIn('advanced', changes),
      patchAudience: (changes) => patchIn('audience', changes),
      launch: () => patch({ status: 'launched', tab: 'results' }),
      togglePause: () => setState((current) => ({ ...current, status: current.status === 'paused' ? 'launched' : 'paused' })),
      setTab: (tab) => patch({ tab }),
      backToList: () => patch({ view: 'list' }),
      openCampaign: () => patch({ view: 'campaign' }),
    }),
    [patch, patchIn],
  )

  const startDate = state.schedule.startDate
  const endDate = formatDate(addDays(parseDate(startDate), state.schedule.days - 1), 'iso')

  return { state, actions, startDate, endDate }
}
