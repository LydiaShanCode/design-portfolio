import projects from '../../data/projectLoader'
import { education, experience, profile, skills } from '../../data/resume'

const EMAIL = 'lydiashan.c@gmail.com'

const ALIASES = {
  'smart-markets': ['smart markets', 'managed markets', 'international', 'cross-border', 'restriction', 'sidekick'],
  'core-workflows': ['core workflows', 'workflow', 'training index', 'test send', 'compliance'],
  'level-up-aicc': ['aicc', 'level up', 'content creator', 'framebuilder', 'frame builder', 'module builder'],
  'payouts-uplift': ['payout', 'uplift', 'holds'],
  'shop-balance': ['shop balance', 'balance', 'wallet', 'shop app'],
  'design-system': ['design system', 'searcheye'],
  'listening-room': ['listening room', 'three.js'],
}

const COMPANY_ALIASES = { shopify: 'Shopify', adaptive: 'Adaptive Security' }

const bySlug = new Map(projects.map((project) => [project.slug, project]))

const sentences = (text) => text.split(/(?<=[.!?])\s+/).filter(Boolean)

// Case studies are written in first person; the agent speaks about Lydia, not as her
const thirdPerson = (text) =>
  text
    .replace(/\bI'm\b/g, 'Lydia is')
    .replace(/\bI've\b/g, 'Lydia has')
    .replace(/\bI\b/g, 'Lydia')
    .replace(/\bmy\b/gi, 'her')
    .replace(/\bme\b/g, 'her')

function summaryOf(project) {
  const paragraph = project.content
    ?.split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block && !/^[#![>\-*|]/.test(block))
  if (!paragraph) return ''
  return thirdPerson(sentences(paragraph.replace(/\s+/g, ' ')).slice(0, 2).join(' '))
}

const allPoints = experience.flatMap((job) =>
  job.points.map((point) => {
    const slugs = new Set()
    Object.entries(job.links ?? {}).forEach(([name, slug]) => {
      if (point.lead === name || point.text.toLowerCase().includes(name.toLowerCase())) slugs.add(slug)
    })
    return { ...point, company: job.company, slugs: [...slugs] }
  }),
)

const factsFor = (slug) => allPoints.filter((point) => point.slugs.includes(slug))

const featured = projects.filter((project) => !project.archived)

const timeOf = (project) => Date.parse(`1 ${project.start}`) || 0

function projectsMentioned(query) {
  const hits = projects.filter((project) =>
    [project.title.toLowerCase(), ...(ALIASES[project.slug] ?? [])].some((word) => query.includes(word)),
  )
  if (hits.length) return hits
  const company = Object.entries(COMPANY_ALIASES).find(([word]) => query.includes(word))
  return company ? featured.filter((project) => project.company === company[1]) : []
}

const highlightsMatch = (pattern) => featured.filter((project) => project.highlights?.some((item) => pattern.test(item)))

const answer = (text, extra = {}) => ({ text, projects: [], links: [], ...extra })

const slugsOf = (list) => list.map((project) => project.slug)

function describeProject(project) {
  const facts = factsFor(project.slug)
  const parts = [`${project.title} at ${project.company}, ${project.timeline}.`]
  const summary = summaryOf(project)
  if (summary) parts.push(summary)
  if (facts.length) parts.push(facts.map((fact) => fact.text).join(' '))
  parts.push(`Focus areas: ${project.highlights.join(', ')}.`)
  return parts.join('\n\n')
}

function aboutProject(matched) {
  if (matched.length === 1) {
    return answer(describeProject(matched[0]), { projects: [matched[0].slug] })
  }
  const lines = matched.map((project) => `${project.title}: ${project.highlights.slice(0, 2).join(', ')}.`)
  return answer(`${matched[0].company === matched[1]?.company ? `${matched[0].company} work` : 'These projects'} that match:\n\n${lines.join('\n')}`, {
    projects: slugsOf(matched),
  })
}

const INTENTS = [
  {
    test: /\b(hi|hello|hey|yo)\b/,
    run: () =>
      answer(`Hi. I'm Lydia's agent. I can walk you through a project, point to what shipped in code, or share the numbers behind the work. What would you like to see?`),
  },
  {
    test: /contact|email|reach|hire|hiring|get in touch|linkedin|available|talk to/,
    run: () =>
      answer(`The quickest way to reach ${profile.name} is email at ${EMAIL}. She's also on LinkedIn and X.`, {
        links: [
          { label: 'Email', href: `mailto:${EMAIL}` },
          ...profile.contact.filter((c) => ['LinkedIn', 'X'].includes(c.label)).map((c) => ({ label: c.label, href: c.href })),
        ],
      }),
  },
  {
    test: /impact|result|metric|number|outcome|measur|success/,
    run: () => {
      const numeric = allPoints.filter((point) => /\d/.test(point.text) && point.slugs.length)
      const picked = numeric.slice(0, 5)
      return answer(`A few results from the CV:\n\n${picked.map((point) => `• ${point.text}`).join('\n')}`, {
        projects: [...new Set(picked.flatMap((point) => point.slugs))].slice(0, 3),
      })
    },
  },
  {
    test: /code|coded|ship|engineer|prototype|pull request|\bpr\b|developer|implement/,
    run: () => {
      const matched = highlightsMatch(/code|prototype/i)
      const shipped = allPoints.find((point) => /production code/i.test(point.text))
      const lines = matched.map((project) => `• ${project.title}: ${project.highlights.filter((item) => /code|prototype/i.test(item)).join(', ')}`)
      return answer(
        `Lydia designs and builds in code. ${shipped ? shipped.text : ''}\n\nWhere it shows up:\n\n${lines.join('\n')}`.trim(),
        { projects: slugsOf(matched).slice(0, 3) },
      )
    },
  },
  {
    test: /\bai\b|llm|agent|sidekick|machine learning|generative|prompt/,
    run: () => {
      const matched = highlightsMatch(/\bAI\b/i)
      const facts = allPoints.filter((point) => /\bAI\b/.test(point.text))
      return answer(
        `Here's where AI shows up. ${facts.map((fact) => fact.text).join(' ')}\n\nProjects: ${matched.map((p) => p.title).join(', ')}.`,
        { projects: slugsOf(matched) },
      )
    },
  },
  {
    test: /\b0\s*(to|-|→)?\s*1\b|zero to one|from scratch|vision|north star|new product|founding/,
    run: () => {
      const matched = highlightsMatch(/0\s*[-→]\s*1/i)
      const facts = allPoints.filter((point) => /0-to-1/i.test(point.text))
      return answer(`Zero to one work:\n\n${matched.map((p) => `• ${p.title}: ${p.highlights.find((h) => /0\s*[-→]\s*1/i.test(h))}`).join('\n')}${facts.length ? `\n\n${facts.map((f) => f.text).join(' ')}` : ''}`, {
        projects: slugsOf(matched).slice(0, 3),
      })
    },
  },
  {
    test: /mobile|\bapp\b|phone|ios|wallet/,
    run: () => aboutProject([bySlug.get('shop-balance')]),
  },
  {
    test: /fintech|payment|money|finance|bank|b2b/,
    run: () => {
      const matched = ['payouts-uplift', 'shop-balance'].map((slug) => bySlug.get(slug))
      return answer(
        `Money is a recurring theme. Payouts Uplift is B2B fintech for merchants, and Shop Balance is a mobile wallet for buyers. Earlier, at TD Securities, Lydia designed FX and commodities trading workflows.`,
        { projects: slugsOf(matched) },
      )
    },
  },
  {
    test: /latest|recent|newest|current|lately|right now|last project/,
    run: () => {
      const recent = [...featured].sort((a, b) => timeOf(b) - timeOf(a)).slice(0, 2)
      return answer(
        `The most recent work is ${recent.map((p) => `${p.title} (${p.company}, ${p.start})`).join(' and ')}.`,
        { projects: slugsOf(recent) },
      )
    },
  },
  {
    test: /resume|\bcv\b|experience|background|career|history|worked|where/,
    run: () =>
      answer(
        `${experience.map((job) => `• ${job.company}, ${job.role}, ${job.start} to ${job.end}`).join('\n')}`,
        { links: [{ label: 'Open the CV', to: '/resume' }] },
      ),
  },
  {
    test: /school|education|study|studied|degree|college|university|graduate/,
    run: () =>
      answer(education.map((item) => `• ${item.program}, ${item.school}${item.note ? ` (${item.note})` : ''}`).join('\n')),
  },
  {
    test: /skill|tool|stack|figma|claude|good at|strength/,
    run: () => answer(skills.map((group) => `${group.label}: ${group.items.join(', ')}.`).join('\n\n')),
  },
  {
    test: /play|side project|fun|experiment|hobby|music|shader/,
    run: () =>
      answer('Small experiments and playful artifacts live on the Play page.', {
        links: [{ label: 'Open Play', to: '/play' }],
      }),
  },
  {
    test: /who|about|yourself|lydia|introduce|summar/,
    run: () => {
      const recent = [...featured].sort((a, b) => timeOf(b) - timeOf(a))
      return answer(
        `${profile.name} is a ${profile.title.toLowerCase()} with work at Adaptive Security, Shopify, TD Securities and SearchEye. Recent projects span B2B workflows, AI-assisted tools and a mobile wallet, and she often builds in code.`,
        { projects: slugsOf(recent).slice(0, 3), links: [{ label: 'About', to: '/about' }] },
      )
    },
  },
]

export const STARTERS = [
  'Which project shipped in code?',
  'Show me the impact numbers',
  'What was the 0 to 1 work?',
  'Walk me through Payouts Uplift',
]

const FOLLOW_UPS = [
  ...STARTERS,
  'Where has Lydia worked?',
  'What AI work has she done?',
  'How do I get in touch?',
]

export const FALLBACK = answer(
  `I can only speak to what's on this site: the projects, the CV and how to get in touch. Try asking about a project by name, what shipped in code, or the results.`,
)

/** Grounded in project.md files and the CV data. Swap this function for a model call when one exists. */
export function respond(raw) {
  const query = raw.toLowerCase()
  const matched = projectsMentioned(query)
  const hit = matched.length ? aboutProject(matched) : INTENTS.find((intent) => intent.test.test(query))?.run()
  return hit ?? FALLBACK
}

export const projectBySlug = (slug) => bySlug.get(slug)

export function followUpsFor(asked) {
  const used = new Set(asked.map((item) => item.toLowerCase()))
  return FOLLOW_UPS.filter((item) => !used.has(item.toLowerCase())).slice(0, 3)
}
