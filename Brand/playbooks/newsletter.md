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
