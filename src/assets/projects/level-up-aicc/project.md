---
id: 6
title: Level up AICC
slug: level-up-aicc
featuredOrder: 3
company: Adaptive Security
protected: true
date: "2 months · 2026"
start: "Sep 2026"
timeline: Sep 2026 – Oct 2026
highlights:
  - AI-native editing
  - Customer concept testing
  - Shipped in code
  - Guidelines for AI
iconKey: adaptive
videoKey: aicc
caseStudyReady: false
team:
  - name: Lydia Shan
    role: DES
  - name: Nick R.
    role: DES
  - name: Allison K.
    role: PM
  - name: Sean Y.
    role: ENG
  - name: Andrew W.
    role: ENG
---

## Training people don't want to skip

Adaptive Security sells security awareness training: phishing simulations and short training modules that every employee has to complete. The AI content creator (AICC) lets security admins generate those modules from a prompt instead of picking from a library. The pitch is speed. The catch is control. Once the AI hands back a module, an admin has to make it theirs: fix a frame, add a quiz, match the brand, all without a design background.

I joined the "Level up AICC" bet two months into my time at Adaptive, working with the lead designer, a PM who ran our customer feedback program, and the AICC engineering team. My scope covered interactive blocks, the editing model in the frame builder, layouts and narration. For much of it I worked directly in code.

[TODO: asset — before/after of a generated module]

- **Quizzes that never say why** — Quiz blocks marked an answer wrong without ever explaining why, and accessibility (WCAG) had become a procurement gate.
- **Built for AI or for people, not both** — We didn't know if admins wanted to prompt their way to a finished module, drag boxes around, or something in between.
- **Hidden building blocks** — The way to add new content was easy to miss, so admins stalled right after the first draft.

## Quizzes that explain themselves

My first piece was the quiz. I designed flippable cards, a graded quiz and a card "quizlet," then compared two ways to show feedback: a "Chin" that drops below the card, and a "Blur card" that blurs the question and lays the explanation on top. I pushed for the blur. The chin competed with the next question, while the blur kept the eye on one thing.

The harder problem was that a person isn't writing most of this feedback. The AI is. So I wrote guidelines meant for both designers and the model: about 30 words of feedback for immediate blocks and 50 for submitted ones, 3 to 6 options, no modals, and confetti only on a correct submitted answer. Our Head of Design called them "opinionated but still flexible," and our eng lead's first reaction was that they should become an LLM system prompt. That was the point.

[TODO: asset — Blur card vs Chin comparison]

## Letting the AI wear the brand

Next, the lead designer and I ran a spike: what if the AI generated frames as HTML instead of filling fixed templates? I ran the prompt iterations, logged every generation run with a quality score from 5 to 9, and co-wrote the frame design rules the model followed, from V10 to V19. I also built a small agent skill that synced those rules to Notion, so the docs never drifted from the prompt.

Branding was the surprise. The model was great at theming a module to a customer's brand. Interactivity was the trap. In customer calls our PM ran, people were clear that training is not a game:

> If it was all interactive, I think we'd turn off a number of users

> the training is to educate the user and not punish them

The takeaway we carried forward: brand freely, interact sparingly.

## How much should AI drive?

This was the biggest open question on the bet. I built a coded prototype of an agent-first frame builder and tested three editing modes side by side:

- **AI-only** — Every change goes through a prompt.
- **Hybrid** — The AI does the heavy lifting, with a side panel for small manual tweaks.
- **Full freeform** — A manual canvas where admins can move anything.

I led five concept tests with security and training teams at a global manufacturer, an aviation tech company, an automotive software company, an AI company and a large tax-prep company. AI-only lost every time. People liked what the AI made, but they wanted the last word.

> I want AI to give me ideals, but I want control over what I do with those ideals

> I can't select a particular frame and restore that part alone

> you don't need to prompt for basics

At first I assumed freeform would win once AI-only lost, since direct control was what people kept asking for. But a fully manual canvas brings back the blank-page problem AICC exists to solve. Hybrid was the clear winner: AI for the draft, small direct controls for the fixes.

[TODO: asset — the three editing modes]

## "Add block doesn't mean anything"

The other pattern was quieter and more consistent. Admins couldn't figure out how to add new content. Finding "Add block" was the main friction point in 7 of 9 sessions.

> add block doesn't mean anything… Maybe add content

For the last session I tested two placements for the entry point, and moving it to the top made it noticeably easier to find. I folded that, the per-frame revert request and the naming feedback into a synthesis I wrote with the lead designer and PM. Its headline: "Hybrid editing (AI + simple manual tweaks) is the right path forward… Templates are still critical."

## Shipping the pieces in code

While the bigger direction was still being set, I shipped what I could directly:

- **Frame layouts** — Nine layout templates in the backend contract and renderer, and six in the layout picker, built for the content team who requested them.
- **Guided creation polish** — Seven visual polish PRs on the guided AICC creation flow in the days before it launched.
- **Narration quick wins** — Wireframes, a journey map and coded prototypes that scoped narration's first milestone to the frame builder and settings.

[TODO: asset — new frame layouts in the picker]

## [hidden] Final walkthrough

[TODO: asset — frame builder prototype walkthrough video]

## Was it a success?

Partly, and I want to be clear about which part. The guided creation flow launched with my polish in it, and the new frame layouts shipped to the content team: 11 merged PRs in two months. The synthesis set hybrid editing as the direction for the bet.

The rest was still in motion when I left. The quiz feedback work was open, and narration was mid-milestone. We had no usage data on the editor yet. The numbers I'd watch next are how often admins make a manual change after generating, and whether the new "Add block" placement shortens the time to that first change.

## Biggest learnings - Control is a feature

At first I treated the editing question like a slider from "all AI" to "all manual," and assumed the answer sat at one end. Customers kept telling us it isn't a slider. They want the AI to do the boring 80% and their own hands on the last 20%. Designing for AI turned out to be mostly about designing the handoff back to the person, and making the thing they reach for impossible to miss.
