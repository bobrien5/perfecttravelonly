# VacationPro Style Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete VacationPro brand style guide (foundations + 5 channel playbooks + 4 starter templates + site token updates) as specified in [vacationpro/Brand/specs/2026-04-14-style-guide-design.md](vacationpro/Brand/specs/2026-04-14-style-guide-design.md).

**Architecture:** Markdown documentation + HTML templates + targeted CSS/SVG updates. All brand artifacts under `vacationpro/Brand/`. Site token updates touch `vacationpro/src/app/globals.css` and logo SVGs. No new runtime code.

**Tech Stack:** Markdown, HTML5 + inline CSS (email-safe), Next.js/Tailwind v4 tokens (existing), SVG.

**Execution notes:**
- This repo is **not git-tracked**. Replace any "commit" step with a **review checkpoint**: stop, show the user the diff or new file, wait for approval before next task.
- Complete phases in order. Foundations MUST be done before playbooks (playbooks reference them). Templates can be done after foundations in parallel with playbooks.
- After each task, tick the checkbox and ask user to approve before advancing.

---

## Phase 1: Foundations (Tasks 1-7)

### Task 1: Create Brand/ scaffolding and README

**Files:**
- Create: `vacationpro/Brand/README.md`
- Verify dirs exist: `vacationpro/Brand/foundations/`, `vacationpro/Brand/playbooks/`, `vacationpro/Brand/templates/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p vacationpro/Brand/foundations vacationpro/Brand/playbooks vacationpro/Brand/templates
```

- [ ] **Step 2: Write `vacationpro/Brand/README.md`**

Content:

```markdown
# VacationPro Brand Style Guide

**Tagline:** The best package deals, verified weekly.

This directory is the single source of truth for everything VacationPro communicates — social posts, newsletters, emails, lead magnets, and the website. Writers, designers, and AI assistants should read the relevant foundation and playbook before producing any asset.

## Start Here

1. Read every file in `foundations/` once. These apply to all channels.
2. Read the playbook for the channel you're producing for.
3. Copy a template from `templates/` if one exists for your deliverable.

## Structure

- **`foundations/`** — voice, colors, typography, logo. Apply everywhere.
- **`playbooks/`** — channel-specific rules for social, newsletter, email, lead magnets, web.
- **`templates/`** — ready-to-copy starter files (carousel, two newsletter layouts, lead-magnet PDF layout).
- **`specs/`** — design spec this guide was built from.
- **`plans/`** — implementation plan this guide was built from.

## Non-Negotiables

1. **Never hide the catch.** Every piece of content surfaces the downside.
2. **Numbers over adjectives.** "We checked 142 resorts" beats "We checked a lot of resorts."
3. **Inter only.** No other typefaces, ever.
4. **Hero green (#4ac850) is for CTAs, tags, and accents.** Never body text.
5. **No hype language.** No "amazing!", "incredible!", or "!!!". One exclamation per piece, max.

## Last Updated

2026-04-14
```

- [ ] **Step 3: Checkpoint** — confirm directories created and README visible.

---

### Task 2: Write `foundations/01-voice.md`

**Files:**
- Create: `vacationpro/Brand/foundations/01-voice.md`

- [ ] **Step 1: Write the file**

```markdown
# Voice

**Brand personality:** Smart Scout (primary) with Dreamer accents (secondary).

**Audience:** Budget-hunter couples, 30-50 years old, middle-income. They want a nice vacation without overpaying.

## The Core Move

**Open with research credibility. Close with emotional hook.**

- Open example: "We checked 142 resorts this week."
- Close example: "Imagine waking up to that view for $121/night."

Research up front earns the trust. The dreamy close earns the click.

## Do

- **Use specific numbers.** "$487 for 4 nights" beats "a great deal."
- **Short, active sentences.** 6th-grade reading level.
- **First-person plural.** "We checked...", "We found...", "We'd skip this one."
- **Surface the catch.** Every piece of content names the downside. That's what makes us trustworthy.
- **One exclamation per piece, maximum.**

## Don't

- **Hype adjectives.** No "amazing!", "incredible!", "unbelievable!", "insane!"
- **All-caps urgency.** No "ONLY 2 LEFT" unless literally true, and even then write it in sentence case.
- **FOMO manipulation.** No fake scarcity, fake timers, fake "others are viewing."
- **Ad-speak.** No "Click here", "Learn more", "Don't miss out."
- **Generic filler.** No "amazing destination", "beautiful resort", "unforgettable experience."

## Examples

### Weak (don't write this)

> 🔥🔥🔥 AMAZING Cancun deal alert!! You won't believe this incredible price!! Click the link in bio before it's GONE!! 🌴☀️

### Strong (write this)

> $487 got us 4 nights in Cancun this week. Here's what's included, what we'd skip, and who it's actually best for. 📍 Link in bio.

## The Catch Pattern

Every deal writeup includes a "The Catch" section. Format:

> **The Catch:** [One specific thing the reader should know before booking. Could be: airfare isn't included from their city, resort is dated, beach is rocky, transfers cost extra, etc.]

Never skip this section. If the deal has no catch, find one or don't write about it.

## Voice Variations By Channel

- **Social carousels:** punchier, shorter lines, more Dreamer on hook slides.
- **Newsletters:** most editorial, longest form, most Scout.
- **Email sequences:** conversational, more Dreamer in welcome, more Scout in nurture.
- **Lead magnets:** most authoritative, densest research, most Scout.
- **Website microcopy:** shortest, most Scout.

When in doubt, lean Scout.
```

- [ ] **Step 2: Checkpoint** — user reviews voice doc.

---

### Task 3: Write `foundations/02-colors.md`

**Files:**
- Create: `vacationpro/Brand/foundations/02-colors.md`

- [ ] **Step 1: Write the file**

```markdown
# Colors — Warm Beach Palette

All VacationPro communications use this 8-color palette. No substitutions, no "close enough" hex codes.

## Palette

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| **Hero Green** | `#4ac850` | `--color-brand-500` | CTAs, tags, price highlights, logo, eyebrow labels. **Never body text.** |
| **Forest** | `#0f2e1a` | `--color-forest` | Headlines, body text, dark backgrounds. |
| **Cream** | `#fff8ec` | `--color-cream` | Page and card backgrounds (alternative to white). |
| **Amber** | `#f59e0b` | `--color-accent-500` | "Limited" callouts, "VERIFIED" tags, highlight accents. |
| **Coral** | `#ef4444` | `--color-danger` | Urgency only: countdowns, price drops. Use sparingly. |
| **White** | `#ffffff` | `--color-white` | Card backgrounds, text on photos. |
| **Gray 500** | `#6b7280` | `--color-gray-500` | Secondary text, metadata, timestamps. |
| **Gray 200** | `#e5e7eb` | `--color-gray-200` | Borders, dividers, disabled states. |

## Green Scale (for UI states only)

| Shade | Hex | Use |
|-------|-----|-----|
| 50 | `#edfdf4` | Very light fill (hover on cream) |
| 100 | `#d1fae2` | Tag backgrounds |
| 200 | `#a6f4c8` | — |
| 300 | `#6beaa6` | — |
| 400 | `#33d87e` | Hover on #4ac850 |
| **500** | **`#4ac850`** | **Hero Green (primary brand)** |
| 600 | `#009b51` | Pressed state |
| 700 | `#007b41` | Dark-mode green |
| 800 | `#006135` | — |
| 900 | `#00502c` | Very dark accents |

## Usage Rules

### Hero Green (`#4ac850`)
- **Yes:** CTA buttons, price callouts, verified checkmarks, eyebrow labels, accent blocks, logo.
- **No:** Body text, large background fills (except hero carousel slide 1).

### Forest (`#0f2e1a`)
- **Yes:** All body text on cream/white backgrounds. All headlines.
- **No:** Backgrounds (too dark), CTAs.

### Cream (`#fff8ec`)
- **Yes:** Page backgrounds, card backgrounds, lower-third info panels on photos.
- **No:** Text (no contrast).

### Amber (`#f59e0b`)
- **Yes:** "VERIFIED" tags, "LIMITED" pill callouts, star ratings.
- **No:** CTAs (that's green's job), body text.

### Coral (`#ef4444`)
- **Yes:** Countdown timers, "-$412" price drop deltas, urgent alerts.
- **No:** Anything else. Coral is the scarcest color. If you're using it more than once per asset, you're using it wrong.

## Accessibility

All text must hit WCAG AA:
- Body text: 4.5:1 contrast ratio.
- Large text (18pt+ or 14pt bold+): 3:1.

### Passing combinations
- Forest (`#0f2e1a`) on cream/white ✓
- Forest on Hero Green for large text only ✓
- White on Forest ✓
- White on Hero Green for large text only ✓
- Gray 500 (`#6b7280`) on white for body ✓ (barely — avoid below 14px)

### Failing combinations (never use)
- Hero Green on cream/white for body text ✗
- Amber on white ✗
- Coral on cream for body ✗ (large only)

## Gradient Rules

Dark-photo overlays use a forest-to-transparent gradient:

```css
background: linear-gradient(180deg, rgba(15,46,26,0) 0%, rgba(15,46,26,0.75) 100%);
```

No other gradients. No rainbow backgrounds. No brand-green-to-amber fades.
```

- [ ] **Step 2: Checkpoint** — user reviews colors doc.

---

### Task 4: Write `foundations/03-typography.md`

**Files:**
- Create: `vacationpro/Brand/foundations/03-typography.md`

- [ ] **Step 1: Write the file**

```markdown
# Typography — Inter Only

VacationPro uses **Inter** for every character in every asset. No other typefaces. Ever.

Inter is free, available on Google Fonts, and supported everywhere (web, email clients that accept web fonts, print PDFs).

## Weights Used

- **Inter 500** (Medium) — body text
- **Inter 700** (Bold) — section headings, eyebrow labels
- **Inter 800** (ExtraBold) — H1s, major headlines
- **Inter 900** (Black) — display type, prices

Never use Regular (400) or Light (300) — they feel underwhelming at small sizes.

## Type Scale

| Role | Weight | Desktop | Mobile | Tracking | Line-height |
|------|--------|---------|--------|----------|-------------|
| Display | 900 | 48-72px | 32-40px | -0.03em | 1.0 |
| H1 | 800 | 32-40px | 28-32px | -0.02em | 1.15 |
| H2 | 700 | 22-28px | 20-24px | -0.01em | 1.2 |
| H3 | 700 | 18-20px | 16-18px | 0 | 1.3 |
| Body | 500 | 16px | 16px | 0 | 1.5 |
| Small | 500 | 14px | 14px | 0 | 1.5 |
| Eyebrow | 700 | 11px | 11px | 2px (uppercase) | 1 |
| Prices | 900 | 48-120px | 36-64px | -0.03em (tabular) | 1.0 |

## Tabular Figures for Prices

Prices must use tabular (monospace) numerals so columns align:

```css
font-variant-numeric: tabular-nums;
/* or */
font-feature-settings: "tnum";
```

## Eyebrow Label Pattern

Every piece of content has an eyebrow label top-left. Example:

```
DEAL DROP · CANCUN · APR 14
```

CSS:

```css
font-family: Inter;
font-weight: 700;
font-size: 11px;
text-transform: uppercase;
letter-spacing: 2px;
color: #4ac850;
```

## Headline Rules

- **Max 8 words** on H1s.
- **No orphaned words** on display — tune line breaks manually.
- **Never ALL CAPS** on headlines (feels shouty). Eyebrow labels only.
- **Never italic** in Inter — the italic cut feels off-brand. Use weight/size for emphasis.

## Body Rules

- **Line-height 1.5** for all body at 16px.
- **Max 65 characters per line** for long-form (newsletters, guides).
- **Paragraph spacing:** 1em below each `<p>`.
- **Left-align** everything. No justified text, no center-aligned body.

## Common Mistakes

- Inter Regular (400) — use Medium (500) minimum.
- Letter-spacing on body — leave at 0 except for eyebrows and display.
- Mixing Inter with other sans-serifs — they clash.
- Using Inter italic — avoid.
- Shrinking display below 28px on mobile — bump to 32px min.
```

- [ ] **Step 2: Checkpoint** — user reviews typography doc.

---

### Task 5: Write `foundations/04-logo.md`

**Files:**
- Create: `vacationpro/Brand/foundations/04-logo.md`

- [ ] **Step 1: Write the file**

```markdown
# Logo

## The Mark

VacationPro's logo is a **green circle with a paper airplane inside** — located at [vacationpro/public/logo.svg](vacationpro/public/logo.svg).

After the 2026-04-14 color update, the green is `#4ac850`.

## Variations

| File | When to use |
|------|-------------|
| `logo.svg` | Default. Green mark on any light background. |
| `logo-white.svg` | White mark for use on dark backgrounds (forest, photos). |
| `Sophisticated Monogram Logo.svg` | Alternate monogram — use sparingly, for favicons or constrained spaces. |

## Clear Space

Always leave clear space equal to **0.5× the logo diameter** on all sides. No other content inside that zone.

```
┌─────────────────────────┐
│                         │  ← 0.5× clear space
│     ⬤ (logo)           │
│                         │  ← 0.5× clear space
└─────────────────────────┘
    ↑                    ↑
  0.5×                 0.5×
```

## Minimum Sizes

- **Digital:** 32px diameter minimum.
- **Print:** 0.5 inch (12mm) diameter minimum.

Below these sizes, legibility of the paper airplane breaks down.

## Placement Rules

- Top-left or bottom-right, never floating center.
- Never inside a colored pill or box — the circle is the container.
- Always aligned to a grid — don't tuck it at odd angles.

## Don'ts

- **Don't** stretch (always uniform scale).
- **Don't** rotate.
- **Don't** recolor outside the palette. Allowed colors: Hero Green (`#4ac850`), White, Forest (`#0f2e1a`).
- **Don't** add shadows, glows, or outlines.
- **Don't** place on low-contrast backgrounds (e.g., green on amber).
- **Don't** crop the circle.
- **Don't** animate (except a simple fade-in; no spin, no bounce).

## Pairing with Wordmark

When the logo appears alongside "VacationPro" text:
- Wordmark font: **Inter 800**, size-matched to logo height.
- Spacing between mark and wordmark: **0.25× logo diameter**.
- Wordmark color: **Forest** (on light bg) or **White** (on dark bg).
```

- [ ] **Step 2: Checkpoint** — user reviews logo doc.

---

### Task 6: Recolor `logo.svg` from #00bf63 → #4ac850

**Files:**
- Modify: `vacationpro/public/logo.svg`
- Verify: `vacationpro/public/logo-white.svg` (already white, no change needed)
- Modify: `vacationpro/src/app/icon.svg` (check and update if it uses #00bf63)

- [ ] **Step 1: Inspect `icon.svg`**

```bash
grep "00bf63\|00BF63" vacationpro/src/app/icon.svg
```

If matches found, note them. If none, skip Step 3.

- [ ] **Step 2: Replace in `logo.svg`**

Use an editor's replace-all to change `#00bf63` → `#4ac850` in `vacationpro/public/logo.svg`. There should be exactly **2 occurrences** of `fill="#00bf63"` (one per `<path>`).

Verify after:
```bash
grep -c "4ac850" vacationpro/public/logo.svg
```
Expected: 2

```bash
grep "00bf63" vacationpro/public/logo.svg
```
Expected: no output (none remaining).

- [ ] **Step 3: Replace in `icon.svg`** (only if Step 1 found matches)

Same replacement: `#00bf63` → `#4ac850`.

- [ ] **Step 4: Visual checkpoint**

Open `vacationpro/public/logo.svg` in the browser or a preview. Confirm it renders as a brighter green and the paper airplane is still visible.

- [ ] **Step 5: Checkpoint** — user confirms new green looks right.

---

### Task 7: Update `globals.css` tokens

**Files:**
- Modify: `vacationpro/src/app/globals.css`

- [ ] **Step 1: Replace the entire `@theme inline` block**

Open [vacationpro/src/app/globals.css](vacationpro/src/app/globals.css). Replace lines 3-21 (the current `@theme inline { ... }` block plus the body font family line) with:

```css
@theme inline {
  /* Brand Green (Hero Green = 500) */
  --color-brand-50: #edfdf4;
  --color-brand-100: #d1fae2;
  --color-brand-200: #a6f4c8;
  --color-brand-300: #6beaa6;
  --color-brand-400: #33d87e;
  --color-brand-500: #4ac850;
  --color-brand-600: #009b51;
  --color-brand-700: #007b41;
  --color-brand-800: #006135;
  --color-brand-900: #00502c;

  /* Warm Beach supporting colors */
  --color-forest: #0f2e1a;
  --color-cream: #fff8ec;
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;
  --color-danger: #ef4444;
  --color-success: #4ac850;

  /* Typography — Inter only */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;
}
```

Note the changes:
- `--color-brand-500` flipped from `#00bf63` to `#4ac850`.
- Added `--color-forest` and `--color-cream` tokens.
- `--color-success` flipped to `#4ac850`.
- **Removed** `--font-serif` line entirely (no Playfair Display anymore).

- [ ] **Step 2: Remove Playfair-dependent blogs styles**

In the same `globals.css`, find the `.blog-article > p:first-of-type::first-letter` rule (around line 52-62). Remove the `font-family: var(--font-serif);` line inside it so the drop cap uses Inter.

Find/replace:

```css
/* OLD */
.blog-article > p:first-of-type::first-letter,
.blog-article > div > p:first-of-type::first-letter {
  font-family: var(--font-serif);
  float: left;
  font-size: 3.5rem;
  line-height: 0.8;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  font-weight: 700;
  color: #111827;
}
```

Replace with:

```css
/* NEW — Inter drop cap */
.blog-article > p:first-of-type::first-letter,
.blog-article > div > p:first-of-type::first-letter {
  float: left;
  font-size: 4rem;
  line-height: 0.85;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f2e1a;
}
```

Also update the price callout color in the same file (around line 82):

```css
/* OLD */
.blog-article p > strong:only-child {
  ...
  color: #009b51;
  ...
}

/* NEW */
.blog-article p > strong:only-child {
  ...
  color: #4ac850;
  ...
}
```

- [ ] **Step 3: Update `layout.tsx` to remove Playfair import**

Check [vacationpro/src/app/layout.tsx](vacationpro/src/app/layout.tsx) for any `import { Playfair_Display }` or `Playfair` references. If present, remove them and any `<body className={playfair.variable}>` uses.

- [ ] **Step 4: Sweep remaining `#00bf63` references**

Run:

```bash
grep -rn "00bf63\|009b51\|007b41" vacationpro/src/
```

For each match:
- **Charts** (RevenueChart, TrafficChart, GrowthChart, etc.) — replace `#00bf63` with `#4ac850`.
- **Email templates** (`src/lib/email/welcome-sequence.ts`, `api/newsletter/subscribe/route.ts`) — replace `#00bf63` with `#4ac850`. Leave `#009b51` and `#007b41` as-is (those are still valid scale values).
- **EmailStats.tsx** — replace `#00bf63` with `#4ac850`.

After updates, re-run:
```bash
grep -rn "00bf63" vacationpro/src/
```
Expected: no output (none remaining).

- [ ] **Step 5: Dev-server smoke test**

Start the dev server and visit the homepage:

```bash
cd vacationpro && npm run dev
```

Open `http://localhost:3000`. Confirm:
- Green CTAs render as `#4ac850` (brighter than before).
- No broken layouts.
- No console errors about missing fonts.

- [ ] **Step 6: Checkpoint** — user confirms site still works and the new green is visible.

---

## Phase 2: Templates (Tasks 8-11)

### Task 8: Create `templates/carousel.html`

**Files:**
- Create: `vacationpro/Brand/templates/carousel.html`

**Purpose:** A 10-slide carousel template renderable at 1080×1080px. Loads in a browser where each slide can be screenshotted to PNG for Instagram/Facebook. Uses placeholder destination photos (Unsplash) that can be swapped out.

- [ ] **Step 1: Write the template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VacationPro Carousel Template</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #1a1a1a; padding: 40px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1080px); gap: 40px; }
    .slide {
      width: 1080px; height: 1080px;
      position: relative; overflow: hidden;
      color: #fff;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 80px;
    }
    .slide-photo {
      position: absolute; inset: 0;
      background-size: cover; background-position: center;
    }
    .slide-photo::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(15,46,26,0) 0%, rgba(15,46,26,0.75) 100%);
    }
    .slide > * { position: relative; z-index: 1; }
    .eyebrow {
      font-size: 22px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 4px;
      color: #4ac850;
      position: absolute; top: 80px; left: 80px; z-index: 2;
    }
    .brand-footer {
      position: absolute; bottom: 80px; right: 80px;
      display: flex; align-items: center; gap: 16px;
      font-size: 20px; font-weight: 700; z-index: 2;
    }
    .brand-dot {
      width: 40px; height: 40px; border-radius: 50%;
      background: #4ac850;
    }
    h1 { font-size: 96px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; margin-bottom: 32px; }
    h2 { font-size: 64px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 24px; }
    .price { font-size: 160px; font-weight: 900; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; color: #4ac850; line-height: 1; }
    .body { font-size: 28px; font-weight: 500; line-height: 1.5; max-width: 800px; }
    .pill { display: inline-block; padding: 12px 24px; border-radius: 999px; background: #4ac850; color: #fff; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
    .pill-amber { background: #f59e0b; }
    .pill-coral { background: #ef4444; }
    .check-list { font-size: 28px; font-weight: 500; line-height: 1.8; }
    .check-list li { list-style: none; padding-left: 48px; position: relative; }
    .check-list li::before { content: '✓'; position: absolute; left: 0; color: #4ac850; font-weight: 900; }
    .catch-box { background: rgba(15,46,26,0.85); padding: 40px; border-left: 8px solid #f59e0b; }
    .catch-label { font-size: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #f59e0b; margin-bottom: 16px; }
    .comparison { display: flex; gap: 40px; align-items: flex-end; }
    .comparison .col { flex: 1; }
    .comparison .col-label { font-size: 20px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; margin-bottom: 12px; }
    .comparison .col-price { font-size: 96px; font-weight: 900; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1; }
    .strike { text-decoration: line-through; opacity: 0.6; }

    /* Slide 1 alt: solid green hook */
    .slide-green { background: #4ac850; }
    .slide-green .slide-photo { display: none; }
    .slide-green .price { color: #fff; }
    .slide-green .eyebrow { color: #fff8ec; }
  </style>
</head>
<body>
  <div class="grid">

    <!-- Slide 1: HOOK (solid green version) -->
    <div class="slide slide-green">
      <div class="eyebrow">DEAL DROP · CANCUN · APR 14</div>
      <h1>Cancun for<br>$487 flat.</h1>
      <div class="body">4 nights. All meals. Round-trip airfare. Here's what we found.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 2: SETUP -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1600')"></div>
      <div class="eyebrow">THE DEAL</div>
      <h2>Grand Palladium Riviera Maya</h2>
      <div class="body">4 nights all-inclusive. Departures from 18 US cities. Valid through June 15, 2026.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 3: WHY WE CHECKED IT -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1549294413-26f195200c16?w=1600')"></div>
      <div class="eyebrow">WHY IT CAUGHT OUR EYE</div>
      <h2>All-in under $500 is rare for Riviera Maya in April.</h2>
      <div class="body">We checked 23 comparable packages this week. None landed below $620.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 4: WHAT'S INCLUDED -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600')"></div>
      <div class="eyebrow">WHAT'S INCLUDED</div>
      <ul class="check-list">
        <li>Round-trip airfare</li>
        <li>4 nights at Grand Palladium</li>
        <li>All meals and drinks</li>
        <li>Airport transfers</li>
        <li>Resort fees and taxes</li>
      </ul>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 5: VERIFIED PROOF -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600')"></div>
      <div class="eyebrow">VERIFIED · APR 14</div>
      <div class="pill pill-amber">VERIFIED PRICING</div>
      <h2>Checked live on provider site April 14, 2026.</h2>
      <div class="body">Screenshots archived. Price confirmed at checkout for dates shown.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 6: PER NIGHT -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600')"></div>
      <div class="eyebrow">THE MATH</div>
      <div class="price">$121</div>
      <div class="body" style="margin-top: 24px;">Per person, per night. All-inclusive. Airfare included.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 7: COMPARISON -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600')"></div>
      <div class="eyebrow">THIS DEAL VS BOOKING DIRECT</div>
      <div class="comparison">
        <div class="col">
          <div class="col-label">Booking direct</div>
          <div class="col-price strike">$899</div>
        </div>
        <div class="col">
          <div class="col-label">This package</div>
          <div class="col-price" style="color: #4ac850;">$487</div>
        </div>
      </div>
      <div class="body" style="margin-top: 32px;">You save $412 per person.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 8: THE CATCH -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1600')"></div>
      <div class="eyebrow">THE CATCH</div>
      <div class="catch-box">
        <div class="catch-label">What to know</div>
        <h2 style="font-size: 40px; margin-bottom: 16px;">Airfare only from 18 cities.</h2>
        <div class="body">If you're not flying out of those, add $200-300 for positioning flights. Deal still works — just math it first.</div>
      </div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 9: BEST FOR -->
    <div class="slide">
      <div class="slide-photo" style="background-image: url('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600')"></div>
      <div class="eyebrow">BEST FOR</div>
      <h2>Couples who want all-inclusive simplicity on a middle budget.</h2>
      <div class="body">Skip this if you want adults-only or 5-star luxury. Grand Palladium is family-friendly 4-star.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

    <!-- Slide 10: CTA -->
    <div class="slide slide-green">
      <div class="eyebrow">GET THE FULL BREAKDOWN</div>
      <h1>vacationpro.co</h1>
      <div class="body" style="margin-top: 24px;">Every deal we verify. Every catch we find. Monday and Thursday in your inbox.</div>
      <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
    </div>

  </div>
</body>
</html>
```

- [ ] **Step 2: Open in browser and visually verify**

```bash
open vacationpro/Brand/templates/carousel.html
```

Check:
- All 10 slides render 1080×1080.
- Photos load (Unsplash URLs resolve).
- Green is `#4ac850`, not the old green.
- Eyebrow labels are uppercase green.
- Text is legible on every photo (gradient overlay working).

- [ ] **Step 3: Checkpoint** — user confirms carousel looks right.

---

### Task 9: Create `templates/newsletter-boarding-pass.html`

**Files:**
- Create: `vacationpro/Brand/templates/newsletter-boarding-pass.html`

**Purpose:** Monday newsletter template. 600px width, email-client-safe inline CSS, cream background, white cards.

- [ ] **Step 1: Write the template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boarding Pass · [Issue #] · [Date]</title>
</head>
<body style="margin:0;padding:0;background:#fff8ec;font-family:'Inter',Arial,sans-serif;">
  <!-- Preheader (hidden) -->
  <div style="display:none;font-size:1px;color:#fff8ec;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Starting at $487 this week →
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff8ec;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:24px 32px;background:#fff8ec;">
          <table width="100%"><tr>
            <td align="left" style="font-family:Inter,Arial,sans-serif;font-weight:700;color:#0f2e1a;font-size:18px;">
              <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#4ac850;vertical-align:middle;margin-right:8px;"></span>
              VacationPro
            </td>
            <td align="right" style="font-family:Inter,Arial,sans-serif;font-weight:500;color:#6b7280;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
              BOARDING PASS · ISSUE 04 · APR 14
            </td>
          </tr></table>
        </td></tr>

        <!-- Title block -->
        <tr><td style="padding:16px 32px 32px;background:#fff8ec;">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:900;font-size:36px;letter-spacing:-0.03em;color:#0f2e1a;line-height:1.05;">
            7 package deals worth your time this week.
          </div>
        </td></tr>

        <!-- Editor's note -->
        <tr><td style="padding:0 32px 32px;background:#fff8ec;">
          <div style="background:#fff;border-radius:12px;padding:24px;font-family:Inter,Arial,sans-serif;color:#0f2e1a;font-size:16px;line-height:1.5;font-weight:500;">
            <p style="margin:0 0 12px;">We checked 142 package offers across Cancun, Punta Cana, Jamaica, and the Dominican Republic this week.</p>
            <p style="margin:0 0 12px;">Seven cleared our bar: real inclusions, verified pricing, and no dark-pattern small print.</p>
            <p style="margin:0;">The lowest price we confirmed: <strong style="color:#4ac850;">$487 for 4 nights</strong>. Full list below.</p>
            <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">— The VacationPro Team</p>
          </div>
        </td></tr>

        <!-- Section: Top 5 Deals -->
        <tr><td style="padding:0 32px 16px;background:#fff8ec;">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;">TOP 5 DEALS · THIS WEEK</div>
        </td></tr>

        <!-- Deal card (repeat 5x) -->
        <tr><td style="padding:0 32px 16px;background:#fff8ec;">
          <div style="background:#fff;border-radius:12px;overflow:hidden;">
            <div style="height:200px;background:#e5e7eb url('https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1200') center/cover no-repeat;"></div>
            <div style="padding:20px 24px;font-family:Inter,Arial,sans-serif;">
              <div style="font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;margin-bottom:8px;">DEAL #1 · CANCUN</div>
              <div style="font-weight:800;font-size:22px;color:#0f2e1a;letter-spacing:-0.01em;margin-bottom:4px;">Grand Palladium · 4 nights</div>
              <div style="font-weight:900;font-size:28px;color:#4ac850;letter-spacing:-0.02em;margin-bottom:12px;font-variant-numeric:tabular-nums;">$487</div>
              <div style="font-weight:500;font-size:14px;color:#0f2e1a;line-height:1.5;margin-bottom:16px;">All-inclusive, round-trip airfare from 18 cities. Worth it if you want simplicity on a middle budget.</div>
              <a href="https://vacationpro.co/deals/cancun-grand-palladium" style="display:inline-block;background:#4ac850;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:6px;">See the catch →</a>
            </div>
          </div>
        </td></tr>

        <!-- [Repeat the above deal card block 4 more times for deals #2-5, swapping destination, price, photo, and URL] -->

        <!-- Section: Watch List -->
        <tr><td style="padding:24px 32px 16px;background:#fff8ec;">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f59e0b;">THE WATCH LIST · NOT YET</div>
        </td></tr>

        <tr><td style="padding:0 32px 24px;background:#fff8ec;">
          <div style="background:#fff;border-radius:12px;padding:20px 24px;font-family:Inter,Arial,sans-serif;color:#0f2e1a;font-size:15px;line-height:1.5;">
            <p style="margin:0 0 8px;"><strong>Punta Cana — Bahia Principe, $523.</strong> Pricing volatile; we're watching for a clean 4-night drop.</p>
            <p style="margin:0 0 8px;"><strong>Jamaica — RIU Montego Bay, $612.</strong> Needs better flight inclusions before we'd flag it.</p>
            <p style="margin:0;"><strong>Aruba — Barceló, $744.</strong> Good resort, price hasn't broken our $700 line.</p>
          </div>
        </td></tr>

        <!-- Footer CTA -->
        <tr><td style="padding:24px 32px 48px;background:#fff8ec;" align="center">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:500;font-size:14px;color:#6b7280;line-height:1.5;">
            The best package deals, verified weekly.<br>
            <a href="https://vacationpro.co" style="color:#4ac850;text-decoration:none;font-weight:700;">vacationpro.co</a> ·
            <a href="%UNSUBSCRIBE%" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

- [ ] **Step 2: Test render**

Open `vacationpro/Brand/templates/newsletter-boarding-pass.html` in browser. Verify:
- Renders at 600px centered on cream.
- Green CTAs are `#4ac850`.
- All Inter fallbacks to Arial work (email clients block Google Fonts).

- [ ] **Step 3: Plain-text version**

Also create `vacationpro/Brand/templates/newsletter-boarding-pass.txt`:

```
VacationPro · Boarding Pass · Issue 04 · Apr 14
===============================================

7 package deals worth your time this week.

We checked 142 package offers across Cancun, Punta Cana, Jamaica, and
the Dominican Republic this week.

Seven cleared our bar: real inclusions, verified pricing, and no
dark-pattern small print.

The lowest price we confirmed: $487 for 4 nights. Full list below.

— The VacationPro Team


TOP 5 DEALS · THIS WEEK
-----------------------

1. CANCUN — Grand Palladium · 4 nights · $487
   All-inclusive, round-trip airfare from 18 cities.
   https://vacationpro.co/deals/cancun-grand-palladium

[... deals 2-5 in same format ...]


THE WATCH LIST · NOT YET
------------------------
- Punta Cana, Bahia Principe, $523 — watching for a clean 4-night drop
- Jamaica, RIU Montego Bay, $612 — needs better flight inclusions
- Aruba, Barceló, $744 — price hasn't broken our $700 line


--
The best package deals, verified weekly.
vacationpro.co
Unsubscribe: %UNSUBSCRIBE_URL%
```

- [ ] **Step 4: Checkpoint** — user reviews both files.

---

### Task 10: Create `templates/newsletter-deal-alert.html`

**Files:**
- Create: `vacationpro/Brand/templates/newsletter-deal-alert.html`
- Create: `vacationpro/Brand/templates/newsletter-deal-alert.txt`

**Purpose:** Thursday deep-dive template. Single-deal focus with verdict box, included/not table, catch, price breakdown, final take.

- [ ] **Step 1: Write the HTML template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deal Alert · [Date]</title>
</head>
<body style="margin:0;padding:0;background:#fff8ec;font-family:'Inter',Arial,sans-serif;">
  <div style="display:none;font-size:1px;color:#fff8ec;">Yes, but skip the flights.</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff8ec;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:24px 32px;">
          <table width="100%"><tr>
            <td align="left" style="font-family:Inter,Arial,sans-serif;font-weight:700;color:#0f2e1a;font-size:18px;">
              <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#4ac850;vertical-align:middle;margin-right:8px;"></span>
              VacationPro
            </td>
            <td align="right" style="font-family:Inter,Arial,sans-serif;font-weight:500;color:#6b7280;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
              DEAL ALERT · APR 17
            </td>
          </tr></table>
        </td></tr>

        <!-- Hero photo -->
        <tr><td style="padding:0;">
          <div style="height:280px;background:#e5e7eb url('https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600') center/cover no-repeat;"></div>
        </td></tr>

        <!-- Title + verdict -->
        <tr><td style="padding:24px 32px;">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;margin-bottom:8px;">DEAL ALERT · CANCUN · GRAND PALLADIUM</div>
          <div style="font-family:Inter,Arial,sans-serif;font-weight:900;font-size:32px;letter-spacing:-0.03em;color:#0f2e1a;line-height:1.1;">Is the $487 Grand Palladium deal worth it?</div>
        </td></tr>

        <!-- Verdict box -->
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#4ac850;border-radius:12px;padding:24px;font-family:Inter,Arial,sans-serif;color:#fff;">
            <div style="font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;margin-bottom:8px;">OUR VERDICT</div>
            <div style="font-weight:800;font-size:24px;line-height:1.2;">Yes — but skip the flights.</div>
          </div>
        </td></tr>

        <!-- What we checked -->
        <tr><td style="padding:0 32px 24px;">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;margin-bottom:12px;">WHAT WE CHECKED</div>
          <ul style="font-family:Inter,Arial,sans-serif;font-size:15px;color:#0f2e1a;line-height:1.6;padding-left:24px;margin:0;">
            <li>Live pricing on 3 booking sites on April 17</li>
            <li>Guest reviews from the last 90 days</li>
            <li>Included inclusions vs. advertised inclusions</li>
            <li>Historical price range for this week</li>
          </ul>
        </td></tr>

        <!-- Included / Not Included table -->
        <tr><td style="padding:0 32px 24px;">
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="width:50%;padding:16px;background:#fff;border:1px solid #e5e7eb;vertical-align:top;font-family:Inter,Arial,sans-serif;">
                <div style="font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;margin-bottom:12px;">✓ INCLUDED</div>
                <ul style="font-size:14px;color:#0f2e1a;line-height:1.6;padding-left:20px;margin:0;">
                  <li>All meals + drinks</li>
                  <li>Resort fees</li>
                  <li>Airport transfers</li>
                  <li>Taxes</li>
                </ul>
              </td>
              <td style="width:50%;padding:16px;background:#fff;border:1px solid #e5e7eb;border-left:none;vertical-align:top;font-family:Inter,Arial,sans-serif;">
                <div style="font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ef4444;margin-bottom:12px;">✗ NOT INCLUDED</div>
                <ul style="font-size:14px;color:#0f2e1a;line-height:1.6;padding-left:20px;margin:0;">
                  <li>Spa services</li>
                  <li>Premium liquors</li>
                  <li>Excursions</li>
                  <li>Gratuities</li>
                </ul>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- The Catch -->
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#0f2e1a;border-left:6px solid #f59e0b;border-radius:8px;padding:24px;font-family:Inter,Arial,sans-serif;color:#fff;">
            <div style="font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f59e0b;margin-bottom:8px;">THE CATCH</div>
            <div style="font-weight:800;font-size:20px;line-height:1.2;margin-bottom:12px;">Airfare only from 18 cities.</div>
            <div style="font-size:15px;line-height:1.5;opacity:0.9;">If you're not flying out of those, you'll pay $200-300 extra for positioning flights. Book flights separately and you land at $520 — still a win, but not the headline number.</div>
          </div>
        </td></tr>

        <!-- Price breakdown -->
        <tr><td style="padding:0 32px 24px;">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;margin-bottom:12px;">PRICE BREAKDOWN</div>
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:15px;color:#0f2e1a;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">This package</td><td align="right" style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-weight:700;color:#4ac850;">$487</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">Booking direct</td><td align="right" style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-decoration:line-through;color:#6b7280;">$899</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">You save</td><td align="right" style="padding:8px 0;font-weight:900;color:#ef4444;">$412</td></tr>
          </table>
        </td></tr>

        <!-- Our Take -->
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#fff;border-radius:12px;padding:24px;font-family:Inter,Arial,sans-serif;color:#0f2e1a;font-size:16px;line-height:1.6;">
            <div style="font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4ac850;margin-bottom:12px;">OUR TAKE</div>
            <p style="margin:0 0 12px;">If you live in a flight-covered city, this is the strongest Cancun package we've seen in April. $121/night all-in is the low end for Riviera Maya in peak-shoulder.</p>
            <p style="margin:0;">If you live anywhere else, add $250 for flights and decide: still the best deal we're seeing, or a push vs. booking separately? Usually the former.</p>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 32px 40px;" align="center">
          <a href="https://vacationpro.co/deals/cancun-grand-palladium" style="display:inline-block;background:#4ac850;color:#fff;text-decoration:none;font-family:Inter,Arial,sans-serif;font-weight:700;font-size:16px;padding:16px 32px;border-radius:8px;">Book this deal →</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:0 32px 48px;" align="center">
          <div style="font-family:Inter,Arial,sans-serif;font-weight:500;font-size:14px;color:#6b7280;line-height:1.5;">
            The best package deals, verified weekly.<br>
            <a href="https://vacationpro.co" style="color:#4ac850;text-decoration:none;font-weight:700;">vacationpro.co</a> ·
            <a href="%UNSUBSCRIBE%" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

- [ ] **Step 2: Write the plain-text version**

`vacationpro/Brand/templates/newsletter-deal-alert.txt`:

```
VacationPro · Deal Alert · Apr 17
==================================

Is the $487 Grand Palladium Cancun deal worth it?

OUR VERDICT: Yes — but skip the flights.


WHAT WE CHECKED
---------------
- Live pricing on 3 booking sites on April 17
- Guest reviews from the last 90 days
- Included inclusions vs. advertised inclusions
- Historical price range for this week


INCLUDED                        NOT INCLUDED
--------                        ------------
- All meals + drinks            - Spa services
- Resort fees                   - Premium liquors
- Airport transfers             - Excursions
- Taxes                         - Gratuities


THE CATCH: Airfare only from 18 cities.
If you're not flying out of those, you'll pay $200-300 extra for
positioning flights. Book flights separately and you land at $520 —
still a win, but not the headline number.


PRICE BREAKDOWN
---------------
This package:      $487
Booking direct:    $899
You save:          $412


OUR TAKE
--------
If you live in a flight-covered city, this is the strongest Cancun
package we've seen in April. $121/night all-in is the low end for
Riviera Maya in peak-shoulder.

If you live anywhere else, add $250 for flights and decide: still the
best deal we're seeing, or a push vs. booking separately? Usually the
former.

Book this deal: https://vacationpro.co/deals/cancun-grand-palladium


--
The best package deals, verified weekly.
vacationpro.co
Unsubscribe: %UNSUBSCRIBE_URL%
```

- [ ] **Step 3: Render check**

Open `newsletter-deal-alert.html` in browser. Verify 600px rendering, verdict box green, catch box dark-with-amber-stripe, price breakdown alignment.

- [ ] **Step 4: Checkpoint** — user reviews.

---

### Task 11: Create `templates/lead-magnet.html`

**Files:**
- Create: `vacationpro/Brand/templates/lead-magnet.html`

**Purpose:** PDF-ready guide layout. 8.5×11 portrait, printable. Includes cover page + interior page + closing CTA page as three sample pages.

- [ ] **Step 1: Write the template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VacationPro Lead Magnet Template</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: letter portrait; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #1a1a1a; padding: 20px; }
    .page {
      width: 8.5in; height: 11in;
      background: #fff8ec;
      page-break-after: always;
      position: relative; overflow: hidden;
      margin: 0 auto 20px;
    }
    .page-footer {
      position: absolute; bottom: 0.5in; left: 1in; right: 1in;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 10px; color: #6b7280; font-weight: 500;
      border-top: 1px solid #e5e7eb; padding-top: 8px;
    }
    .page-footer .dot { width: 16px; height: 16px; border-radius: 50%; background: #4ac850; display: inline-block; vertical-align: middle; margin-right: 6px; }
    .content { padding: 1in; }

    /* COVER PAGE */
    .cover {
      background-image: linear-gradient(180deg, rgba(15,46,26,0.2) 0%, rgba(15,46,26,0.9) 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600');
      background-size: cover; background-position: center;
      color: #fff;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 1in;
    }
    .cover-top { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #4ac850; }
    .cover-title { font-size: 56px; font-weight: 900; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 16px; }
    .cover-subtitle { font-size: 20px; font-weight: 500; line-height: 1.4; opacity: 0.9; max-width: 5in; }
    .cover-bottom { display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; }
    .cover-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; }
    .cover-brand .dot { width: 20px; height: 20px; border-radius: 50%; background: #4ac850; }

    /* INTERIOR */
    h1 { font-size: 36px; font-weight: 900; letter-spacing: -0.03em; color: #0f2e1a; line-height: 1.1; margin-bottom: 24px; }
    h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; color: #0f2e1a; line-height: 1.3; margin: 28px 0 12px; }
    p { font-size: 11pt; color: #0f2e1a; line-height: 1.55; font-weight: 500; margin-bottom: 12px; }
    .eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #4ac850; margin-bottom: 12px; }
    .pull-quote {
      border-left: 4px solid #4ac850; background: #fff; padding: 20px 24px; margin: 24px 0;
      font-size: 16px; font-weight: 700; color: #0f2e1a; line-height: 1.4;
    }
    .catch-callout {
      background: #0f2e1a; color: #fff;
      border-left: 6px solid #f59e0b;
      padding: 20px 24px; border-radius: 6px; margin: 24px 0;
    }
    .catch-callout .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-bottom: 8px; }
    .catch-callout p { color: #fff; font-size: 13px; margin: 0; }

    /* CLOSING CTA */
    .closing {
      background: #4ac850; color: #fff;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      padding: 1in; text-align: center;
    }
    .closing h1 { color: #fff; font-size: 48px; margin-bottom: 16px; }
    .closing p { color: #fff; font-size: 18px; max-width: 4.5in; margin: 0 auto 32px; }
    .closing .button {
      display: inline-block; background: #fff; color: #0f2e1a;
      padding: 16px 32px; border-radius: 8px; font-weight: 800; font-size: 18px;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page cover">
    <div class="cover-top">VACATIONPRO GUIDE</div>
    <div>
      <div class="cover-title">The 2026<br>All-Inclusive<br>Deal Calendar</div>
      <div class="cover-subtitle">When to book, where to look, and the exact weeks we've seen the lowest prices for every major all-inclusive destination.</div>
    </div>
    <div class="cover-bottom">
      <div class="cover-brand"><div class="dot"></div>By the VacationPro Team</div>
      <div>vacationpro.co</div>
    </div>
  </div>

  <!-- PAGE 2: INTERIOR SAMPLE -->
  <div class="page">
    <div class="content">
      <div class="eyebrow">CHAPTER 1 · THE CANCUN SHOULDER</div>
      <h1>When Cancun package deals actually drop.</h1>
      <p>We tracked 312 Cancun all-inclusive package deals across 18 providers from January 2024 through April 2026. Two weeks of the year consistently show the lowest prices.</p>

      <h2>The first window: April 20 – May 5</h2>
      <p>Easter and spring break are over. Summer family bookings haven't ramped. Hotels that ran high occupancy through March are hungry for late April. Package prices drop 28% on average vs. the March peak.</p>

      <div class="pull-quote">The median 4-night all-inclusive package in late April: $512. Same package in March: $710.</div>

      <h2>The second window: September 5 – 25</h2>
      <p>Late hurricane season. Fewer travelers. Resorts discount aggressively. The caveat is weather risk — this is when the deals are real but so is the chance of a rained-out week.</p>

      <div class="catch-callout">
        <div class="label">THE CATCH</div>
        <p>Hurricane insurance is not optional in September. Budget $40-80 for travel insurance with weather coverage, or book refundable rates. Both eat into the deal — math it into your number before you book.</p>
      </div>

      <h2>Weeks to avoid</h2>
      <p>Thanksgiving week, December 20 – January 3, and Presidents' Day week. Package prices run 35-60% above annual median. Even our "good deals" that week are just regular prices on the other 49 weeks.</p>
    </div>

    <div class="page-footer">
      <div><span class="dot"></span>VacationPro</div>
      <div>The best package deals, verified weekly. · Page 5</div>
    </div>
  </div>

  <!-- PAGE 3: CLOSING CTA -->
  <div class="page closing">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px;opacity:0.85;">READY FOR MORE?</div>
    <h1>Get Boarding Pass every Monday.</h1>
    <p>The deals we verify. The catches we find. Delivered at 7am ET each Monday and Thursday.</p>
    <a href="https://vacationpro.co/boarding-pass" class="button">Subscribe free →</a>
  </div>

</body>
</html>
```

- [ ] **Step 2: Print-to-PDF check**

Open the template in Chrome. Use `Print → Save as PDF → letter portrait, margins: none`. Verify:
- Each of the 3 pages breaks cleanly (no content split across pages).
- Cover photo fills the page.
- Interior looks readable at real print size.
- Closing CTA is on its own page.

- [ ] **Step 3: Checkpoint** — user reviews PDF output.

---

## Phase 3: Playbooks (Tasks 12-16)

Each playbook synthesizes the relevant spec section plus cross-references foundations. Each step writes one complete file.

### Task 12: Write `playbooks/social.md`

**Files:**
- Create: `vacationpro/Brand/playbooks/social.md`

- [ ] **Step 1: Write the file**

```markdown
# Social Playbook — Carousels + Video Captions

**Voice:** Smart Scout with Dreamer hooks. See [foundations/01-voice.md](../foundations/01-voice.md).
**Template:** [templates/carousel.html](../templates/carousel.html).

## Channels

- **Facebook** — 6 posts/day (8am, 11am, 2pm, 5pm, 8pm, 11pm ET).
- **Instagram** — feed carousels, Reels.
- **TikTok** (future) — vertical video with the caption style below.

## Carousel Structure (10 Slides)

Every carousel follows this order. Swap content; never swap the order.

| # | Slide | Purpose |
|---|-------|---------|
| 1 | **Hook** | Stop the scroll. Big number, destination name, single statement. |
| 2 | **Setup** | What the deal is (resort, duration). |
| 3 | **Why we checked it** | Smart Scout framing — what made it interesting. |
| 4 | **What's included** | Checklist format. |
| 5 | **Verified proof** | Screenshot-style claim with "VERIFIED" amber tag. |
| 6 | **Per night / unit price** | Big number break-down. |
| 7 | **Comparison** | This deal vs. booking direct. |
| 8 | **The Catch** | Non-hidden downside. Amber-striped dark callout box. |
| 9 | **Best for** | Who should book this. |
| 10 | **CTA** | "vacationpro.co" + logo. |

## Visual Rules

- **Size:** 1080×1080 (square) for IG/FB carousel. Export as PNG per slide.
- **Background:** Slides 2-10 use destination photography full-bleed with forest-to-transparent gradient overlay. Slide 1 can use solid Hero Green OR an overlaid photo.
- **Text color:** White, Inter 900 for display, Inter 700 for eyebrow, Inter 500 for body.
- **Text shadow:** Subtle (`text-shadow: 0 2px 4px rgba(0,0,0,0.3)`) for legibility.
- **Green (#4ac850):** Pills, tags, eyebrow labels, price callouts, accent blocks. Never full backgrounds on slides 2-10.
- **Cream (#fff8ec):** Lower-third info panels when needed.
- **Photos:** Real resort/destination shots only. No stock clichés (no "woman in hat walking away on beach"). Smart Scout credibility.
- **Eyebrow label top-left every slide:** `DEAL DROP · [DESTINATION] · [DATE]`.
- **Prices:** 80-120px, Inter 900, tabular-nums. Let them breathe.
- **Max 15 words on text-heavy slides.**

## Video Captions (Reels, Shorts, TikTok)

- **Style:** One word at a time, centered bottom-third.
- **Font:** Inter 900.
- **Color:** White or Hero Green.
- **Stroke:** 4-6px black, for legibility on any background.
- **No punctuation.** No emojis in captions.
- **Timing:** Hold each word for its actual spoken duration.
- **Why:** 80% of viewers watch muted. Captions carry the meaning.

## Post Copy (Caption Under Social Post)

Structure:

```
Line 1: Hook (≤10 words)
Line 2: Price + destination
Lines 3-5: What's included, bulleted with ✓
Last line: CTA
```

Example:

```
Cancun for $487 flat.

4 nights all-inclusive. Riviera Maya.

✓ All meals and drinks
✓ Round-trip flights from 18 cities
✓ Airport transfers included

The catch: only 18 flight cities. Full breakdown + math → link in bio.
```

### Emoji Rules

- **1-2 per caption, max. Functional only.** Allowed: 📍 ✈️ ✅ 💰.
- **Never decorative.** No 🌴🔥💸 strings.
- **Never in hooks or headlines.**

## Hook Library

Use these templates. Swap the destination, price, and specifics. Rotate — don't use the same hook twice in 30 days.

1. "$X got us [N nights] in [destination]."
2. "We checked [N] resorts. This one won."
3. "Normal price: $X. This week: $Y."
4. "The catch with this [destination] deal ↓"
5. "$X/night for [destination]. Here's what's included."
6. "Is this [destination] deal worth it? We went to find out."
7. "[Destination] for less than [common thing that costs the same]."
8. "The best [destination] package we've seen this year."
9. "Skip [expensive brand]. This [destination] deal is [X]% cheaper."
10. "5 things to check before booking any [destination] all-inclusive."
11. "Our verdict on the [Resort Name] deal: [one word]."
12. "[Destination] under $X. Yes, really. Here's the math."
13. "We almost missed this [destination] deal."
14. "What $X actually gets you in [destination]."
15. "The one [destination] deal we're telling everyone about."
16. "This [destination] resort has [specific feature] for $X/night."
17. "Red flags we looked for in this [destination] package."
18. "[N] package deals we verified this week. [X] are worth it."
19. "[Destination] deals the booking sites are burying."
20. "Everything included in this $X [destination] trip."

## CTA Library

- "Link in bio for the full breakdown."
- "Comment DEAL and I'll send you the link."
- "Save this for your next trip."
- "DM me 'CANCUN' for the link."
- "Every Monday: the week's verified deals. Link in bio."

## Workflow

1. Pick a deal from the site (must be a real, verified package).
2. Choose a hook from the library.
3. Fill the 10-slide structure in [carousel.html](../templates/carousel.html).
4. Write caption using the 5-line structure above.
5. Schedule via Publer (see [memory: Publer MCP server](../../.claude/memory/reference_publer_mcp.md)).
```

- [ ] **Step 2: Checkpoint** — user reviews social playbook.

---

### Task 13: Write `playbooks/newsletter.md`

**Files:**
- Create: `vacationpro/Brand/playbooks/newsletter.md`

- [ ] **Step 1: Write the file**

```markdown
# Newsletter Playbook — Boarding Pass & Deal Alert

**Voice:** Smart Scout dominant; most editorial of all channels. See [foundations/01-voice.md](../foundations/01-voice.md).
**Templates:** [newsletter-boarding-pass.html](../templates/newsletter-boarding-pass.html), [newsletter-deal-alert.html](../templates/newsletter-deal-alert.html).

## Cadence

| Day | Name | Purpose |
|-----|------|---------|
| **Monday 7:00 AM ET** | **Boarding Pass** | Full recap of the week's verified deals. |
| **Thursday 7:00 AM ET** | **Deal Alert** | Single-deal deep dive OR destination alert. |

## Boarding Pass (Monday)

### Subject Line Formula

`[N] package deals worth your time this week`

Examples:
- "7 package deals worth your time this week"
- "5 package deals worth your time — starting at $487"
- "Only 3 deals cleared our bar this week"

**Rules:** 40 char max. Number in first 5 words.

### Preview Text Formula

Lowest price of the week, framed as a continuation.

Examples:
- "Starting at $487 →"
- "Lowest we found: $487 for 4 nights →"
- "Cheapest: Cancun at $121/night →"

### Structure

1. **Header** — logo + date + issue number. Cream background.
2. **Title** — big Inter 900 H1 stating the count ("7 package deals worth your time this week").
3. **Editor's note** (80-120 words) — white card. Opens with research number ("We checked 142 package offers this week"). Signed "— The VacationPro Team."
4. **Top 5 Deals** — one white card per deal. Each card:
   - Destination photo (16:9, 200px tall).
   - Eyebrow: `DEAL #N · [DESTINATION]`.
   - Deal name: Inter 800, 22px.
   - Price in Hero Green: Inter 900, 28px.
   - 2-line summary with voice ("Worth it if...", "Skip if...").
   - Green CTA button: "See the catch →" linking to deal page.
5. **The Watch List** — 2-3 deals we're tracking but aren't ready to recommend. One white card, 3 short paragraphs. Amber eyebrow: `THE WATCH LIST · NOT YET`.
6. **Footer** — tagline, site link, unsubscribe.

### What "Watch List" Means

Watch List is where we put deals that aren't bad, just not yet our recommendation. Reasons to watch-list: pricing volatility, missing verification, expected to drop, suspicious inclusions. The watch list teaches readers that our recommendations are earned, not automatic.

## Deal Alert (Thursday)

### Subject Line Formula

`Is the [Resort Name] deal worth it?`

Examples:
- "Is the Grand Palladium deal worth it?"
- "Is the $487 Cancun package worth it?"
- "Is the RIU Jamaica deal worth the flight price?"

### Preview Text Formula

The verdict in 5 words.

Examples:
- "Yes, but skip the flights."
- "Only if you live east."
- "Pass — inclusions are thin."
- "Yes. Unconditionally. Book it."

### Structure

1. **Header** — same as Boarding Pass.
2. **Hero photo** — full-width destination shot, 280px tall.
3. **Title** — Inter 900, 32px, H1 framed as a question.
4. **Verdict box** — Hero Green background, white text. Short, direct verdict (≤8 words).
5. **What we checked** — bulleted list, 4 items max.
6. **Included / Not Included** — two-column table. Green check column, coral X column.
7. **The Catch** — dark forest box with amber left border. Non-negotiable section — every alert has one.
8. **Price breakdown** — this deal vs. booking direct. "You save" row in coral for contrast.
9. **Our take** — white card, 2 short paragraphs, ~120 words.
10. **CTA** — "Book this deal →" green button.
11. **Footer** — tagline, unsubscribe.

### Variation: Destination Alert

Same structure, but the "deal" is a destination instead of a specific package. Verdict might be "Worth watching — prices usually drop in May." Used when we see broad softening in a destination before any single package stands out.

## Design Rules (Both)

- **Width:** 600px max, mobile-responsive via table-based layout.
- **Background:** Cream (#fff8ec) page, white (#ffffff) cards.
- **Font stack:** `'Inter', Arial, sans-serif` (many email clients block Google Fonts — Arial fallback is mandatory).
- **CTA buttons:** Hero Green fill only. One primary CTA per section max.
- **Plain-text fallback:** Required for every email. Must match structure.
- **Display type cap:** 36px max (email client rendering).
- **Max width on images:** 600px — scale down for mobile.

## Voice Rules

- **Editor's note:** first person plural ("We checked...").
- **Verdicts:** direct ("Skip it." "Book it." "Worth it if you drive.").
- **Price callouts:** always specific — "$487" not "under $500".
- **No all-caps subject lines.** Not even for urgency.
- **One exclamation per newsletter, max.**

## Workflow

1. Pull this week's verified deals from the site / ops pipeline.
2. Pick the top 5 (Boarding Pass) OR the single deal for deep dive (Deal Alert).
3. Open the appropriate template.
4. Write editor's note / verdict first — gets voice dialed in before filling details.
5. Fill deal cards / deep-dive sections.
6. Write plain-text version (mandatory).
7. Send test to yourself + Jordan. Read on mobile.
8. Schedule.
```

- [ ] **Step 2: Checkpoint** — user reviews.

---

### Task 14: Write `playbooks/email.md`

**Files:**
- Create: `vacationpro/Brand/playbooks/email.md`

- [ ] **Step 1: Write the file**

```markdown
# Email Marketing Playbook

Email marketing covers **promotional + transactional sequences** — separate from the twice-weekly newsletter cadence (see [playbooks/newsletter.md](newsletter.md) for that).

**Voice:** Smart Scout foundation, warmer for welcome, cooler for nurture. See [foundations/01-voice.md](../foundations/01-voice.md).

## Sequences

### 1. Welcome Series (5 emails / 10 days)

Triggered on newsletter signup.

| # | Day | Subject | Purpose |
|---|-----|---------|---------|
| 1 | Day 0 | `Welcome to VacationPro. Here's how we work.` | Orient: what we do, what we don't, when to expect emails. |
| 2 | Day 2 | `The 3 things we check on every deal` | Build trust in the methodology. |
| 3 | Day 4 | `A deal we almost passed on` | Show the standard via a case study. |
| 4 | Day 7 | `What kind of traveler are you?` | Ask 1-3 segmentation questions. |
| 5 | Day 10 | `How are we doing? (honest feedback welcome)` | Ask for feedback. First relationship close. |

**Voice:** Warm, orienting. More first-person ("I" allowed in signature). More Dreamer than other sequences.

### 2. Promotional Drops (one-offs)

Triggered manually for flash sales, last-minute inventory, or pricing windows outside the Monday/Thursday cadence.

**Subject formula:** `[Price] · [Destination] · Expires [Day]`
Example: `$399 · Punta Cana · Expires Sunday`

**Voice:** Direct, time-bound. "Expires Sunday. Here's why we flagged it. Here's the catch." Never "ACT NOW" or "DON'T MISS OUT."

**Structure:** Same as Deal Alert (single deal), but shorter — drop the Watch List and skip the 120-word take in favor of a 50-word take.

### 3. Re-engagement (3 emails / 2 weeks)

Triggered after 30 days with no opens.

| # | Day | Subject | Purpose |
|---|-----|---------|---------|
| 1 | Day 0 | `Still interested? No hard feelings either way.` | Low-pressure reset. |
| 2 | Day 7 | `One deal we think you'd actually want` | Try to win back with specific content. |
| 3 | Day 14 | `Last one — we'll stop emailing after this` | Sunset. Graceful exit. |

**Voice:** Humble, no guilt. "No hard feelings either way." If they don't re-engage after email 3, auto-unsubscribe them.

### 4. Lead Magnet Follow-up (4 emails / 7 days)

Triggered after someone downloads a guide from the site.

| # | Day | Subject | Purpose |
|---|-----|---------|---------|
| 1 | Day 0 | `Your [Guide Name] is inside` | Deliver the guide. Set expectations. |
| 2 | Day 2 | `The companion piece to yesterday's guide` | Extend the content with a specific deal or case study tied to the guide topic. |
| 3 | Day 4 | `What readers asked us last time` | Address top 2-3 questions we get on this topic. |
| 4 | Day 7 | `Put it into practice — this week's best [topic] deal` | Tie guide content to a live deal. CTA to site. |

**Voice:** Helpful, sequential. Each email assumes they read the last one.

### 5. WOW Vacations Lead Nurture

Specific to the VacationPro → WOW Vacations timeshare lead flow ($250/qualified lead when they attend a webinar).

| # | Day | Subject | Purpose |
|---|-----|---------|---------|
| 1 | Day 0 | `About timeshares — the myths vs. the math` | Educational. Frame the value prop honestly. |
| 2 | Day 3 | `Who timeshares actually work for` | Self-selection — help them qualify themselves. |
| 3 | Day 6 | `The webinar — here's what to expect` | Pre-webinar expectation setting (no surprise sales). |
| 4 | Day 7 | `Reminder: webinar tomorrow at [time]` | Nudge. |
| 5 | Day 8 | `Live in 1 hour` | Last nudge. |
| 6 | Day 9 | `Thanks for joining — what's next` | Post-webinar. Non-pushy next steps. |

**Voice:** Educational about timeshares, never pressured. The Smart Scout move is telling them honestly when timeshares *don't* work for their situation. Builds long-term trust even if they don't convert now.

## Subject Line Rules (All Sequences)

- **40 characters max** (mobile inbox preview).
- **Number or price in first 5 words** when possible.
- **No clickbait** — violates Smart Scout voice.
- **No "Re:" or "Fwd:" tricks.**
- **Preview text is a second subject line** — always write it deliberately.

## Template Rules

- Same 600px width, cream page, white cards as newsletters.
- Single primary CTA button per email (Hero Green).
- Plain-text fallback mandatory.
- Signature block every email:

```
— The VacationPro Team
vacationpro.co · [social icons]
Unsubscribe · Update preferences
```

## Workflow

1. Pick the sequence.
2. Draft subjects + preview text for all emails in the sequence at once (keeps voice consistent).
3. Write email 1, then iterate.
4. Get Jordan's review on welcome series and WOW nurture before shipping.
5. QA in Litmus or Email on Acid before launch.
6. Set suppression rules (e.g., paused during Monday/Thursday newsletter send windows).
```

- [ ] **Step 2: Checkpoint** — user reviews.

---

### Task 15: Write `playbooks/lead-magnets.md`

**Files:**
- Create: `vacationpro/Brand/playbooks/lead-magnets.md`

- [ ] **Step 1: Write the file**

```markdown
# Lead Magnets Playbook

**Voice:** Most authoritative of all channels. Densest research. Strongest Smart Scout. See [foundations/01-voice.md](../foundations/01-voice.md).
**Template:** [templates/lead-magnet.html](../templates/lead-magnet.html).

## Formats in Scope

| Format | Page count | Example title |
|--------|-----------|---------------|
| **PDF Guides** | 10-20 pages | "The 2026 All-Inclusive Deal Calendar" |
| **Checklists** | 1-2 pages | "12 Questions to Ask Before Booking Any All-Inclusive" |
| **Swipe Files / Cheat Sheets** | 2-4 pages | "Exact Prices We've Seen for 47 Top Resorts" |

## Cover Design Rules (All Formats)

- **Background:** Full-bleed destination photo with forest-to-transparent gradient overlay.
- **Eyebrow:** "VACATIONPRO GUIDE" — Inter 700, 14px, 3px tracking, Hero Green, uppercase.
- **Title:** Inter 900, white, 48-56px, left-aligned, max 3 lines.
- **Subtitle:** Inter 500, white at 90% opacity, 18-22px, max 2 lines.
- **Bottom-left:** Logo (green dot) + "By the VacationPro Team" (Inter 700, 12px, white).
- **Bottom-right:** "vacationpro.co" (Inter 500, 12px, white).

## PDF Guide (10-20 pages)

### Layout

- **Size:** 8.5×11 letter, portrait.
- **Margins:** 1 inch all sides.
- **Page background:** Cream (#fff8ec).
- **Body text:** Forest (#0f2e1a), Inter 500, 11pt, line-height 1.55.
- **H1 (chapter):** Inter 900, 36px.
- **H2 (section):** Inter 700, 22px, with 28px top margin.
- **Chapter eyebrow:** "CHAPTER N · [TOPIC]" — green, 11px, 2px tracking.

### Mandatory Page Elements

- **Footer on every page (except cover):** Logo dot + tagline + page number. 10px Inter 500, gray-500. Top-bordered with gray-200.
- **Pull quotes:** Inter 700, 16px, forest color, left border = 4px Hero Green, white background. 1-2 per chapter.
- **"The Catch" callout ending every major section:** Forest background, 6px amber left border, white text. This is non-negotiable — every section surfaces a catch.

### Structure

1. **Cover** (page 1).
2. **Intro** (pages 2-3) — why this guide exists, how we compiled it, who it's for. Always mentions research scope ("We analyzed 312 deals over 24 months").
3. **Table of contents** (page 4).
4. **Chapters** (pages 5-18) — 3-5 chapters, each with 2-4 pages.
5. **Appendix** (page 19) — references, data sources.
6. **Closing CTA** (page 20) — Hero Green background, "Get Boarding Pass every Monday." Full-page.

## Checklist (1-2 pages)

### Layout

- **Orientation:** Portrait or landscape, depending on item count.
- **Page background:** Cream or white.
- **Checkboxes:** 20×20px, 2px green outline. When checked: green fill, white checkmark.
- **Items:** Inter 500, 14px, forest color. Max 12 words per item.
- **Section dividers:** 1px Hero Green line, 24px top/bottom margin.

### Structure

1. **Header** — title (Inter 900, 32px), subtitle (Inter 500, 14px), eyebrow ("VACATIONPRO CHECKLIST").
2. **Sections** — 3-5 sections, 3-8 items each.
3. **Footer** — "Print. Check. Book with confidence." + logo + vacationpro.co.

## Swipe File / Cheat Sheet (2-4 pages)

### Layout

- **Orientation:** Landscape preferred (tables read better).
- **Page background:** Cream.
- **Table rows:** Alternating cream and white (zebra striping).
- **Table headers:** Hero Green background, white text, Inter 700, 12px, uppercase.
- **Body cells:** Forest text, Inter 500, 11pt.
- **Best-value callouts:** Amber highlight on a row OR an amber dot in the first column.
- **Always dated:** "Data checked: [Month Day, Year]" in footer. Re-check quarterly.

### Structure

1. **Header** — title + date range covered + "Data checked: [date]".
2. **Data table** — densely packed, sortable-feeling columns.
3. **Legend** — what the amber callouts mean, what the columns mean.
4. **Footer** — last-updated date, methodology note, CTA.

## CTA Rules (All Formats)

- **Exactly 2 CTAs per lead magnet.**
  - **CTA 1 — soft** in first 3 pages: sidebar or inline mention of "Get Boarding Pass every Monday".
  - **CTA 2 — strong** on final page: full-page, Hero Green background, big headline, single button.
- **CTA copy:** "Get Boarding Pass every Monday →" linking to `vacationpro.co/boarding-pass`.
- **Never** use generic "Subscribe" or "Join our list".

## Voice Rules

- **Lead with data.** Every chapter opens with a research claim ("We tracked X over Y period").
- **Honest about limitations.** If the data doesn't cover a region, say so. If we didn't check something, say so.
- **No travel clichés.** Never "paradise", "oasis", "breathtaking", "hidden gem".
- **Show the catch.** Every major claim includes a caveat. Credibility through honesty.

## Production Workflow

1. Pick a topic tied to active deal flow or seasonal question.
2. Outline chapters (PDF) or sections (checklist/swipe).
3. Pull data from ops (deal history, pricing DB).
4. Write copy in markdown first, voice-check against [foundations/01-voice.md](../foundations/01-voice.md).
5. Lay out in [templates/lead-magnet.html](../templates/lead-magnet.html).
6. Print-to-PDF for distribution.
7. Set up lead-magnet follow-up sequence (see [playbooks/email.md](email.md) §4).
```

- [ ] **Step 2: Checkpoint** — user reviews.

---

### Task 16: Write `playbooks/web.md`

**Files:**
- Create: `vacationpro/Brand/playbooks/web.md`

- [ ] **Step 1: Write the file**

```markdown
# Website UX/UI Playbook

**Voice:** Shortest, most Scout. See [foundations/01-voice.md](../foundations/01-voice.md).
**Site:** [vacationpro/src/app/](../../src/app/) (Next.js + Tailwind v4).
**Tokens:** [globals.css](../../src/app/globals.css) (updated per this plan's Task 7).

## UX Principles

1. **Deal-first.** Every page shows a real deal or leads to one within one scroll.
2. **Show the catch.** Every deal page has a non-hidden "The Catch" section.
3. **Verified markers.** Green check badges on verified pricing, date-stamped ("Checked Apr 14").
4. **No dark patterns.** No fake countdowns. No "only 2 left" unless literally true. No pre-checked opt-ins.
5. **Specific microcopy.** "See the catch →" not "Learn more". "Get Monday's Boarding Pass" not "Subscribe".

## Component Rules

### Buttons

- **Primary:** Hero Green fill, white text, 6px radius, Inter 700, 14-16px, 12px vertical / 20-24px horizontal padding.
- **Secondary:** Cream fill, forest text, 1px forest border.
- **Tertiary (inline):** Hero Green text, underline on hover, no fill.
- **Only one primary CTA per section.** Enforce this — if it feels like two are needed, one must downgrade to secondary.

### Cards

- White background.
- 1px Gray-200 border (#e5e7eb).
- 12px border radius.
- 16-24px padding.
- No shadow by default. Light shadow (`0 1px 3px rgba(0,0,0,0.05)`) only on hover.

### Deal Card

- **Top:** destination photo, 16:9, rounded top corners only.
- **Body:**
  - Eyebrow: `DEAL · [DESTINATION]` in Hero Green.
  - Deal name: Inter 800, 20-22px.
  - Price: Hero Green, Inter 900, 28px, tabular-nums.
  - 2-line summary.
- **Bottom:** "The Catch →" link bottom-right (Hero Green, Inter 700).

### Forms

- Labels above inputs (never placeholder-as-label).
- Input height: 48px.
- Green focus ring (2px, Hero Green).
- Error state: coral border + coral helper text.
- Required fields marked with `*` in amber.

### Navigation

- Sticky header.
- Logo left.
- 3-4 nav items max.
- Signup CTA right (primary button).
- Mobile: hamburger at 768px and below.

## Page Templates

Document these templates. Each should have a spec page in Sanity (or a layout file in the repo) so pages stay consistent.

1. **Homepage** — hero with latest deal drop, 5 deal cards below, newsletter CTA, destination guides section.
2. **Deal listing** — filter bar (destination, price range, dates), grid of deal cards.
3. **Single deal** — hero photo, verdict box, included/not, "The Catch", price breakdown, our take, CTA.
4. **Destination guide** — hero photo + destination overview, current deals in that destination, season chart, FAQs.
5. **Blog post** — long-form editorial layout, drop cap first paragraph, pull quotes, related deals.
6. **Lead-magnet landing** — guide cover image + 3 bullet benefits + email capture form.
7. **Signup / confirmation** — minimal, focus on next-step expectations.

## Copy Patterns

- **H1s:** Inter 800, 40-56px desktop / 28-32px mobile. Max 8 words.
- **Section labels (eyebrows):** Hero Green, Inter 700, 11px, 2px tracking, uppercase.
- **Microcopy — always specific:**
  - "See the catch" not "Learn more"
  - "Get Monday's Boarding Pass" not "Subscribe"
  - "Book this deal" not "Click here"
  - "Show me more deals" not "View all"
- **Never:** "Click here", "Learn more", "Read more" (always replace with the actual next thing).

## Responsive Rules

- **Mobile-first.** Design at 375px before scaling up.
- **Display type caps at 32px on mobile** (down from 48-72 on desktop).
- **Stack everything at under 768px.** No 2-column layouts on mobile.
- **Touch targets:** min 44×44px.
- **Test breakpoints:** 375, 768, 1024, 1440.

## Accessibility

- WCAG AA compliance required (see [foundations/02-colors.md](../foundations/02-colors.md) for color pairs that pass).
- Focus states visible on every interactive element.
- Alt text on every image (not "deal photo" — describe the destination specifically).
- Semantic HTML — `<article>`, `<section>`, `<nav>`, proper heading hierarchy.
- Skip-to-content link in header.

## Workflow for New Pages

1. Wireframe at 375px (mobile) first.
2. Confirm it uses existing components (don't invent new ones).
3. Write copy in markdown, voice-check against foundations.
4. Build in Next.js using Tailwind tokens (not raw hex — tokens only).
5. Test at 375 / 768 / 1440.
6. Run Lighthouse — must hit 90+ for accessibility.
7. Deploy to preview branch on Vercel.
```

- [ ] **Step 2: Checkpoint** — user reviews.

---

## Phase 4: Final Review (Task 17)

### Task 17: Cross-reference and final pass

**Files:**
- Review: all files created in Tasks 1-16.

- [ ] **Step 1: Verify cross-references**

Every playbook should reference foundations. Run:

```bash
grep -l "foundations/01-voice" vacationpro/Brand/playbooks/*.md
```

Expected: all 5 playbook files listed.

- [ ] **Step 2: Verify templates exist**

```bash
ls vacationpro/Brand/templates/
```

Expected:
```
carousel.html
lead-magnet.html
newsletter-boarding-pass.html
newsletter-boarding-pass.txt
newsletter-deal-alert.html
newsletter-deal-alert.txt
```

- [ ] **Step 3: Verify no lingering old green**

```bash
grep -rn "00bf63" vacationpro/src/ vacationpro/public/ vacationpro/Brand/
```

Expected: no output (all replaced).

- [ ] **Step 4: Smoke-test the site**

```bash
cd vacationpro && npm run dev
```

Open `http://localhost:3000`. Verify:
- New green renders.
- No Playfair Display references in browser devtools.
- Pages still render without errors.

- [ ] **Step 5: Final walk-through with user**

Show user the full tree:

```bash
find vacationpro/Brand -type f | sort
```

Expected output (minimum):
```
vacationpro/Brand/README.md
vacationpro/Brand/foundations/01-voice.md
vacationpro/Brand/foundations/02-colors.md
vacationpro/Brand/foundations/03-typography.md
vacationpro/Brand/foundations/04-logo.md
vacationpro/Brand/plans/2026-04-14-style-guide-plan.md
vacationpro/Brand/playbooks/email.md
vacationpro/Brand/playbooks/lead-magnets.md
vacationpro/Brand/playbooks/newsletter.md
vacationpro/Brand/playbooks/social.md
vacationpro/Brand/playbooks/web.md
vacationpro/Brand/specs/2026-04-14-style-guide-design.md
vacationpro/Brand/templates/carousel.html
vacationpro/Brand/templates/lead-magnet.html
vacationpro/Brand/templates/newsletter-boarding-pass.html
vacationpro/Brand/templates/newsletter-boarding-pass.txt
vacationpro/Brand/templates/newsletter-deal-alert.html
vacationpro/Brand/templates/newsletter-deal-alert.txt
```

- [ ] **Step 6: Final checkpoint** — user sign-off on complete style guide.
