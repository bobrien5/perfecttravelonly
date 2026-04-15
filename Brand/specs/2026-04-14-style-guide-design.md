# VacationPro Style Guide — Design Spec

**Date:** 2026-04-14
**Owner:** Brendan O'Brien (with Jordan)
**Scope:** Brand foundations + 5 channel playbooks (social, newsletter, email, lead magnets, web) + starter templates.

---

## 1. Goal

Create a complete brand style guide for VacationPro that governs every asset the brand produces: social posts (carousels + video captions), newsletters (2x/week), email sequences, lead magnets (PDF/checklists/swipe files), and the vacationpro.co website.

The style guide is both a reference (markdown docs) and a starter template library (HTML files that can be copied).

---

## 2. Brand Positioning

**Target customer:** Budget-hunter couples, 30-50yo, middle-income. "We want a nice vacation but don't want to overpay."

**Brand personality:** Smart Scout with Dreamer accents.
- **Smart Scout (primary):** Trustworthy, practical, research-driven. "We do the research so you don't have to."
- **Dreamer (secondary):** Aspirational, escapist moments — used for emotional hooks, never for core claims.

**Tagline:** "The best package deals, verified weekly."

---

## 3. Architecture

All files live in `vacationpro/Brand/`:

```
vacationpro/Brand/
├── README.md                    ← entry point, links to everything
├── foundations/
│   ├── 01-voice.md
│   ├── 02-colors.md
│   ├── 03-typography.md
│   └── 04-logo.md
├── playbooks/
│   ├── social.md
│   ├── newsletter.md
│   ├── email.md
│   ├── lead-magnets.md
│   └── web.md
└── templates/
    ├── carousel.html
    ├── newsletter-boarding-pass.html
    ├── newsletter-deal-alert.html
    └── lead-magnet.html
```

---

## 4. Foundations

### 4.1 Voice

**Core rule:** Open with research credibility, close with emotional hook.
- Example open: "We checked 142 resorts this week."
- Example close: "Imagine waking up to that view for $121/night."

**Do:**
- Specific numbers and verified claims
- Short, active sentences
- 6th-grade reading level
- First-person plural ("We checked...")

**Don't:**
- Hype adjectives ("amazing!", "incredible!")
- Exclamation overuse (max one per piece)
- FOMO manipulation ("ONLY 2 LEFT!!!")
- Ad-speak or marketing jargon
- "Click here", "Learn more"

**Signature Smart Scout move:** Every piece of content surfaces the catch. We never hide the downside — that's what makes our recommendations trustworthy.

### 4.2 Colors (Warm Beach Palette)

| Token | Hex | Usage |
|-------|-----|-------|
| Hero Green | `#4ac850` | CTAs, tags, accents, logo, price highlights. **Never body text.** |
| Forest | `#0f2e1a` | Headlines, body text, dark UI. |
| Cream | `#fff8ec` | Page backgrounds, card backgrounds (alternative to white). |
| Amber | `#f59e0b` | "Limited" callouts, "VERIFIED" tags, accents. |
| Coral | `#ef4444` | Urgency only (countdowns, price drops). Used sparingly. |
| White | `#ffffff` | Card backgrounds, text on photos. |
| Gray 500 | `#6b7280` | Secondary text, meta info. |
| Gray 200 | `#e5e7eb` | Borders, dividers. |

**Accessibility:** All text on cream/white must hit WCAG AA (4.5:1 for body, 3:1 for large). Forest passes. Gray 500 passes for body at 14px+.

### 4.3 Typography (Inter Only)

| Role | Weight | Size (desktop) | Size (mobile) | Tracking |
|------|--------|----------------|---------------|----------|
| Display | 900 | 48-72px | 32-40px | -0.03em |
| H1 | 800 | 32-40px | 28-32px | -0.02em |
| H2 | 700 | 22-28px | 20-24px | -0.01em |
| H3 | 700 | 18-20px | 16-18px | 0 |
| Body | 500 | 16px | 16px | 0 |
| Small | 500 | 14px | 14px | 0 |
| Eyebrow | 700 | 11px | 11px | 2px, uppercase, green |
| Prices | 900 | 48-120px | 36-64px | -0.03em, tabular-nums |

**Line height:** Display = 1.0, headings = 1.15, body = 1.5.

### 4.4 Logo

- Use existing [logo.svg](vacationpro/public/logo.svg) with color swapped from `#00bf63` → `#4ac850`.
- Also update [logo-white.svg](vacationpro/public/logo-white.svg) and [Sophisticated Monogram Logo.svg](vacationpro/public/Sophisticated%20Monogram%20Logo.svg) if they reference the old green.
- **Clear space:** 0.5× logo diameter on all sides.
- **Minimum size:** 32px digital, 0.5" print.
- **Don't:** stretch, rotate, recolor outside brand palette, place on low-contrast backgrounds, add effects/shadows.

---

## 5. Playbook: Social (Carousels + Video Captions)

### 5.1 Carousels (10 slides max)

**Structure:**
1. **Hook** — big number, solid green background OR destination photo with green overlay, single statement ("$487 got us 4 nights in Cancun.").
2. **Setup (slide 2)** — what the deal is.
3. **Why we checked it (slide 3)** — Smart Scout framing.
4. **Proof 1 (slide 4)** — what's included.
5. **Proof 2 (slide 5)** — verified screenshot/photo.
6. **Proof 3 (slide 6)** — numbers (per-night, vs. normal).
7. **Comparison (slide 7)** — this deal vs. booking direct.
8. **The Catch (slide 8)** — what to know before booking. Non-negotiable.
9. **For whom (slide 9)** — "Best for couples who want X."
10. **CTA (slide 10)** — "Full breakdown on VacationPro.co" + logo.

**Visual rules:**
- Slides 2-10: destination photography as full-bleed background with dark gradient overlay for text legibility.
- Slide 1 (hook): solid green OR dark-overlaid destination photo. Must stop the scroll.
- Text is white, Inter 900, with subtle text shadow for legibility.
- Green (#4ac850) used for tags, eyebrow labels, price callouts, accent blocks — not full backgrounds (except slide 1).
- Cream (#fff8ec) reserved for lower-third info panels when needed.
- Photos must be real resort/destination shots — never generic stock.
- One idea per slide. Max 15 words on text-heavy slides.
- Eyebrow label top-left every slide: "DEAL DROP · CANCUN · APR 14".
- Prices dominate: 80-120px, tabular figures.

### 5.2 Video Captions (Reels/Shorts)

- One word at a time, centered bottom third.
- Inter 900, white or hero green, with 4-6px black stroke for legibility.
- No punctuation, no emojis in captions.
- Hold each word for its actual spoken duration.
- 80% of viewers watch muted — captions carry the meaning.

### 5.3 Post Copy (Caption Under Social Post)

**Structure:**
- Line 1: Hook (≤10 words)
- Line 2: Price + destination
- Lines 3-5: What's included, bulleted with ✓
- Last line: CTA ("Link in bio", "Comment DEAL for link")

**Emoji rules:** 1-2 max per caption, functional only. Allowed: 📍 ✈️ ✅ 💰. Never decorative.

### 5.4 Hook Library (20 Reusable Templates)

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

---

## 6. Playbook: Newsletter

### 6.1 Cadence

- **Monday — "Boarding Pass"** — full weekly deal recap.
- **Thursday — "Deal Alert"** — destination + deal alerts, single-deal deep dive or flash alert.

### 6.2 Boarding Pass (Monday)

**Subject line formula:** "[N] package deals worth your time this week"
**Preview text:** Lowest price of the week ("Starting at $487 →")

**Structure:**
1. Header — logo + date + issue number, cream background
2. Editor's note (80-120 words) — what we checked, what stood out. Signed "— The VacationPro Team."
3. **Top 5 Deals** — card per deal: destination photo, eyebrow label, price in green, 2-line summary, "See the catch →" link
4. **The Watch List** — 2-3 deals we're tracking but aren't ready to recommend
5. Footer — tagline, unsubscribe, social links

### 6.3 Deal Alert (Thursday)

**Subject line formula:** "Is the [Resort Name] deal worth it?"
**Preview text:** Answer in 5 words ("Yes, but skip the flights.")

**Structure:**
1. Hero photo — full-width destination shot
2. **The verdict box** — green card, 1-sentence answer up top
3. What we checked — bulleted list
4. What's included / not included — two-column table
5. **The Catch** — what to know (non-negotiable section)
6. Price breakdown — this deal vs. booking direct
7. Our take (~120 words) — recommend / pass / conditional
8. CTA button to book

### 6.4 Design Rules (Both)

- 600px max width, mobile-responsive
- Cream (#fff8ec) page background, white content cards
- Green CTA buttons only, one primary CTA per section max
- Inter throughout, display sizes capped at 28px (email rendering constraints)
- Plain-text fallback mandatory

### 6.5 Voice Rules

- Editor's note = first person plural
- Verdicts = direct ("Skip it." "Book it." "Worth it if you drive.")
- No hype language, no all-caps subject lines

---

## 7. Playbook: Email Marketing

Covers promotional and transactional sequences separate from the newsletter cadence.

### 7.1 Sequences to Document

1. **Welcome series** (5 emails / 10 days) — intro → how we vet deals → first exclusive → profile prompt → feedback ask
2. **Promotional drops** — one-off flash sale / last-minute alerts outside Mon/Thu cadence
3. **Re-engagement** (3 emails / 2 weeks) — triggered after 30 days no-open
4. **Lead-magnet follow-up** (4 emails / 7 days) — triggered after guide download
5. **WOW Vacations lead nurture** — educational about timeshares, drives webinar attendance ($250/qualified lead)

### 7.2 Subject Line Rules

- 40 characters max (mobile inbox preview)
- Number or price in first 5 words when possible
- No clickbait — violates Smart Scout voice
- Preview text is a second subject line — always written deliberately

### 7.3 Template Rules

- Same 600px width, cream background, white card structure as newsletters
- Single primary CTA button per email (green #4ac850)
- Plain-text fallback mandatory
- Signature block: "— The VacationPro Team" + social icons

### 7.4 Voice Per Sequence

- **Welcome:** warm, orienting ("Here's how we work.")
- **Promotional:** direct, time-bound ("Expires Sunday. Here's why we flagged it.")
- **Re-engagement:** humble, no guilt ("Still interested? No hard feelings either way.")
- **Lead-magnet follow-up:** helpful, sequential ("Yesterday you downloaded X. Here's the companion piece.")
- **WOW nurture:** educational, never pressured

---

## 8. Playbook: Lead Magnets

### 8.1 Formats (in scope)

- **A. PDF guides** (10-20 pages) — e.g., "The 2026 All-Inclusive Deal Calendar"
- **B. Checklists** (1-2 pages) — e.g., "12 Questions to Ask Before Booking Any All-Inclusive"
- **C. Swipe files / cheat sheets** — e.g., "Exact Prices We've Seen for 47 Top Resorts"

### 8.2 Cover Design Rules (All Formats)

- Full-bleed destination photo with dark gradient
- Eyebrow label: "VACATIONPRO GUIDE" in green, uppercase, 2px tracking
- Title: Inter 900, white, 48-64px, left-aligned
- Subtitle: Inter 500, white 80%, 18-22px
- Bottom-left: logo + "By The VacationPro Team"
- Bottom-right: "vacationpro.co"

### 8.3 PDF Guide Interior Rules

- 8.5×11 portrait, 1" margins
- Cream (#fff8ec) page background
- Forest (#0f2e1a) body text, 11pt Inter 500, line-height 1.55
- Green pull quotes and callout boxes
- Every page has a footer: page # · tagline · logo
- Every major section ends with a **"The Catch"** callout — signature Smart Scout credibility move

### 8.4 Checklist Rules

- Single page, portrait or landscape
- Checkboxes: green outline, fills green when checked (for digital/interactive)
- One-line items, max 12 words each
- Section dividers: thin green line

### 8.5 Swipe File / Cheat Sheet Rules

- 2-4 pages, landscape preferred
- Tabular data with zebra striping (alternate cream / white rows)
- Green column headers, forest body, amber for "best" callouts
- Always dated ("Data checked: April 14, 2026")

### 8.6 CTA Rules

- Exactly 2 CTAs per lead magnet: one in first 3 pages (soft), one on final page (strong)
- Final page = full-page CTA: "Get Boarding Pass every Monday" → newsletter signup

---

## 9. Playbook: Website UX/UI

### 9.1 Global Updates Needed

- Replace `#00bf63` → `#4ac850` throughout [globals.css](vacationpro/src/app/globals.css)
- Add Warm Beach palette tokens (forest, cream, amber, coral)
- Remove Playfair Display — simplify to Inter only
- Update all logo file references to recolored versions

### 9.2 UX Principles

1. **Deal-first** — every page within 1 scroll shows a real deal or links to one
2. **Show the catch** — every deal page has a non-hidden "The Catch" section
3. **Verified markers** — green check badges on verified pricing, date-stamped ("Checked Apr 14")
4. **No dark patterns** — no fake countdowns, no "only 2 left" unless literally true

### 9.3 Component Rules

- **Buttons:** green fill, white text, 6px radius, Inter 700, 14-16px. Only one primary CTA per section.
- **Cards:** white bg, 1px gray-200 border, 12px radius, 16-24px padding.
- **Deal card:** destination photo top (16:9), price in green bottom-left (Inter 900, 28px), "The Catch →" link bottom-right.
- **Forms:** stacked labels above inputs, 48px input height, green focus ring.
- **Navigation:** sticky header, logo left, 3-4 nav items max, signup CTA right.

### 9.4 Copy Patterns

- H1s = Inter 800, 40-56px, max 8 words
- Section labels = eyebrow style (green, uppercase, 2px tracking)
- Microcopy always specific: "See the catch" not "Learn more"; "Get Monday's Boarding Pass" not "Subscribe"
- Never "Click here"

### 9.5 Page Templates to Document

- Homepage
- Deal listing
- Single deal
- Destination guide
- Blog post
- Lead-magnet landing
- Signup / confirmation

### 9.6 Responsive Rules

- Mobile-first — test every design at 375px before scaling up
- Display type caps at 32px on mobile (down from 48-72 on desktop)
- Stack everything on mobile — no 2-column layouts under 768px

---

## 10. Deliverables Checklist

When implementation is complete, these artifacts must exist:

**Docs:**
- [ ] `vacationpro/Brand/README.md`
- [ ] `vacationpro/Brand/foundations/01-voice.md`
- [ ] `vacationpro/Brand/foundations/02-colors.md`
- [ ] `vacationpro/Brand/foundations/03-typography.md`
- [ ] `vacationpro/Brand/foundations/04-logo.md`
- [ ] `vacationpro/Brand/playbooks/social.md`
- [ ] `vacationpro/Brand/playbooks/newsletter.md`
- [ ] `vacationpro/Brand/playbooks/email.md`
- [ ] `vacationpro/Brand/playbooks/lead-magnets.md`
- [ ] `vacationpro/Brand/playbooks/web.md`

**Templates:**
- [ ] `vacationpro/Brand/templates/carousel.html` — 10-slide template, downloadable as PNGs
- [ ] `vacationpro/Brand/templates/newsletter-boarding-pass.html` — Monday template
- [ ] `vacationpro/Brand/templates/newsletter-deal-alert.html` — Thursday template
- [ ] `vacationpro/Brand/templates/lead-magnet.html` — PDF-ready guide layout

**Site updates:**
- [ ] `#00bf63` → `#4ac850` in [globals.css](vacationpro/src/app/globals.css)
- [ ] Warm Beach palette tokens added
- [ ] Playfair Display removed
- [ ] Logo files recolored

---

## 11. Out of Scope

- New logo design (keeping existing with color swap)
- Full design system build (no Figma library, no Storybook)
- Rebuilding existing site pages (global tokens only; individual page redesigns handled separately)
- VacationPro mobile app (doesn't exist)
- Paid ad creative (can be derived from social templates later)
- Print collateral beyond PDF lead magnets
