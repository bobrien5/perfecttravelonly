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
