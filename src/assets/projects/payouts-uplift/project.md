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
  - Iteration 1
  - Wildcard
iterations:
  - group: Payouts Index Page
    images:
      - ./Multiple iterations - Payout index - final.png
      - ./Multiple iterations - Payout index - iteration 1.png
      - ./Multiple iterations - Payout index - wild card.png
  - group: Payouts Details Page
    images:
      - ./Multiple iterations - Payout details - final.png
      - ./Multiple iterations - Payout details - iteration 1.png
      - ./Multiple iterations - Payout details - wild card.png
team:
  - name: Lydia Shan
    role: DES
  - name: Faycal Sabaou
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

## Thinking like a merchant

I noticed that merchants often interact with payouts in 3 modes:

- **Casual mode** — When will my payouts arrive?
- **Accounting mode** — Do my payouts match my bank statement? Where can I export reports for taxes?
- **Troubleshooting mode** — Why hasn't my payout shown up yet? Where can I export reports for taxes?

## I went through multiple iterations...

![iterations]()

## Final designs

![](<./payouts uplift final video.MP4>)

## Was it a success?

I was happy to see positive feedback from internal storeowners that I interviewed. However, we're still waiting on launch to measure specific KPIs:
Reduction in payout-related support tickets — fewer merchant inquiries about payout timing and status confusion.
User Satisfaction Score (CSAT) — tracked post-launch to measure confidence and clarity in the payout experience.

![](<./was it a success.png>)

## Biggest learnings

At first I got caught up on optimizing for every edge case instead of designing the best experience for the majority of merchants. While scenarios like multi-entity or multi-currency shops (~10%) and reserve-based payouts for fraud prevention add complexity, designing around them would degrade the core experience. Instead, we ensured the system is scalable and can accommodate edge cases without letting them dictate the primary design.

![](<./biggest learnings 1.png>)
