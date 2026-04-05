---
id: 3
title: Payouts Uplift
slug: payouts-uplift
company: Shopify
protected: true
date: "3 weeks · 2025"
timeline: Jan 2025 – Mar 2025
highlights:
  - B2B Fintech
  - Legacy redesign
  - Multi-currency scalability
  - Trust design
imageKey: flowOfFunds
iconKey: shopify
ribbonKey: current
videoKey: flowOfFunds
walkthroughUrl: https://screen.studio/share/4MpkN24h
prototypeUrl: ""
caseStudyReady: true
iterationTabs:
  - Final
  - Iteration
  - Before
  - Wildcard
iterations:
  - group: Payouts Index Page
    images:
      - src: ./Multiple iterations - Payout index - final.png
        annotations:
          - title: Switched to a timeline visual
            text: Timeline visual representation of money movement proved more intuitive to users during interviews.
          - title: Added bank account hint
            text: Showing the destination bank account helped users' mental model of money movement.
          - title: Switched payout to next payout
            text: Users didn't know what payout balance represented. Instead, users look for the next payout amount.
      - src: ./Multiple iterations - Payout index - iteration 1.png
        annotations:
          - title: Payouts in transit still confusing
            text: Emphasized payouts in transit which helped with cashflow but disconnected from pending payouts.
          - title: Pending payouts not understood
            text: Pending payouts now explicit but unclear how these are different from "In transit".
          - title: Lack of source of truth ledger
            text: When "In transit" got abstracted from the ledger, it was less clear that "In transit" came right before "Deposited".
      - src: ./Multiple iterations - Payout index - Audit.png
        annotations:
          - title: Inefficient use of space
            text: Large amounts of whitespace make the page visually heavy while important information is easy to miss.
          - title: Cash flow confusion
            text: Many support tickets come from users asking to see upcoming payouts which isn't explicitly shown.
          - title: "\"To be paid\" is unclear"
            text: Users click in expecting their next payout amount, but instead see a larger total payout number.
      - src: ./Multiple iterations - Payout index - wild card.png
        annotations:
          - title: Too many visuals
            text: The eye doesn't know where to look when everything is calling out to you.
          - title: Numbers are more important
            text: Seeing the product photos are visually interesting but not a JTBD on the payouts page.
          - title: Graph takes too much space
            text: Although it is helpful for high-level cashflow prediction, merchants go to the payouts page to see concrete numbers.
  - group: Payouts Details Page
    images:
      - src: ./Multiple iterations - Payout details - final.png
        annotations:
          - title: Predicted Deposit Date
            text: No longer overemphasized, allowing attention on payout speed upgrade
          - title: Removed redundant dates
            text: Transaction dates were fund to be not as helpful
          - title: Compact timeline
            text: The timeline component is much smaller and utilizes iconography to communicate money movement
      - src: ./Multiple iterations - Payout details - iteration 1.png
        annotations:
          - title: Predicted Deposit Date
            text: Added to timeline, but overemphasized.
          - title: Fees Dropdown
            text: Removed when only one fee type exists to reduce clicks and confusion.
          - title: Timeline Component
            text: Too large and over explains payout timing.
      - src: ./Multiple iterations - Payout Details - Audit.png
        annotations:
          - title: Unclear money movement
            text: No deposit dates are shown, leaving users unsure when funds will arrive.
          - title: Confusing fees dropdown
            text: Labeling overlaps with earned "charges," causing terminology confusion for merchants.
          - title: Payout speed is not communicated
            text: The option to accelerate payouts for a fee exists but is not integrated clearly in the current UI.
      - src: ./Multiple iterations - Payout details - wild card.png
        annotations:
          - title: Visually cluttered
            text: Page is busy, product images distract from key info.
          - title: Product images are distracting
            text: Images draws attention away from payout amount and timing, which are most important.
          - title: Poor timeline visibility
            text: Hidden below the fold due to extra elements.
team:
  - name: Lydia Shan
    role: DES
  - name: Aidan Sze
    role: PM
  - name: Manuel Ocana
    role: ENG
  - name: Bilal Alp
    role: ENG
---

## Why even fix payouts?

Shopify is known for its seamless online checkout, but the merchant payout experience lagged behind. With the expansion to dual payment processors (Stripe and PayPal), payout complexity was set to double, requiring a stronger foundation that clearly shows where money comes from, when it arrives, and how merchants can forecast cash flow with confidence. You can see this in the audit below.

![](<./payouts uplift audit video compressed.mp4>)

> On April 30, I got 2 payouts instead of 1. And just today, May 2, I got a payout for 2 transactions…and its causing me a lot of bookkeeping issues.

> My payouts shows that 71.09 was deposited into my shopify balance yet my balance does not show the deposit. This is the second time this has happened where a payout was not credited to my balance. Is there a problem with my account?

> Why am I receiving my payments a week after being sold? Wasn't this money supposed to go to my account the next day?

> You collected my money. You sent the money. You are the one who wrote the word "deposited". I don't see how the bank has anything to do with this whatsoever.

> I only see one day ahead, but i need to know more days, because i need to manage my cashflow. I want broad vision scope.

## Double trouble

Differences in payout speed, misleading "delivered" statuses from PayPal and Stripe, and multi-currency scenarios made payouts feel random to merchants. To address this, Product, Engineering, and Design aligned on consolidating payout statuses and timings in the frontend by mapping underlying API states to a clear, consistent merchant-facing model.

![](<./payouts uplift double trouble diagram(3).PNG>)

## The big 5 (issues)

- **Varied totals** — Payout amounts shown are different across Admin home, Finance home, and Payouts Index.
- **Bank statement mismatch** — Total payouts for a certain day could be split across processors, creating mismatched expectations between what merchants earned and what appeared in their bank accounts.
- **Confusing statuses** — "Scheduled" payouts were labeled as "Pending" on the Finances page. The order transaction page also uses a "Pending" badge which represents something completely different: transactions that are waiting to be batched into a payout.
- **Payout timing differences** — Stripe marks payouts as "in transit" once funds are sent, while PayPal labels them "delivered" even if they take 3–5 more days to arrive in the merchant's bank.
- **Unclear cash flow forecasting** — Currently, the payouts page only shows the next scheduled payout. For merchants on daily payouts, that means they can only see one day ahead. Many expressed wanting visibility into several upcoming payouts to better plan and forecast their cash flow.

<!--
## Thinking like a merchant

I noticed that merchants often interact with payouts in 3 modes:

- **Casual mode** — When will my payouts arrive?
- **Accounting mode** — Do my payouts match my bank statement? Where can I export reports for taxes?
- **Troubleshooting mode** — Why hasn't my payout shown up yet? Where can I export reports for taxes?
-->

## I went through multiple iterations...

![iterations]()

![Final design walkthrough](<./payouts uplift final video.MP4>)

## Was it a success?

I was happy to see positive feedback from internal storeowners that I interviewed. However, we're still waiting on launch to measure specific KPIs: Reduction in payout-related support tickets, fewer merchant inquiries about payout timing and status confusion. User Satisfaction Score (CSAT), tracked post-launch to measure confidence and clarity in the payout experience.

In the interim, we shipped M1 of the project, Payout Errors Uplift, which consolidated all payout error messaging, reducing payout holds on merchant accounts by 43%.

![](<./was it a success.png>)

## Biggest learnings

At first I got caught up on optimizing for every edge case instead of designing the best experience for the majority of merchants. While scenarios like multi-entity or multi-currency shops (~10%) and reserve-based payouts for fraud prevention add complexity, designing around them would degrade the core experience. Instead, we ensured the system is scalable and can accommodate edge cases without letting them dictate the primary design.

![](<./biggest learnings 1.png>)
