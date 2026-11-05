export const ONE_PAGER_BIO =
  'Product designer in New York City, currently at Adaptive Security. Before that I was on the payments team at Shopify, designing financial experiences across mobile and desktop, and before that in startups building 0–1 products.'

export const ONE_PAGER_LEAD = 'Selected work, with what each one changed. Open a case study for the full story.'

// Every figure comes from the project's case study or resume.js. `note` keeps caveats attached to the numbers.
export const ONE_PAGER_WORK = {
  'core-workflows': {
    role: 'Product designer',
    summary: 'Made campaign setup and testing less nerve-wracking for security admins, and shipped two features from brief to launch.',
    results: [
      { figure: '9 of 10', text: 'customers said finding Trainings got easier in usability testing' },
      { figure: 'Tripled', text: 'weekly training test sends in the first five weeks after Test Send launched, from 93 to 295' },
      { figure: '12 → 5', text: 'customer conversations about compliance and postback setup in the 60 days after launch' },
    ],
    note: 'Conversation counts show how much people talked about a problem, not how often it happened.',
  },
  'level-up-aicc': {
    role: 'Product designer, partly in code',
    summary: 'Gave admins the last word on AI-generated training modules: interactive blocks, the frame editing model, layouts and narration.',
    results: [
      { figure: '1,105', text: 'guided creation sessions in the first 14 days, against 141 in the 18 days before launch' },
      { figure: '~95%', text: 'of people who submit a prompt still start an outline, so the extra questions didn’t cost us users' },
      { figure: '11', text: 'merged PRs in two months, including the new frame layouts' },
    ],
    note: 'The guided flow is a team launch. Whether output is less generic isn’t measured yet.',
  },
  'payouts-uplift': {
    role: 'Product designer, vision to launch',
    summary: 'Made it clear where merchant money comes from and when it arrives, starting with consolidated payout error messaging.',
    results: [
      { figure: '−43%', text: 'payout holds on merchant accounts after the first milestone, Payout Errors Uplift, shipped' },
    ],
    note: 'Support-ticket and CSAT impact are waiting on launch to be measured.',
  },
  'smart-markets': {
    role: 'Product designer, with a coded prototype',
    summary: 'Used AI as a contextual helper to explain why a product is restricted in a market, without cluttering Managed Markets.',
    results: [
      { figure: '~18%', text: 'fewer support tickets about product restrictions' },
      { figure: '3 weeks', text: 'from problem to a coded prototype of the final design' },
    ],
    note: null,
  },
  'shop-balance': {
    role: 'Sole designer, 0 to 1',
    summary: 'Replaced a rewards-only wallet with a buyer account that stores, spends and earns, and defined the North Star for it.',
    results: [
      { figure: '0 → 1', text: 'North Star for a mobile-first, buyer-facing financial product in the Shop app' },
    ],
    note: 'Direction-setting work, so there are no launch numbers to report.',
  },
}
