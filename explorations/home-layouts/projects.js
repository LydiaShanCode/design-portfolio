/* eslint-disable no-unused-vars -- globals consumed by the version pages via classic <script> tags */
// Mirrors the frontmatter in src/assets/projects/*/project.md, plus a one-line `outcome`
// and `summary` that the reworked layouts surface for a skimming hiring manager.
const PROJECTS = [
  {
    slug: 'payouts-uplift',
    title: 'Payouts Uplift',
    company: 'Shopify',
    year: '2025',
    start: 'Jan 2025',
    icon: 'assets/shopify-icon.svg',
    img: 'assets/payouts-uplift.jpg',
    locked: true,
    summary: 'Making merchant payouts predictable across Stripe and PayPal.',
    outcome: '43% fewer payout holds',
    highlights: ['B2B Fintech', 'Legacy redesign', 'Multi-currency scalability', 'Trust design'],
  },
  {
    slug: 'smart-markets',
    title: 'Smart Markets',
    company: 'Shopify',
    year: '2025',
    start: 'Dec 2025',
    icon: 'assets/shopify-icon.svg',
    img: 'assets/smart-markets.jpg',
    locked: true,
    summary: 'Contextual AI that explains and fixes cross-border product restrictions.',
    outcome: 'Restored merchant control',
    highlights: ['Contextual AI Design', 'Localization & compliance UX', '0-1 product design', 'Coded Prototype'],
  },
  {
    slug: 'shop-balance',
    title: 'Shop Balance',
    company: 'Shopify',
    year: '2026',
    start: 'Jan 2026',
    icon: 'assets/shopify-icon.svg',
    img: 'assets/shop-balance.jpg',
    locked: true,
    summary: 'A 0–1 buyer wallet that turns rewards into a real balance.',
    outcome: 'Sole designer, 0 → 1',
    highlights: ['Mobile design', 'End to end design', '0-1 product vision', 'Fintech & Digital Wallets'],
  },
  {
    slug: 'design-system',
    title: 'Design System',
    company: 'SearchEye',
    year: '2023',
    start: 'Oct 2023',
    icon: 'assets/searcheye-icon.svg',
    img: 'assets/design-system.jpg',
    locked: false,
    summary: 'An accessible system for a 0–1 B2B SEO platform.',
    outcome: 'WCAG 2.1 AA',
    highlights: ['0 → 1 Design', 'A/B testing', 'Coded prototypes', 'Designs at scale'],
  },
  {
    slug: 'listening-room',
    title: 'Listening Room',
    company: 'Personal',
    year: '2026',
    start: 'Feb 2026',
    icon: null,
    img: 'assets/listening-room.jpg',
    locked: false,
    summary: 'A Three.js room that visualises whatever you play.',
    outcome: 'Creative coding',
    highlights: ['Three.js', 'Audio visualisation', 'Interactive 3D', 'Creative coding'],
  },
]

// Order the live site uses today (by project id)
const SHIPPED_ORDER = ['design-system', 'smart-markets', 'payouts-uplift', 'shop-balance', 'listening-room']

const KOI = `        .:::::.
     .:::::::::::.      .:.
   .::::'     ':::::. .:::'
  ::::'          ':::::::'
  ::::             '::::'
  ':::.           .::::::.
    '::::.....::::'  ':::.
       ':::::::'       ':'`

const LOCK_SVG = '<svg class="lock" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-label="Password protected"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>'

const ARROW_SVG = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/></svg>'

function bySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug)
}

function navMarkup(active = 'Work') {
  const item = (name) => `<span>${name === active ? '[•]' : '[ ]'} ${name}</span>`
  return `
    <nav class="site-nav" aria-hidden="true">
      <div class="site-nav-group">${item('Work')}${item('Play')}</div>
      <img class="site-nav-logo" src="assets/logo.svg" alt="" />
      <div class="site-nav-group">${item('About')}${item('CV')}</div>
    </nav>
    <nav class="mobile-nav" aria-hidden="true"><span>Work</span><span>Play</span><img src="assets/logo.svg" alt="" /><span>About</span><span>CV</span></nav>`
}

function workCardMarkup(p, extraClass = '') {
  return `
    <a class="work-card ${extraClass}" href="#${p.slug}">
      <div class="work-card-header">
        <span class="work-card-title">${p.title}</span>
        ${p.icon ? `<img class="work-card-icon" src="${p.icon}" alt="" />` : ''}
      </div>
      <div class="work-card-image"><img src="${p.img}" alt="${p.title} preview" /></div>
      <div class="work-card-meta"><span>${p.company}</span><span>${p.start}</span></div>
      <ul class="work-card-highlights">${p.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
    </a>`
}

function mountNav(active) {
  document.body.insertAdjacentHTML('afterbegin', navMarkup(active))
}
