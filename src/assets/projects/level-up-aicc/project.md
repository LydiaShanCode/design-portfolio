---
id: 6
title: Creating Security Awareness Training with AI
slug: level-up-aicc
featuredOrder: 3
company: Adaptive Security
protected: true
date: "2 months · 2026"
start: "Sep 2026"
timeline: Sep 2026 – Oct 2026
highlights:
  - Set hybrid AI editing as the direction
  - No drop-off from the new intake
  - 11 PRs shipped in code
iconKey: adaptive
videoKey: aicc
caseStudyReady: true
showcase:
  - file: prompt.jpg
    wide: true
    alt: The creation prompt, asking what training to build
  - file: questions.jpg
    alt: Follow-up questions that gather intent before generating
  - file: style.jpg
    alt: Visual style options, from photo-realistic to custom
  - file: layouts.jpg
    alt: New frame layouts in the content picker
  - file: quiz.jpg
    alt: A branded quiz frame with feedback on the answer
  - file: editor.jpg
    alt: The frame editor, with AI edits and manual fixes side by side
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

## AI drafts the training. Admins can't finish it.

Adaptive Security is most known for offering security awareness training for compliance. A refresh on the training's interactivity and editing was needed to stay competitive. I led the design of a new editor experience that lets customers revise their training slides with AI.

I started broad and prototyped two formats. One used a timeline for a video-like lesson. The other kept the familiar slide format. When the models fell short of the video output we wanted, we moved forward with slides.

I then tested three editing approaches: prompt-only editing, AI with simple manual controls, and a freeform canvas where customers could drag and resize anything. For everyday editing, most preferred a mix of AI and direct controls. They wanted to pick a layout, move an element and have it snap into place, or ask the AI to make a bigger change. Templates and suggested prompts came up more often than prompting from scratch.

Prompting directly on the slide element felt the most intuitive. Keeping the chat history on the left held onto the context from the first prompt and the follow-up questions, showed the latest edit by default, and let customers undo it if they preferred the original. I designed a visual take on versioning: customers toggle between AI edits, the modified version is selected by default, and each request can be undone on its own.

The concept tests gave us a direction for the editor and a clearer sense of which manual controls mattered. The new layouts gave the content team something they could use right away.

In an early funnel check, about 85% of users started generating a module and 77% saw a finished one. Some admins also asked to keep prompting after their module was built. Once the new editor ships, I'd look at what customers do with that first draft, including how often they prompt again and which changes they make by hand.

[TODO: asset — before/after of a generated module]

- **No guardrails on the prompt** — The creation flow didn't ask what it needed to know, so the AI guessed, and admins spent the rest of their time correcting it.
- **No way to make small fixes** — Once a module existed, every change meant regenerating it. Admins wanted the last word on a single frame.
- **Hidden building blocks** — The control for adding content was easy to miss, so people stalled right after the first draft.

## More layouts, shipped carefully

The content team asked for more frame layouts, and I built them: nine in the backend contract and renderer, six in the layout picker. I shipped the reader before the picker, so older clients could still open saved frames. Both PRs merged.

When an image placeholder overflowed, I proposed a fix and engineering shipped a narrower one. Theirs was right. Mine touched more than the bug did.

[TODO: asset — new frame layouts in the picker]

## Rules the model can follow

The lead designer and I ran a spike: what if the AI generated frames as HTML instead of filling fixed templates? I ran the prompt iterations, scored every generation from 5 to 9, and turned each critique into a numbered design rule, versioned from V4 to V19. I also built a small tool that syncs those rules to our docs, so the page never drifts from the prompt.

Engineering's reaction was that the rules should become a system prompt. That was the point of writing them as rules instead of a critique.

Branding was the surprise. The model themes a module to a customer's brand remarkably well. Interactivity was the trap. In customer calls, people were clear that training is not a game:

> If it was all interactive, I think we'd turn off a number of users

> the training is to educate the user and not punish them

So the rules say: brand freely, interact sparingly.

## How much should the AI drive?

This was the open question on the bet. I built a coded prototype of an AI-first editor and tested three modes side by side:

- **AI-only** — Every change goes through a prompt.
- **Hybrid** — The AI drafts, and a side panel handles small manual fixes.
- **Freeform** — A manual canvas where anything can move.

I ran five concept tests in two weeks, with security and training teams at a global manufacturer, an aviation company, an automotive software company, an AI company, and a large tax-prep company. The PM opened each session. I ran the prototype and the questions. AI-only lost every time.

> I want AI to give me ideals, but I want control over what I do with those ideals

> I can't select a particular frame and restore that part alone

> you don't need to prompt for basics

I'd assumed freeform would win once AI-only lost, since direct control was what people kept asking for. But a blank canvas brings back the problem the feature exists to solve. Hybrid won: AI for the draft, small direct controls for the fixes.

The same sessions found a quieter problem. Finding "Add block" was the main friction in 7 of 9 sessions.

> add block doesn't mean anything… Maybe add content

After four sessions I moved the entry point and tested the new version with the last customer. Top placement was noticeably easier to find. I wrote the synthesis with the lead designer and PM. Its headline: hybrid editing is the direction, and templates still matter.

[TODO: asset — the three editing modes]

## Polish on the guided flow

The lead designer owned the guided creation flow, which asks admins about their intent before generating. I contributed the visual polish: seven merged PRs in the days before launch, including the loading state, revised through two rounds of notes. I also argued for the background treatment that shipped, and for where the learning objectives sit.

The flow launched in October. Its first 14 days showed the risk of extra questions didn't materialize: about 95% of people who submit a prompt still go on to start an outline. The drop-off is later. About 85% start creating a module, and only 77% see a finished one.

## [hidden] Final walkthrough

[TODO: asset — frame builder prototype walkthrough video]

## Was it a success?

The parts I owned shipped. Nine layouts in production, seven polish PRs on the guided flow, and a rule set that engineering adopted as candidate instructions for the model. The synthesis set hybrid editing as the bet's direction.

What I can't claim: that the output got less generic. That was the brief's real target, and nothing measures it yet. The usage numbers above belong to the team's launch, not to my polish.

The rest was still in motion when I left. The quiz feedback pattern I'd designed was in the engineering backlog, and narration was mid-scoping. The number I'd watch next is how often admins edit a frame by hand after generating, since that's the behavior hybrid editing is supposed to unlock.

## Biggest learnings

I treated the editing question like a slider from all-AI to all-manual, and assumed the answer sat at one end. Customers kept saying it isn't a slider. They want the AI to do the boring 80% and their own hands on the last 20%.

Designing for AI turned out to be mostly about the handoff back to the person: making the control they reach for impossible to miss, and writing the rules clearly enough that the model follows them too.
