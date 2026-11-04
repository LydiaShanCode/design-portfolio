---
name: site-index
description: Keep public/index.md in sync with this portfolio. Use whenever a change adds, removes, or rewrites something a visitor or an agent would learn from the site, including projects, case studies, about copy, resume, roles, dates, metrics, links, or pages. Also use when the user mentions index.md, llms.txt, or the markdown version of the site.
---

# Site index

`public/index.md` is the plain-text map of lydiashan.com. People open it from the small "index.md" link in the footer. Agents fetch `https://lydiashan.com/index.md` directly. The site is the source of truth. The file only restates what the site already says.

## When to update it

Update it in the same change when any of these change:

- A project is added, removed, renamed, reordered, archived, or given a new public summary
- A case study's public outcome changes: a metric, a company, a year, or whether numbers exist yet
- About copy, the resume, roles, dates, education, or skills that the index mentions
- A public link: email, LinkedIn, X, GitHub, Are.na, Play, CV, or the resume PDF

Leave it alone for visual work: layout, CSS, motion, refactors, and bug fixes that do not change what a visitor would learn.

## How to write it

Keep the shape already in the file:

1. An H1 with her name.
2. A blockquote of one or two sentences, taken from the About page.
3. H2 sections whose items are markdown links, then a colon and a short note. `[Name](absolute url): note`
4. A Links section with the website, this file, and the contact links.

Use absolute `https://lydiashan.com/` URLs. Stay in first person only if the About page does. Prefer the short public claim on the CV or the case study's own outcome section. Never invent a metric, quote, date, or role. If a number is pending or unmeasured, say so the way the case study does. Do not paste a protected case study into this file. One or two sentences per project is enough.

## Tell her

In the same message where you describe the change, say what happened to the index:

- If you updated it, name what changed in one sentence.
- If the change cannot affect the public summary, say that `index.md` did not need a change.

Do not update the file silently, and do not skip the sentence.
