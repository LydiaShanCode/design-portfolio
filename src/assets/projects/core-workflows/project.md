---
id: 7
title: Campaign Creation
slug: core-workflows
featuredOrder: 2
company: Adaptive Security
protected: true
date: "2 months · 2026"
start: "Jul 2026"
timeline: Jul 2026 – Sep 2026
highlights:
  - 2,000+ test sends in 60 days
  - Setup confusion cut by more than half
  - 2 features, brief to launch
iconKey: adaptive
videoKey: coreWorkflows
caseStudyReady: true
team:
  - name: Lydia Shan
    role: DES
  - name: Kim L.
    role: DES
  - name: Kelley N.
    role: DES
  - name: Jeff H.
    role: ENG
---

## Admins launched campaigns they weren't sure about

Adaptive Security sells security awareness training. Admins build campaigns: who gets enrolled, which modules, when they're due, which emails go out. Two weeks after I joined, our VP of Product flagged that over 80% of admins edit a campaign after launching it. About 45% created a throwaway test campaign first, just to see what employees would receive. Those test campaigns polluted their reporting data.

I was asked to explore a greenfield concept for campaign creation while another designer improved the existing wizard. My concept didn't ship. The research behind it did: two features I took from finding to launch.

- **No preview of the inbox** — Admins could preview a module, not the email. So they built fake campaigns to find out.
- **One toggle, two jobs** — "Compliance" quietly controlled whether results were posted to tools like Drata or Vanta. Admins couldn't tell.
- **The whole picture, hidden** — Settings were spread across wizard steps, so nothing showed the campaign as one thing before it went live.

## A single page, tested against a better wizard

At design review we split the bet in two. My prototype dropped admins onto an empty campaign page where every setting is visible and editable in place. The other kept the stepper and fixed its rough edges. I built mine as a coded prototype, about 20,000 lines, so participants clicked through a real flow.

I asked engineering whether build cost should shape the direction. The answer was no, not for discovery prototypes. So I tested the boldest version.

[TODO: asset — Prototype A walkthrough]

## The concept won. The wizard shipped.

We tested both with customers and internal security staff. I ran the session with an engineering firm's InfoSec lead.

> I'm… a fan of the one pager

Three sessions rated the single page 4, 8–9 and 8 for ease, and all three praised having everything on one scrollable page. It had real weaknesses too: "mark done" was hard to find, and some settings fell below the fold.

The team kept the wizard, the lower-risk change to a flow customers already knew, and moved the single page's strengths into its review step. That stung a little. But the sessions surfaced two problems neither prototype solved, and both became projects I owned.

## Send yourself the real email

Participants kept inventing workarounds to see what employees would receive. A CISO described the missing feature as one of his favorites. I wrote the brief and the spec for Test Send, with the trade-off stated up front: ship fast, on a foundation that lasts.

The details are what make a test trustworthy, so I grounded each one in the code:

- **Real due dates** — The test follows the campaign's cadence, so it reads like the email employees get.
- **Their language** — Each recipient gets it in their own language. A language picker would have been redundant.
- **One source of truth** — I documented every notification macro so engineering and support worked from the same list.

One call didn't go my way. I wanted one recipient picker for training and phishing. Engineering said the migration was costly, so I asked why, accepted the answer, and logged the consolidation to the backlog instead of dropping it.

Engineering wrote the production code. I wrote the prototype, ran QA, and wrote the help article, the Loom, the sales and support notes, and the launch post.

[TODO: asset — Test Send modal and entry points]

## A toggle that did two things

In testing, admins didn't realize that marking a campaign "compliance" also sent results to their GRC tool. One CISO only found out from our prototype. A teammate's query showed why it mattered: 41.3% of sent training campaigns had compliance on, but only 5.4% had any postback. Engineering confirmed the link was a frontend-only restriction, so the two could be separated.

I sized the install base first. 93 orgs used only Vanta, 31 only Drata, 24 only BambooHR, and almost nobody ran more than one. That became the rule: suggest a postback only when it's useful, and hide the other vendors once one is connected.

Then I split the settings. The campaign tag became "Mark as Compliance for reporting." Postbacks got their own card, with an empty state and an info popover. I designed it, wrote both production PRs, merged them, and wrote the launch post.

[TODO: asset — compliance card states]

## Overdue isn't finished

In parallel I redesigned the campaign index: one list instead of two dense tables, with progress, archive, and markers for recurring campaigns. I ran two interviews, with a Director of IT and a senior InfoSec manager. Both pushed back on the same assumption I'd made, that an overdue campaign is finished.

> It's a compliance thing… we can't just close those out

> We would still treat it as a live campaign

Overdue became a live state. Engineering picked the project up in October and built from these designs.

## [hidden] Final walkthrough

[TODO: asset — Test Send walkthrough video]

## Was it a success?

Both features shipped. Compliance clarity went out in August, and Test Send followed in September, for training and phishing email, up to 10 recipients per test. Two months later:

- **Test Send gets used** — 1,487 training and 594 phishing test sends in 60 days, from at least 33 and 25 companies. Weekly training sends tripled in the first five weeks, 93 to 295, with no server errors on either endpoint.
- **Setup confusion dropped** — Customer conversations about setting up compliance or postbacks fell from 12 to 5, and setup tickets from 4 to 1.
- **The renamed toggle reaches people** — 365 admins at 326 companies clicked "Mark as Compliance for reporting" 708 times in 30 days.

These are usage counts, not measured outcomes. Conversation counts show how much people talked about a problem, not how often it happened. Delivery issues like sync failures rose from 7 to 11 in the same window, because a label can't fix an integration. And nobody has re-measured the 45% test-campaign baseline, so I can't claim Test Send ended the workaround.

The requests to "see the real inbox" held flat, 18 before and 19 after, but they changed shape. Support now answers them by pointing at Test Send. The feature also exposed a gap nobody could see before: several admins found the in-product preview didn't match the test they received. A few bugs shipped with it too. Auto-Phish test sends failed for five companies until engineering fixed them, and French tests arrived in English.

On calls, admins still ask what a "postback" is. Splitting the toggle fixed the structure. The word is still in the way.

## Biggest learnings

I treated the single-page prototype like something I had to win. Its job was to make people say what they needed out loud, and it did. "Send me a test" and "what does this toggle do?" only came up because participants were clicking through something real.

The other lesson came from engineering. Some of my screens didn't match the live app, and an early draft reused nothing that already existed. I design against the live product now, before the file.
