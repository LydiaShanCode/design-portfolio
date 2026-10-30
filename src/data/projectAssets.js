import designSystemImage from '../assets/projects/design-system/ design system - work card image.png?responsive'
import designSystemLqip from '../assets/projects/design-system/ design system - work card image.png?lqip'
import flowOfFundsImage from '../assets/projects/payouts-uplift/payouts uplift - work card image.png?responsive'
import flowOfFundsLqip from '../assets/projects/payouts-uplift/payouts uplift - work card image.png?lqip'
import shopBalanceImage from '../assets/projects/shop-balance/shop balance - work card image.png?responsive'
import shopBalanceLqip from '../assets/projects/shop-balance/shop balance - work card image.png?lqip'
import internationalCommerceImage from '../assets/projects/smart-markets/international commerce - work card image.png?responsive'
import internationalCommerceLqip from '../assets/projects/smart-markets/international commerce - work card image.png?lqip'
import listeningRoomImage from '../assets/projects/Listening Room/listening room - work card image.png?responsive'
import listeningRoomLqip from '../assets/projects/Listening Room/listening room - work card image.png?lqip'
import currentRibbon from '../assets/current ribbon.svg'
import shopifyIcon from '../assets/shopify-icon.svg'
import searchEyeIcon from '../assets/searcheye icon.svg'
import { getVideo, getProjectVideo } from './media'

const images = {
  designSystem: { image: designSystemImage, placeholder: designSystemLqip },
  flowOfFunds: { image: flowOfFundsImage, placeholder: flowOfFundsLqip },
  shopBalance: { image: shopBalanceImage, placeholder: shopBalanceLqip },
  internationalCommerce: { image: internationalCommerceImage, placeholder: internationalCommerceLqip },
  listeningRoom: { image: listeningRoomImage, placeholder: listeningRoomLqip },
}

const videoSources = {
  designSystem: 'projects/design-system/Design System Final Video.MP4',
  flowOfFunds: 'projects/payouts-uplift/payouts uplift final video.MP4',
  internationalCommerce: 'projects/smart-markets/International Commerce Final video.MP4',
  shopBalance: 'projects/shop-balance/Shop Balance final video.MP4',
  listeningRoom: 'projects/Listening Room/Listening Room final video.MP4',
}

const ribbons = { current: currentRibbon }
const icons = { shopify: shopifyIcon, searchEye: searchEyeIcon }

/** Attaches resolved media to a project parsed from markdown. */
export function withProjectAssets(project) {
  const source = videoSources[project.videoKey]
  const { image, placeholder } = images[project.imageKey] || {}
  return {
    ...project,
    image,
    imagePlaceholder: placeholder,
    ribbon: ribbons[project.ribbonKey],
    icon: icons[project.iconKey],
    cardVideo: source ? getVideo(source, 'card') : null,
    video: source ? getVideo(source, 'hero') : null,
  }
}

const responsiveImages = import.meta.glob('../assets/projects/**/*.{png,PNG,jpg,jpeg,JPG}', {
  eager: true, import: 'default', query: { responsive: '' },
})
const imagePlaceholders = import.meta.glob('../assets/projects/**/*.{png,PNG,jpg,jpeg,JPG}', {
  eager: true, import: 'default', query: { lqip: '' },
})
const staticAssets = import.meta.glob('../assets/projects/**/*.{svg,gif}', { eager: true, import: 'default' })

const findKey = (modules, slug, filename) => Object.keys(modules).find(
  (key) => key.includes(`/${slug}/`) && key.toLowerCase().endsWith(`/${filename}`),
)

/** Largest WebP rendition, for single-<img> consumers (lightbox, iterations). */
export const largestUrl = (image) => {
  if (!image || typeof image === 'string') return image
  const webp = image.sources.webp?.split(', ').pop()?.split(' ')[0]
  return webp || image.img.src
}

/**
 * Resolves a `./relative` markdown path inside a project folder.
 * Returns { video } | { image, placeholder } | { src } (svg/gif or unresolved).
 */
export function resolveProjectAsset(src, slug) {
  if (!src || !src.startsWith('./')) return { src }
  const filename = decodeURIComponent(src.slice(2)).toLowerCase()

  const video = getProjectVideo(slug, decodeURIComponent(src.slice(2)))
  if (video) return { video }

  const imageKey = findKey(responsiveImages, slug, filename)
  if (imageKey) {
    return { image: responsiveImages[imageKey], placeholder: imagePlaceholders[imageKey] }
  }

  const staticKey = findKey(staticAssets, slug, filename)
  return { src: staticKey ? staticAssets[staticKey] : src }
}
