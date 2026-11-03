---
id: 7
title: Core Workflows
slug: core-workflows
featuredOrder: 2
company: Adaptive Security
protected: true
date: "2 months · 2026"
start: "Jul 2026"
timeline: Jul 2026 – Sep 2026
highlights:
  - Admin workflows
  - Concept testing
  - Brief to launch
  - Shipped in code
iconKey: adaptive
videoKey: coreWorkflows
caseStudyReady: false
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

## Launching a campaign shouldn't feel risky

Security admins use Adaptive to run training campaigns: who gets enrolled, which modules, when they're due, and which notifications go out. It's the core workflow of the product, and it made people nervous. At the kickoff for the "Core Workflow Usability" bet, our VP of Product pointed out that "over 80 percent of people are already editing campaigns after they launch." Admins were launching, spotting something off, and patching it live. About 45% of orgs that launched a training campaign created an explicitly test-named one first, just to see what employees would get.

Two weeks after I joined, I was asked to lead a greenfield concept for campaign creation while another designer improved the existing wizard. My concept didn't win. But the research behind it turned into two features I took from brief to launch.

- **A wizard that hides the whole picture** — Settings were spread across steps, so admins never saw their campaign as one thing before it went live.
- **No way to preview the inbox** — Admins could preview a module, but not what the email would feel like in their inbox, so they built fake campaigns to find out.
- **One toggle, two jobs** — The "compliance" toggle quietly controlled whether results were posted to tools like Drata or Vanta, and that setting stayed hidden until the toggle was on.

## One page vs. a better wizard

At the design review we split the bet into two prototypes. Mine, Prototype A, dropped admins onto an empty campaign page: a "single pane of glass" where every setting is visible and editable in place. Prototype B kept the stepper and fixed its rough edges. I explored a two-column layout, an improved wizard and a flat single page before landing on A, then built it as a coded prototype so participants could click through a real flow instead of a click-through mock.

I asked engineering whether build cost should shape which direction I pushed. The answer was no, not for early prototypes. That freed me to test the boldest version.

{{campaign-prototype}}

## A tie goes to the wizard

We ran concept tests with customers and internal security staff. I led the session with an engineering firm's InfoSec lead, who rated Prototype A an 8 to 9 for ease:

> I'm… a fan of the one pager

The full synthesis was blunt, though: "Both flows tested well… There isn't a definitely better approach." A had real weaknesses. "Mark done" was hard to discover, and some settings fell below the fold. With no clear winner, the team kept the stepper, the lower-risk change to a workflow customers already knew. The single page's strengths moved into the review and details pages instead.

It stung a little. But the sessions surfaced two problems neither prototype solved, and they became my next two projects.

## "Just send me a test"

Participants kept inventing workarounds to see what employees would actually receive. An internal security tester sent a full campaign to himself to check it, and a CISO asked for exactly what we were missing:

> loved that feature that was one of my favorites

> have an easy simulator mode

I wrote the brief and spec for Test Send, with one trade-off up front: optimize for speed, on a foundation that would last. Admins can now send any training or phishing notification to themselves or chosen recipients before launch. The details made the test trustworthy:

- **Real due dates** — The test reflects the campaign's selected cadence, so it reads like the real email.
- **Their language** — Each recipient gets the test in their own language, with matching banner copy.
- **One source of truth** — I documented every notification macro so engineering and support worked from the same list.

One call didn't go my way. I wanted a single recipient picker for training and phishing. Engineering pushed back on the migration cost, so we shipped two pickers and logged the consolidation to the design system backlog. That was right for speed, and I'd rather name the debt than hide it. Engineering built production while I prototyped, ran QA, and wrote the help article, the Loom and the launch post.

[TODO: asset — Test Send modal and entry points]

## Untangling compliance from postbacks

The second problem was a toggle doing two jobs. In testing, admins didn't realize that marking a campaign "compliance" also sent results to their GRC tool. One CISO only found out from our prototype. Engineering confirmed the link was a frontend-only restriction, so the two could be pulled apart.

I sized it first: 93 orgs used only the Vanta postback, 31 only Drata and 24 only BambooHR. Then I split the two settings: the campaign tag became "Mark as Compliance for reporting," and postbacks got their own card with a clear empty state and an info popover. I designed it, wrote both PRs, merged them and wrote the launch post.

[TODO: asset — compliance card states]

## What "live" really means

In parallel I redesigned the campaign index pages: consolidated cards, progress bars, archive, and markers for recurring campaigns. I led two interviews, with a Director of IT and a senior InfoSec engineering manager, and both pushed back on the same assumption I'd made: that an overdue campaign is finished.

> It's a compliance thing… we can't just close those out

> We would still treat it as a live campaign

Overdue became a live state. I handed off the specs, and the team later used my designs as the starting point for the cards they built.

## [hidden] Final walkthrough

[TODO: asset — Test Send walkthrough video]

## Was it a success?

Both features shipped. Compliance clarity went out in August, and Test Send followed in September for email, up to 10 recipients per test. Our Head of Design called the compliance change "a valuable UX update." We didn't have usage data for either before I left. The numbers I'd watch are the share of test-named campaigns and support tickets about postbacks.

Prototype A's research also fed the team's Triggered/One-time Campaign Clarity launch, where I was credited as a contributor. That's a team outcome rather than mine, but its early numbers moved the right way: auto-enrollment rose from 3.9% to 7.9%, and drafts without a policy dropped from 140 to 5.

## Biggest learnings - A losing prototype can still win

At first I treated Prototype A like something I needed to win. Looking back, its job was to make people say what they needed out loud, and it did. "Send me a test" and "what does this toggle do?" only came up because participants were clicking through something real. Now I judge a bold prototype less by whether it ships and more by what it makes people tell you.
