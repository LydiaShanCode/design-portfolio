export const profile = {
  name: 'Lydia Shan',
  title: 'Product Designer',
  contact: [
    { label: 'Email', value: 'lydiashan.c@gmail.com', href: 'mailto:lydiashan.c@gmail.com' },
    { label: 'Portfolio', value: 'lydiashan.com', href: 'https://lydiashan.com' },
    { label: 'GitHub', value: 'github.com/LydiaShanCode', href: 'https://github.com/LydiaShanCode' },
  ],
}

export const experience = [
  {
    company: 'Adaptive Security',
    role: 'Product Designer',
    start: 'Jun 2026',
    end: 'Oct 2026',
    points: [
      {
        lead: 'Core Workflows',
        text: 'Redesigned the training index; 9 of 10 customers said finding Trainings got easier during usability testing.',
      },
      {
        text: 'Shipped production code, with six pull requests open or merged, including the compliance reporting popover that clarified postback controls.',
      },
      {
        text: 'Launched Test Send Notifications in 5 days after noticing customers duplicating Trainings just to test them. Wrote the help article and launch post.',
      },
      {
        lead: 'AI Content Creation',
        text: 'Designed and built a working prototype of a 0-to-1 AI-native Training Module Builder in one week, with customers saying they’d use it right away in concept testing calls.',
      },
    ],
    links: {
      'Core Workflows': 'core-workflows',
      'AI Content Creation': 'level-up-aicc',
    },
  },
  {
    company: 'Shopify',
    role: 'Product Designer',
    start: 'Jul 2024',
    end: 'Jun 2026',
    points: [
      {
        text: 'Designed end-to-end for the Payments team across consumer surfaces, spanning merchant B2B workflows, mobile checkout, and the Shop app for millions of global buyers.',
      },
      {
        text: 'Defined the 0-to-1 North Star for Shop Balance, designing a mobile-first, buyer-facing financial product for storing and spending funds.',
      },
      {
        text: 'Led Payouts Uplift from vision to launch, improving payout transparency and reducing holds by 43%.',
      },
      {
        text: 'Introduced AI-assisted UX patterns for Managed Markets, reducing support tickets for product restrictions by ~18%.',
      },
    ],
    links: {
      'Shop Balance': 'shop-balance',
      'Payouts Uplift': 'payouts-uplift',
      'Managed Markets': 'smart-markets',
    },
  },
  {
    company: 'TD Securities',
    role: 'Product Designer',
    start: 'Jan 2024',
    end: 'Jul 2024',
    points: [
      { text: 'Designed complex financial workflows for FX and commodities trading platforms.' },
    ],
  },
  {
    company: 'SearchEye',
    role: 'Founding Product Designer',
    start: 'Aug 2022',
    end: 'Jan 2024',
    points: [],
    caseStudies: [{ title: 'Design System', slug: 'design-system' }],
  },
]

export const education = [
  {
    school: 'Sheridan College',
    program: 'Digital Product Design',
    note: 'Graduate Certificate with Honours',
    start: 'Sep 2021',
    end: 'Apr 2022',
  },
  {
    school: 'Juno College',
    program: 'Web Development',
    start: 'Apr 2023',
    end: 'Jun 2023',
  },
  {
    school: 'University of Toronto',
    program: 'Bachelor of Music',
    start: 'Sep 2017',
    end: 'Apr 2021',
  },
]

export const skills = [
  {
    label: 'Tools',
    items: ['Claude Code', 'Figma', 'Graphite', 'GitHub', 'VS Code', 'PI'],
  },
  {
    label: 'Code',
    items: ['Prototyping in code', 'API integration', 'Git-based workflows', 'Command line (CLI)'],
  },
  {
    label: 'Design',
    items: ['Interaction design', 'Complex workflows', 'B2B SaaS', 'AI-assisted UX patterns', 'Design systems'],
  },
]

export const certifications = [
  {
    name: 'Ethical Conduct for Research Involving Humans (TCPS 2)',
    issuer: 'Government of Canada',
    date: 'Sep 2021',
  },
]
