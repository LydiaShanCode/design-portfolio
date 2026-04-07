---
id: 2
title: Smart Markets
slug: smart-markets
company: Shopify
protected: true
date: "3 weeks · 2025"
timeline: Dec 2025
highlights:
  - Contextual AI Design
  - Localization & compliance UX
  - 0-1 product design
  - Coded Prototype
imageKey: internationalCommerce
iconKey: shopify
ribbonKey: current
videoKey: internationalCommerce
prototypeUrl: ""
caseStudyReady: true
team:
  - name: Lydia Shan
    role: DES
  - name: Michelle Wu
    role: PM
  - name: Ben Kovy
    role: ENG
  - name: Arya Malita
    role: ENG
---

## Uncovering product restrictions

International expansion is a massive growth lever, but it's historically been a "black box" for merchants. While Shopify Managed Markets streamlines cross-border commerce by automating the heavy lifting, it inadvertently abstracted critical details, specifically regarding product restrictions. This lack of transparency didn't just frustrate merchants. It flooded our support channels with high-priority incidents from users who felt they had lost control over their own inventory. What should have been a growth tool turned into a source of support-heavy friction and merchant frustration.

By leveraging AI as a contextual helper, we could restore merchant agency and clarify the "why" behind restrictions without cluttering the core product experience.

![Current state](<./Audit.png>)

> No, but why is that? Why can't I? Why? What's the reason? I'm just curious.

> Yeah, some of the restricted products are candles and essential oils, which are two of our best-selling items. That makes us not qualified for managed markets?

> So is it a certain volume or dollar amount? What are the criteria that need to be met?

## Negotiating the Surface: A Cross-Functional Challenge

To reassess a product for restriction removal, category product metafields must get updated. Which led to one of the biggest hurdles. This project touched the Product Details Page, one of the most high-traffic and complex surfaces in Shopify. I spent a significant portion of the project in cross-functional team management, aligning with other design teams that own the Publishing card and Meta-field surfaces. We faced a classic design tension:

The Need for Visibility: We wanted to bring attention to the restriction reasons.
The Concern of "Clutter": Stakeholders were worried about adding a permanent UI footprint to a page already crowded with other states, including emerging AI features.

![Original metafields proposal](<./Category metafields 1.png>)

![Other iterations](<./metafields 2.png>)
## The Solution: Progressive Disclosure & Sidekick AI

To balance these needs, I shifted from a "loud" UI to progressive disclosure. Rather than a large banner on the category metafields card, a popover reveals more details and provides space to surface Sidekick, our admin AI assistant.

The Guide: Sidekick explains the specific reason for the restriction based on regional laws.
The Fixer: It assists the merchant in adding the correct meta-fields to potentially bypass the restriction automatically.

![Progressive disclosure](<./sidekick 1.png>)

![Other iterations](<./sidekick 2.png>)

## A Mid-Flight Pivot

Design at Shopify rarely happens in isolation. Midway through this project, the Selling Strategies team began redesigning the core publishing flow.

With a larger UI footprint, I moved beyond a simple popover and introduced a dedicated subpage within the publishing modal, while ensuring Sidekick remained surfaced in this new context.

![Publishing Card](<./new publishing card 1.png>)

![Publishing Modal](<./new publishing card 2.png>)

![Sidekick chat](<./new publishing card 3.png>)

![Anchor link hint](<./new publishing card 4.png>)

![Other iterations](<./pivot.png>)


## [hidden] Final walkthrough

![Final design walkthrough - coded prototype](<./International Commerce Final video.MP4>)

## Was it a success?

The "minimalist" approach proved to be the right one. By leveraging AI and focusing on metadata accuracy rather than just UI alerts, we achieved:

Support ticket reduction: A significant drop in incidents related to cross-border product confusion.
Improved metadata health: Better merchant understanding led to more accurate product categorization across the platform.

## Biggest learnings - Never design in a vacuum

This project reinforced that you are never designing in a vacuum. Even if you are responsible for one "piece," you have to understand the entire puzzle. In this case, the puzzle included other AI states and technical constraints of how meta-fields are manipulated. By choosing a Minimal UI footprint, I ensured our solution was resilient and didn't clash with the work of other teams. Sometimes, the most "convincing story" in design is how your solution fits seamlessly into a larger, moving ecosystem.
