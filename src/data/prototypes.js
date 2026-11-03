import { lazy } from 'react'
import trainingCampaignsPoster from '../assets/prototypes/training-campaigns/poster.webp'

export const PROTOTYPES = {
  'training-campaigns': {
    title: 'Training campaigns index',
    hint: 'Hover thumbnails, open the ⋮ menu, search, filter and page through campaigns',
    width: 1440,
    height: 1528,
    poster: trainingCampaignsPoster,
    Component: lazy(() => import('../components/prototypes/training-campaigns/TrainingCampaigns')),
  },
}
