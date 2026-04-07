---
# Required fields
id: 6                          # unique number, increment from last project
title: Project Title
slug: project-slug             # URL path: /work/project-slug
company: Company Name
protected: false               # true = requires password gate before content is shown

# Date & timeline
date: "3 weeks · 2025"        # shown in meta row: "duration · year"
timeline: Jan 2025 – Mar 2025  # shown in meta row below date

# Work card badges (shown on the projects grid card)
highlights:
  - Badge one
  - Badge two
  - Badge three

# Asset keys — must match entries in ProjectPage.jsx imageAssets / videoAssets / iconAssets
imageKey: myProjectImage       # fallback thumbnail if no video
iconKey: shopify               # company icon (shopify | searchEye)
videoKey: myProjectVideo       # hero autoplay video

ribbonKey: current             # omit if not a current/featured project

# Links shown in the meta row
walkthroughUrl: https://screen.studio/share/...   # "Watch Walkthrough" button
prototypeUrl: https://...                          # "Try it out" button (omit if none)

# Set true to make the full case study visible on the projects grid
caseStudyReady: true

# Team members shown in the meta row
team:
  - name: Lydia Shan
    role: DES
  - name: Partner Name
    role: PM

# Iterations viewer — only include if using ![iterations]() in content
iterationTabs:
  - Final
  - Iteration
  - Before
  - Wildcard
iterations:
  - group: Group Name
    images:
      - src: ./iteration-final.png
        annotations:
          - title: Annotation title
            text: Supporting explanation of this design decision.
      - src: ./iteration-v1.png
        annotations:
          - title: Annotation title
            text: What was tried here and why it didn't work.
      - src: ./iteration-audit.png
        annotations:
          - title: Annotation title
            text: Original state before any changes.
      - src: ./iteration-wildcard.png
        annotations:
          - title: Annotation title
            text: Exploratory direction that was considered.
---

<!--
  LAYOUT NOTES
  ─────────────────────────────────────────────────────────────────────────────
  • Every ## heading becomes a sidenav item (left sticky nav).
  • Sidenav appears once the first ## heading scrolls to mid-viewport.
  • Body padding: 20px left/right. Right margin: 120px (leaves breathing room
    on the right side of the two-column grid: [140px sidenav] [1fr body]).
  • On screens ≤ 1080px the sidenav hides and content centers to max-width 720px.
  ─────────────────────────────────────────────────────────────────────────────
-->

## Section heading (becomes a sidenav item)

Write the problem context here. What was the situation? Why did it matter?
Keep paragraphs tight — one idea per paragraph.

![Descriptive alt text](./audit-screenshot.png)

> User quote or research insight that supports the problem framing.

> Another quote — two or more consecutive blockquotes render side-by-side in a quote grid.

## Another section heading

Continue the narrative. What constraints shaped the work?

<!-- Two images side-by-side (--duo layout) -->
![First image alt](./design-v1.png)

![Second image alt](./design-v2.png)

<!-- Three or more images render as a grid (--grid layout) -->
![Image 1](./a.png)

![Image 2](./b.png)

![Image 3](./c.png)

## Issue / pattern chips

Use bold label + em dash for structured issue lists. ≤ 2 items = single column, 3+ = three-column grid:

- **Issue label** — Short description of the problem or pattern.
- **Another issue** — Keep descriptions to one sentence.
- **Third issue** — Three items triggers the three-column grid layout.

## Iterations (optional)

Use the special `iterations` alt text to render the IterationsViewer component.
Requires `iterationTabs` and `iterations` in the frontmatter above.

![iterations]()

## [hidden] Hidden anchor (optional)

Use `[hidden]` prefix to create an invisible heading that acts as a scroll anchor
without adding a label to the sidenav and without rendering visible text.
Useful for triggering "final walkthrough" video placement.

![Final design walkthrough](./final-video.MP4)

## Was it a success?

What shipped? What were the measurable outcomes?
Reference metrics, qualitative feedback, or follow-on impact.

![Success screenshot or chart](./outcome.png)

## Biggest learnings

One key insight framed as a principle, not a list. What would you do differently?
What did this project teach you about the craft or the domain?
