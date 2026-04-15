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
