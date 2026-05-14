# VacationPro Weekly Batch Workflow (SOP)

*Repeatable production system for the VacationPro deal engine. Run once per week. Produces a full week of deal posts plus their funnel keywords. Companion to `vacationpro-deal-engine-strategy.md`.*

---

## When to run

Once per week, before the week being produced. One batch session produces 7 days of content so nothing is posted day-of.

## What one batch produces

- A full week of deal posts: roughly 14 to 21 deal posts (2 to 3 per day) across reels, carousels, and statics.
- 7 to 14 supporting posts (1 to 2 per day): destination highlights, "is this resort worth it," travel news.
- Every deal keyword registered in the ManyChat funnel.
- Everything scheduled to FB, IG, and TikTok via Publer.

---

## Step 1: Deal intake

Pull the week's available deals into the deal sheet. Each row needs:

| Field | Notes |
|---|---|
| Destination | Caribbean / beach / tropical only |
| Price | Real, per-person, with occupancy basis |
| Dates | Real travel window |
| Flight estimate | "from major US airports starting at $X" |
| Keyword | Destination-specific, all caps, unique (PUNTACANA, ARUBA, JAMAICA) |
| Source link | Where the deal came from |
| Format | reel / carousel / static (or multiple) |

Check keywords for collisions against active deals (`vacationpro deal list`).

## Step 2: Brief generation

For each deal, Claude produces:
- **Reel:** script (hook 0 to 1.5s with destination plus price, body with 3 to 4 value points, CTA close).
- **Carousel:** slide-by-slide outline (slide 1 photo plus price hook, middle slides for inclusions / dates / flights / resort, last slide CTA).
- **Static:** single-image layout (price plus destination hook baked in).
- **Caption:** existing VacationPro voice, 45 words or fewer, "[Topic]... [reframe]" hook, comment-keyword CTA, plus the booking fine print.

## Step 3: Visuals

Batch-generate or source resort and beach imagery via an API script (never loop the nano-banana MCP for 3+ images). Canvas: 4:5 for statics and carousels, 9:16 for reels. Every carousel slide needs a strong topic-specific image; slide 1 needs an attention-grabbing photo, not a solid color.

## Step 4: Assembly

- **Reels:** built via the existing video pipeline.
- **Carousels and statics:** built via the templated 4:5 system.
- All formats: real VacationPro logo (logo-white.svg), and the price on frame or slide 1.
- Compress carousel and static images to JPEG q=85 before upload (PNGs over 5MB cause Publer SSL upload errors).

## Step 5: Schedule

Batch-schedule via Publer to:
- **Facebook page** (`69d515055b79afafe075ad33`): 4 posts/day at 8am, 12pm, 4pm, 8pm ET, minimum 4-hour gap.
- **Instagram** (`69d5152727413b865c1c7f28`): carousels and statics primary, reels secondary.
- **TikTok:** reels only.

Every carousel goes to both FB and IG in the same batch.

## Step 6: Funnel sync

Register each deal's keyword in the ManyChat funnel via the CLI:

```
vacationpro deal sync   # registers all of this week's deals from the deal sheet
```

Or individually:

```
vacationpro deal add --keyword JAMAICA --price ... --dates ... --landing-page ... --dm-copy ...
```

Verify with `vacationpro deal list`. The universal ManyChat flow is already set up once and does not need to be touched; `deal sync` only updates the deal registry that the dynamic-content endpoint reads.

---

## Weekly analytics loop (separate, end of week)

Pull per deal and per destination: comments, DMs sent, link clicks, leads captured, Tristar webinars attended, revenue. Use it to sharpen next week's deal selection and format mix.

---

## Dependencies (one-time setup, see strategy doc roadmap)

- ManyChat universal flow plus Dynamic Content block on FB and IG.
- Deal registry, dynamic-content endpoint (Vercel function), and `vacationpro deal` CLI.
- Templated deal landing page with swappable lead-gen / booking routing.
- VacationPro TikTok account.
- A confirmed deal source (Track 3 host agency search, deadline 2026-06-11).
