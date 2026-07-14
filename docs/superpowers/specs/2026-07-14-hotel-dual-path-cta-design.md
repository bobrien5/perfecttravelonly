# VacationPro: Dual-Path Hotel CTAs — Design

Date: 2026-07-14
Status: Approved (pending spec review)
Branch: to be created off `main`

## Goal

Serve both travel-buyer types at the moment they pick a hotel in a guide:

- **Path A, the self-serve researcher.** Wants to book their own OTA. Give every hotel a
  "Check current rates on Expedia" button. Stay22 LMA auto-monetizes it. Affiliate revenue.
- **Path B, the group / exclusive-deal buyer.** Wants a rate or perk they cannot get on
  Expedia, or is booking a group. Route them to Brendan, who books it as a travel advisor
  through his host-agency portal. Advisor commission.

Today Path A is only partly wired (44 hotel sections have no button at all) and Path B's
existing CTA sells the wrong thing (a free itinerary, not the agent advantage).

## Decisions (locked)

- **Placement:** affiliate button under EVERY hotel; the concierge CTA appears ONCE per post
  (the existing end-of-post block), not under each hotel. Keeps the affiliate button the
  visual hero and avoids a salesy, repeated concierge pitch.
- **Backfill sourcing:** research each hotel's exact Expedia hotel page. Self-check that the
  hotel name appears in the URL slug. Exact pages convert better than search pages.
- **Scope:** fix all 44 gaps in one pass (all 21 affected posts), not just the big roundups.
- **Path B claim (Brendan confirmed he can back this):** agent-only pricing, resort credits,
  and group perks.

## Current state (measured 2026-07-14)

- 65 published guides, 105 hotel-looking H2 sections, 98 Expedia affiliate buttons.
- **44 hotel sections across 21 posts have NO button.** Worst offenders are the highest-intent
  roundups: `best-family-all-inclusive-resorts` (8 hotels, 1 button),
  `best-luxury-all-inclusive-resorts` (7/1), `kid-friendly-all-inclusive-resorts` (6/1),
  `best-couples-all-inclusive-resorts` (5/1), `cheapest-all-inclusive-resorts` (4/1).
- Rendering already works: the `marks.link` serializer in
  `src/app/(site)/blog/[slug]/page.tsx` renders any `expedia.com` (or legacy `prf.hn`) link as
  a green `bg-brand-600` button with `rel="sponsored noopener noreferrer"` and `target=_blank`.
  Verified live on production.
- Stay22 LMA rewrites those raw `expedia.com` hrefs to monetized Stay22 links at runtime.
  Verified on production (6/6 links monetized on the Punta Cana guide, 0 left raw).

## Architecture

### Path A: backfill the 44 missing hotel buttons (content migration, no new component)

No React component is needed. A hotel button IS a PortableText link whose href is a raw
`expedia.com` URL. So this is a Sanity content migration that reuses the existing serializer.

**1. Identify.** `scripts/audit-hotel-ctas.mjs`: for every published `blogPost`, walk the body;
for each `h2` section, determine (a) whether the heading names a hotel and (b) whether that
section already contains a link whose href matches `expedia.com`. Emit the list of hotel
sections with no button. This is the same query that produced the 44/21 numbers above and is
the gate for "done" (must reach 0).

Hotel-heading detection is a heuristic, so the script writes its candidate list to a JSON file
for human/agent review rather than acting on it blindly. False positives (a non-hotel H2
matched) must be droppable; false negatives (a hotel we missed) are caught by the same review.

**2. Research the URL.** For each hotel section needing a button, find that hotel's exact
Expedia page:
`https://www.expedia.com/<Area>-Hotels-<Hotel-Name>.h<NUMBER>.Hotel-Information`.
Do NOT guess the `h` number. Self-check: the hotel name from the H2 must be recognizably
present in the URL slug (Expedia slugs contain the property name). If a hotel genuinely has no
Expedia page, record it as `SKIP` with a reason rather than inventing a link. Expedia
rate-limits automated fetches (429), so URL correctness rests on the research + slug check, not
on fetching the page.

**3. Review before writing.** Emit all proposed `(post, hotel, url)` rows as a table. Nothing is
written to Sanity until the table is reviewed and the run is invoked with `--write`.

**4. Insert.** `scripts/add-hotel-ctas.mjs` (dry-run default, `--write` to apply): for each
approved row, insert ONE new block immediately after the last content block of that hotel's H2
section (i.e. immediately before the next heading, or at the end of the body if it is the last
section). The block matches the shape the existing 98 CTAs already use:

```js
{
  _type: 'block', _key: <unique>, style: 'normal',
  markDefs: [{ _type: 'link', _key: <linkKey>, href: <raw expedia url>, blank: true }],
  children: [{ _type: 'span', _key: <unique>, text: `Check current rates for ${hotel} on Expedia`, marks: ['strong', <linkKey>] }],
}
```

Keys must be unique within the document. The write must be a single `patch().set({body})` per
post so a post is never left half-updated.

### Path B: reframe the end-of-post concierge block

`src/app/(site)/blog/[slug]/page.tsx` already renders a concierge block after every post
(currently: "Planning a trip? Tell me where you want to go and I will put together a verified
itinerary and pricing for you, free of charge." → "Plan With Me"). It sells planning, not the
agent advantage, so the group/exclusive buyer has no reason to click.

Replace the copy (structure/styling unchanged) with the agent pitch:

- Heading: `Booking a group, or want a rate you will not find on Expedia?`
- Body: `I book as a travel advisor with access to agent-only pricing, resort credits, and group perks. Tell me your dates and I will price it against whatever you just saw.`
- Button: `Get my agent rate` → `/concierge-planning` (unchanged destination)

No em dashes or en dashes.

## Verification

- `scripts/audit-hotel-ctas.mjs` reports **0** hotel sections without a button.
- Total Expedia buttons rises from 98 to ~142 (98 + 44, minus any legitimate SKIPs).
- Spot-check on production, in a real browser, that newly added buttons render as green
  `rel="sponsored"` buttons AND that Stay22 rewrites their href (monetized count > 0, raw
  Expedia count = 0) on at least `best-family-all-inclusive-resorts` and
  `best-luxury-all-inclusive-resorts`.
- Post bodies still render correctly (no broken/duplicated blocks) on the touched posts.
- `npx tsc --noEmit` exits 0.
- No em/en dashes introduced.

## Risks

- **Wrong hotel link is worse than no link** (sends the reader to a different property and
  burns trust). Mitigations: exact-page research, hotel-name-in-slug self-check, mandatory
  review table before `--write`, and `SKIP` instead of guessing.
- **Heuristic hotel detection** may mislabel an H2. Mitigation: the candidate list is reviewed,
  not auto-applied.
- **Mutating 21 live posts.** Mitigation: dry-run default, one atomic patch per post, and the
  change is a pure append (no existing content is modified or removed), so it is easy to reverse.

## Out of scope

- Any per-hotel concierge CTA (explicitly rejected: concierge stays once per post).
- The `/concierge-planning` page itself and the free-vs-$99 tiering (that is the separate
  Part 3 concierge spec).
- Stay22 Hub tuning (Nova aggressiveness).
- The residual "Deal Alerts" copy sweep.
