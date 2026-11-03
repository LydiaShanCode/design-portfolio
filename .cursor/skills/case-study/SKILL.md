---
name: case-study
description: Turns Lydia's raw worklog notes into a portfolio case study written in her voice, structured around decisions and trade-offs, and formatted as a project.md for this portfolio. Use when the user shares a worklog, notes, or project dump and asks to write, draft, rewrite, or improve a case study or project page.
---

# Case Study

You are ghostwriting a product design case study for Lydia Shan, a product designer at Shopify (fintech: payouts, providers, payments; previously 0→1 startup work). The input is her raw worklog. The output must read like Lydia wrote it on a good day: her voice, her honesty, her rhythm. It should also meet the bar senior hiring managers and design leads now hold case studies to.

Before writing, read [voice.md](voice.md). It holds real excerpts from her published case studies and is the source of truth for tone.

## The bar this case study has to clear

Reviewers skim a case study in 60–90 seconds, then interrogate the parts that hooked them. The case study has to work at both speeds.

1. **Answer three questions in the first screen.** What was actually broken, and for whom? What made it hard? What changed because of this work?
2. **Decisions over process.** Never use process stages as structure (Research → Ideate → Test). The spine is the two or three decisions that changed the project. For each one, show the evidence she had, the options she weighed, the trade-off she accepted, and what she chose.
3. **Show the mess.** Pivots, stakeholder tension, a wrong first bet, a constraint that killed the obvious answer. This is what proves seniority. Lydia's best sections ("A Mid-Flight Pivot", "Negotiating the Surface") are exactly this.
4. **Clear ownership.** "I" for her calls, "we" for team outcomes. Name partners by function (PM, engineering, partner design teams). Never let "we" hide what she did.
5. **Systems, not screens.** Show edge cases, states, adjacent surfaces, and how the solution fits into a larger moving product. This is a recurring theme in her work, so lean into it.
6. **Honest outcomes.** Use real metrics when they exist. If launch is pending, say so and name what will be measured. Use directional or qualitative evidence when that's all there is. Never invent or round up a number.
7. **Reflection that admits something.** The learning is a principle she earned by getting something wrong or nearly wrong, not a list of platitudes.
8. **AI as leverage, not a feature list.** When AI or coded prototypes mattered, say what they made possible (testing a real flow sooner, exploring more directions, crossing into code) and what judgment stayed hers.

## Workflow

Copy this checklist and work through it:

```
- [ ] 1. Extract a fact sheet from the worklog
- [ ] 2. Ask about gaps that would weaken the story
- [ ] 3. Write the spine (3 sentences) and pick a narrative shape
- [ ] 4. Draft the H2 headlines and run the headline test
- [ ] 5. Write the body in Lydia's voice
- [ ] 6. Format as project.md for this repo
- [ ] 7. Self-review against the checklist
```

### 1. Extract a fact sheet

Pull these out of the worklog before writing a single sentence of prose:

- **Context:** product, surface, business goal, who's affected, why now
- **Role and team:** her scope, partners (names and roles), duration, timeline
- **Pain evidence:** support ticket themes, verbatim user quotes, audit findings, data
- **Constraints:** technical, organizational, timeline, legacy, compliance
- **Decisions:** each with the alternatives considered and why they lost
- **Pivots and surprises:** what changed mid-project and how she adapted
- **Outcomes:** shipped milestones, metrics, qualitative feedback, pending KPIs
- **Assets:** screenshots, videos, iterations, and their filenames in the project folder

### 2. Ask about gaps

If something that carries the story is missing (her specific role, the outcome, the rejected alternative behind a key decision, a real user quote), use the AskQuestion tool to ask before drafting. Ask only what changes the story, and keep it to five questions or fewer. For anything else that's missing, write `[TODO: ...]` inline. Never fabricate quotes, metrics, names, or dates.

### 3. Write the spine and pick a shape

Write three sentences: the real problem, what made it hard, what changed. If you can't, the worklog needs more digging. Then choose the narrative shape that fits the project:

- **Tension arc (default):** setup, rising constraints, the key decision or pivot, resolution. Best when the journey is the interesting part. Most of Lydia's work fits this shape.
- **Outcome-first:** lead with the result and a hero visual, then unpack how she got there. Best when the metric is the headline.
- **Craft essay:** short, demo-first, no formal sections, thinking made visible. Best for personal and creative-coding projects like Listening Room.

### 4. Headlines first

Every `##` becomes a sidenav item, so the headlines double as the table of contents. Rules:

- Each H2 is project-specific and carries part of the story. Never use generic labels like "Research", "Process", "Solution", or "Overview".
- Keep her style: conversational, a little playful, sometimes a question ("Why even fix payouts?", "Double trouble", "The big 5 (issues)", "A Mid-Flight Pivot").
- **Headline test:** read only the H2s in order. They should tell the whole story.
- Keep her signature closers as the final two sections: `## Was it a success?` and `## Biggest learnings` (an optional suffix is fine, e.g. "Biggest learnings - Never design in a vacuum").
- Aim for 5–8 H2s.

### 5. Write the body

Her voice in brief (full examples in [voice.md](voice.md)):

- First person, direct, plain words. She sounds like she's explaining the project to a smart colleague over coffee.
- Open with business context, then the human cost: what merchants felt, what support absorbed.
- Short paragraphs with one idea each. An occasional sentence fragment for punch is fine.
- Scare quotes around product jargon or loaded terms: "fun money", "loud" UI, "black box".
- She names tensions explicitly, with labels: "The Need for Visibility" vs "The Concern of Clutter", "The Guide" / "The Fixer".
- She's candid: "At first I got caught up on…", "we're still waiting on launch to measure…".
- Raw user quotes go in as blockquotes, verbatim, typos and all. Two or more in a row render as a grid. Pick quotes that show emotion and confusion, not polite feedback.

Elevate without losing her:

- Tighten. Cut hedging, filler, and corporate verbs ("leverage", "utilize", "drive alignment", "seamless", "robust", "delightful"). Pick the plain verb.
- Make every decision traceable: the evidence (a quote, a ticket theme, a finding) leads to the choice, and the choice leads to the outcome.
- Close the loop: the outcome section should answer the problem the opening set up.
- Body text runs 600–1,200 words. Visuals carry the rest. Every image earns its place by moving the story forward.
- No em-dash chains, no "it's not X, it's Y" clichés, no triumphant tone. Confident and specific beats impressive.

### 6. Format as project.md

Write to `src/assets/projects/<slug>/project.md`. Follow `src/assets/projects/_case-study-template.md` exactly for frontmatter and markdown conventions:

- Frontmatter: `id` (next unused number), `title`, `slug`, `company`, `protected` (`true` for Shopify/NDA work), `date` ("duration · year"), `start`, `timeline`, 3–4 `highlights` (short capability badges like "B2B Fintech", "0-1 product design"), asset keys, `caseStudyReady`, and `team` (Lydia as `DES` first).
- Issue lists use `- **Label** — One sentence.` (3+ items render as a three-column grid).
- Images: `![Alt](<./filename with spaces.png>)`. Wrap paths containing spaces in angle brackets. Two consecutive images render side by side. Only reference files that exist in the project folder; otherwise use `[TODO: asset]`.
- Iterations: annotate each frame with `title` + one-sentence `text` written as a decision ("Switched to a timeline visual" + why), then place `![iterations]()` in the body.
- Final walkthrough video goes under a `## [hidden] Final walkthrough` heading.

### 7. Self-review

```
- [ ] Problem, difficulty, and outcome are clear in the first screen
- [ ] H2s alone tell the story; none are generic
- [ ] 2–3 decisions, each with evidence, alternatives, and trade-off
- [ ] At least one moment of mess: a pivot, tension, or wrong bet
- [ ] Her ownership is unambiguous; partners are credited by role
- [ ] Every number and quote comes from the worklog (or is marked TODO)
- [ ] Outcome answers the opening problem; pending metrics are named honestly
- [ ] Learning is a principle she earned, framed in first person
- [ ] Reads aloud like Lydia: plain, candid, a little playful
- [ ] Banned words and generic process labels are gone
```

After writing the file, give Lydia the three-sentence spine, the headline sequence, and the list of TODOs and questions still open.
