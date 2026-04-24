# VacationPro Carousel System — Design Spec

**Date:** 2026-04-18
**Scope:** Facebook + Instagram carousel posts. Engagement + lead gen mix.
**Status:** Approved design, ready for implementation plan.

---

## Goals

- Produce consistent, branded carousels for FB + IG.
- Drive **engagement** (saves, shares, comments) AND **lead gen** (ManyChat comment-keyword → DM → landing page → newsletter).
- Post mix: **4 engagement : 1 lead gen** out of every 5 carousels.
- Reuse existing VacationPro brand foundation and carousel HTML template. No new brand tokens.

## Non-Goals

- New brand identity (colors/fonts/logo already defined in `Brand/foundations/`).
- Short-form video / reels (separate workstream).
- Landing page / ManyChat flow build (already exists).

---

## Competitor References

| Ref | URL | Pattern |
|-----|-----|---------|
| Fives Oceanfront | instagram.com/p/DXOwimxDpq9 | Single-resort spotlight, contrarian hook, "Comment FIVES" ManyChat CTA. **Lead gen template.** |
| Milan/Lake Como | instagram.com/p/DE-AdfOsdK5 | "SAVE this post" bucket-list carousel. Engagement. |
| Top 10 Summer Destinations | instagram.com/p/DQMuwSmETfT | Emoji-led listicle, broad-reach engagement. |

---

## Content Pillars

Every carousel fits one of these 4 pillars.

| # | Pillar | Purpose | Example hook |
|---|--------|---------|-------------|
| 1 | Ranked Resorts | Engagement | "Top 10 adults-only all-inclusives in the Caribbean" |
| 2 | Budget / Value | Engagement | "7 all-inclusives under $300/night that feel like $1,000" |
| 3 | Audience-Specific | Engagement | "Best all-inclusives for first-time couples in 2026" |
| 4 | Hidden Gems / Contrarian | **Lead gen** | "This adults-only resort in Jamaica is a steal — and nobody's talking about it" |

### Weekly Mix (per 5 carousels)

- 2× Ranked Resorts
- 1× Budget / Value
- 1× Audience-Specific
- 1× Hidden Gem (with ManyChat keyword CTA)

---

## Hook Formulas

Fill-in-the-blank headlines for the cover slide.

**Ranked Resorts**
- `Top [N] [category] all-inclusives in [region]`
- `Ranked: the [N] best [category] resorts right now`

**Budget / Value**
- `[N] all-inclusives under $[price]/night`
- `The cheapest all-inclusives that don't feel cheap`

**Audience-Specific**
- `[N] best all-inclusives for [audience] in 2026`
- `If you're [audience description], stop scrolling`

**Hidden Gems / Contrarian** (lead gen)
- `[N] all-inclusives nobody's talking about`
- `Stop booking [well-known resort]. Book this instead.`
- `The all-inclusive [audience] don't know exists`

---

## Visual System

**Reuses** `Brand/foundations/02-colors.md`, `03-typography.md`, `04-logo.md`, and `Brand/templates/carousel.html`. No new tokens.

- Slide size: **1080 × 1080** (square — works FB + IG feed + IG carousel).
- Font: **Inter** only (weights 500/700/800/900).
- Primary background: **Hero Green `#4ac850`** for cover + CTA slides. **Forest gradient over photo** for interior slides.
- Eyebrow label: top-left, uppercase, 2–4px tracking, Hero Green on Forest or Cream on Green.
- Wordmark: bottom-right, 20px, 700 weight.

### Slide Archetypes (extends existing template)

1. **Cover (solid green)** — exists. Reuse as-is for all carousels.
2. **Setup (forest or photo)** — exists.
3. **Ranked entry (NEW variant)** — full-bleed photo + forest gradient. **Amber rank badge** (#1–#10) top-left, 160px, 900 weight. Resort name (H1 64px). Location line (Body 28px, Cream). 1-line "why it's here" (Body). Optional Hero Green price pill bottom-right.
4. **Check-list** — exists. Use for "Why it works" on lead gen posts.
5. **Catch-box** — exists. Use for gotchas on lead gen posts.
6. **CTA — Save (NEW variant)** — Hero Green background. Display: "Save this for your next trip." Secondary: "Follow @vacationpro for more."
7. **CTA — ManyChat (NEW variant)** — Hero Green background. Display: `Comment "[KEYWORD]" for the full guide.` Hand-pointer or down-arrow icon. Wordmark.

---

## Carousel Structures

### Structure A — Ranked Listicle (engagement)

**Length:** 7–10 slides (cover + 5–8 entries + CTA). Match entry count to hook promise.

| # | Slide | Purpose |
|---|-------|---------|
| 1 | Cover | Hook headline + eyebrow + swipe prompt |
| 2 | Setup | 1-sentence value prop ("We stayed at and ranked these. Here's what actually holds up.") |
| 3 to N-1 | Ranked entries | Count DOWN from #N to #1. Photo + rank badge + name + location + 1-line hook + optional price pill. |
| N | CTA — Save | "Save this for your next trip." + follow prompt |

**Rank order:** countdown (#10 → #1). Saves-the-best-for-last drives full swipe-through.

### Structure B — Hidden Gem / Spotlight (lead gen)

**Length:** 3–6 slides. Tighter. Curiosity-driven.

| # | Slide | Purpose |
|---|-------|---------|
| 1 | Hook cover | Contrarian headline, no spoiler |
| 2 | Reveal | Full-bleed resort photo, name, location, Amber VERIFIED pill |
| 3 | Why it works | Check-list: 4–5 bullets (features, price, location) |
| 4 (opt) | Catch-box | Gotcha if any ("Book 60+ days out — prices double inside that window") |
| 5 (opt) | Extra proof | Second photo + stat or testimonial |
| N | CTA — ManyChat | `Comment "[KEYWORD]" for the full guide.` |

**Keyword convention:** single memorable word tied to topic (JAMAICA, STEAL, PARADISE, ADULTS). Use the same keyword in caption and on final slide.

---

## Caption Framework

```
[Hook line — repeat the headline promise]

[2–3 lines of context / why this list]

[Engagement]: Save this for your next trip. Which one's going on your list?
[Lead gen]:   Comment "KEYWORD" and I'll DM you the full breakdown
              (resorts, prices, booking windows, and the best time to go).

#allinclusive #[region] #vacationpro #traveltips
```

---

## Open Questions

- **Photo sourcing:** resort press kits, Unsplash, or AI-generated? Current template uses Unsplash placeholders. Need a production decision before first batch.
- **Posting platform:** FB is already on 6x/day Publer cadence. IG cadence not yet defined — do carousels post to IG at the same times, or a different schedule?
- **Volume:** how many carousels per week does Brendan want in the first batch? (Drives the implementation plan scope.)

---

## Next Step

Implementation plan (via `writing-plans` skill) will cover:
1. Photo sourcing + licensing workflow
2. HTML-to-PNG rendering pipeline for the new slide archetypes (rank badge, ManyChat CTA)
3. First batch production (e.g., 5 carousels: 2 ranked + 1 budget + 1 audience + 1 hidden-gem)
4. Publer scheduling for FB + IG
5. ManyChat keyword setup for the lead gen post
