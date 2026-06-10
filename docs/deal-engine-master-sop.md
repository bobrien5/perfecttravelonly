# VacationPro Deal Engine — Master SOP

The single-page everything-view of the VacationPro deal engine. The Jane & Gigi–style funnel that turns a Sanity deal into bookings via FB, IG, and TikTok.

Last updated: 2026-05-15. Lives at `docs/deal-engine-master-sop.md`; the per-component specs/READMEs are linked inline.

---

## What it is, in one paragraph

You drop a deal into Sanity. The build pipeline turns that one deal into a 4:5 static image, a 4:5 multi-slide carousel, and a 9:16 reel — all branded, all auto-captioned, all ready for Publer. Publer pushes them to FB, IG, and TikTok on the 8a / 12p / 4p / 8p ET cadence. Every post ends in `Comment {KEYWORD}`. ManyChat watches every comment; when it sees the keyword it auto-DMs the link to a per-deal landing page. The landing page captures the lead into GHL → Tristar (the $250/qualified-lead pipeline today) or, once World Via Pro is live, takes a booking deposit directly (90/10 commission split, $29/month flat).

---

## End-to-end flow

```
                  ┌────────────────────────────────────────────────┐
                  │  SOURCE: a deal exists in Sanity               │
                  │   (slug, hero/gallery photos, what's included, │
                  │    travel dates, price, originalPrice,         │
                  │    savings %, disclaimer)                      │
                  └─────────────────┬──────────────────────────────┘
                                    │
                                    ▼
                  ┌────────────────────────────────────────────────┐
                  │  WEEKLY BATCH (operator: you)                  │
                  │   Drop a row into deal-sheet.csv:              │
                  │     slug, keyword, formats, flight_estimate    │
                  └─────────────────┬──────────────────────────────┘
                                    │
                                    ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │  BUILD: python3 Brand/deal-posts/generate.py --batch deal-sheet.csv   │
   │  ────────────────────────────────────────────────────────────────     │
   │                                                                       │
   │  sanity_client.fetch_deal(slug)   ──►   {dict of deal fields}         │
   │                                                                       │
   │  ┌────────────────┐   ┌────────────────┐   ┌────────────────────┐     │
   │  │ STATIC (4:5)   │   │ CAROUSEL (4:5) │   │ REEL (9:16)        │     │
   │  │ HTML+Playwright│   │ HTML+Playwright│   │ Hyperframes+FFmpeg │     │
   │  │ → JPEG q=85    │   │ → 4-5 JPEGs    │   │ → 15s MP4 + audio  │     │
   │  └────────┬───────┘   └────────┬───────┘   └─────────┬──────────┘     │
   │           └─────────────┬──────┴───────────────┬─────┘                │
   │                         ▼                      ▼                      │
   │                  Brand/deal-posts/{slug}/                             │
   │                    static-4x5.jpg                                     │
   │                    carousel/slide-NN.jpg                              │
   │                    reel-9x16.mp4                                      │
   │                    meta.json   ← caption + per-format platform list   │
   └───────────────────────────────┬───────────────────────────────────────┘
                                   │
                                   ▼
                  ┌────────────────────────────────────────────────┐
                  │  SCHEDULE via Publer (4 posts/day):            │
                  │   • Carousel + static → FB + IG                │
                  │   • Reel → FB + IG + TikTok                    │
                  │   • Each caption ends "Comment {KEYWORD}"      │
                  └─────────────────┬──────────────────────────────┘
                                    │
                                    ▼
                  ┌────────────────────────────────────────────────┐
                  │  REGISTER the keyword:                         │
                  │   npm run deal add --keyword PUNTACANA ...     │
                  │   (writes into Supabase deal_keywords table)   │
                  └─────────────────┬──────────────────────────────┘
                                    │
                                    ▼
   ────────── audience sees the post on FB / IG / TikTok ──────────
                                   │
                                   ▼
            follower comments PUNTACANA (or whatever the keyword is)
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │  MANYCHAT (one-time setup):                                           │
   │  Universal "deal keyword" flow with a Dynamic Content block that      │
   │  calls GET https://www.vacationpro.co/api/manychat/resolve?keyword=X  │
   │                                                                       │
   │  resolve endpoint → Supabase deal_keywords lookup                     │
   │   → returns { dmText, landingUrl }                                    │
   │                                                                       │
   │  ManyChat:                                                            │
   │   1. publicly replies "Sent you a DM 🌴" (also boosts engagement)     │
   │   2. DMs the user the deal link                                       │
   │   3. follow-up DM 24h later if no reply                               │
   └───────────────────────────────┬───────────────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │  LANDING PAGE: vacationpro.co/d/{keyword}                             │
   │  Renders the ClaimOfferForm tuned to that deal (title, price, etc.)   │
   │  Captures: name, email, phone, age, marital, income, own/rent         │
   └───────────────────────────────┬───────────────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │  POST /api/ghl/claim-offer                                            │
   │   • Upserts contact in GHL with tags ['claim-offer','timeshare-lead'] │
   │   • Creates opportunity in Marketing Pipeline → New Lead              │
   │   • Tracks UTM source/medium/campaign per deal                        │
   └───────────────────────────────┬───────────────────────────────────────┘
                                   │
                                   ▼
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
   ┌──────────────────────────────┐   ┌──────────────────────────────┐
   │  PHASE 1 (today):            │   │  PHASE 2 (World Via Pro):    │
   │  GHL routes to Tristar.      │   │  Same landing page, but the  │
   │  When the lead attends the   │   │  CTA flips to "Reserve with  │
   │  webinar, you earn $250.     │   │  deposit." 90/10 commission  │
   │                              │   │  split, $29/mo flat.         │
   └──────────────────────────────┘   └──────────────────────────────┘
```

---

## Daily routine

Roughly 10 minutes once the cadence is humming.

1. Glance at yesterday's deal posts in Publer → comments / DMs delivered / link clicks
2. Pull GHL's claim-offer pipeline: any new leads since yesterday? Tag the genuinely interesting ones
3. Check `deal-sheet.csv` against the rest of the week — anything need swapping (a deal expired, photos broke, a destination over-rotated)?

---

## Weekly routine (the deal-engine SOP)

Owns step 4 of [`Strategy/vacationpro-weekly-batch-workflow.md`](../Strategy/vacationpro-weekly-batch-workflow.md). The full operator README for the image generators is at [`Brand/deal-posts/README.md`](../Brand/deal-posts/README.md); the reel-specific notes are at [`Brand/deal-posts/reels/README.md`](../Brand/deal-posts/reels/README.md).

| # | Step | Who/how |
|---|---|---|
| 1 | **Intake** | Open `deal-sheet.csv`. Add this week's rows: `slug, keyword, formats, flight_estimate`. Keep keywords destination-specific + uppercase. |
| 2 | **Briefs** | (Optional, Claude) auto-draft per-deal copy/hook variants |
| 3 | **Visuals** | Handled by the build (Sanity heroImage + galleryImages; Gemini fallback) |
| 4 | **Build** | `cd Brand/deal-posts && python3 generate.py --batch deal-sheet.csv` — produces static, carousel, reel + `meta.json` per deal |
| 5 | **Schedule** | Push to Publer. Each post's caption is in its `meta.json`. Per-format platform routing (carousel → FB+IG, reel → +TikTok) is also in `meta.json.scheduling.platforms_by_format`. |
| 6 | **Funnel sync** | For every deal: `npm run deal add --keyword X --deal-slug Y ...` (writes to Supabase `deal_keywords`; the ManyChat universal flow picks it up automatically) |
| 7 | **Analytics** | End of week: pull per-deal comments / DMs / clicks / leads / Tristar webinars / commission. Tune next week's intake. |

---

## What to build and what's already running

| Piece | Status | Where |
|---|---|---|
| Deal-keyword registry (Supabase) | Schema in PR #2 — apply the migration via Supabase SQL editor | [`supabase/migrations/0001_deal_keywords.sql`](../supabase/migrations/0001_deal_keywords.sql) on `deal-engine-funnel` |
| Resolve endpoint (`/api/manychat/resolve`) | Built in PR #2 | `src/app/api/manychat/resolve/` |
| Per-keyword landing page (`/d/[keyword]`) | Built in PR #2 | `src/app/(landing)/d/[keyword]/page.tsx` |
| Lead capture → GHL → Tristar | Already live (pre-existing) | `src/app/api/ghl/claim-offer/route.ts` |
| `vacationpro deal` CLI | Built in PR #2 | `scripts/deal-cli.ts` + `src/lib/deal-registry/` |
| 4:5 static + carousel generators | Built in PR #3 | `Brand/deal-posts/` |
| 9:16 reel generator (Hyperframes) | Built in PR #4 | `Brand/deal-posts/reels/` |
| World Via Pro account | **Signed up (you, 2026-05-15)** — Phase 2 unlock | (external) |
| ManyChat universal flow | **Operator setup today (you)** | (external) |
| Royalty-free music track | **Pick one on the platform (you)** → drop at `Brand/deal-posts/reels/assets/music.mp3` | (external) |

---

## Reference docs (deeper)

| Doc | What it covers |
|---|---|
| [`Strategy/vacationpro-deal-engine-strategy.md`](../Strategy/vacationpro-deal-engine-strategy.md) | The strategic why — Jane & Gigi model, hybrid lead-gen + booking, 3 tracks |
| [`Strategy/vacationpro-rollout-timeline.md`](../Strategy/vacationpro-rollout-timeline.md) | Week-by-week launch plan |
| [`Strategy/vacationpro-weekly-batch-workflow.md`](../Strategy/vacationpro-weekly-batch-workflow.md) | The weekly batch SOP (this doc's step 4 references it) |
| [`Strategy/vacationpro-revenue-forecast.md`](../Strategy/vacationpro-revenue-forecast.md) | Conservative / base / aggressive 6-month forecast |
| [`docs/plans/2026-05-14-deal-engine-funnel.md`](plans/2026-05-14-deal-engine-funnel.md) | Track 2 implementation plan (funnel: registry, resolve, CLI, landing) |
| [`docs/specs/2026-05-14-deal-post-templates-design.md`](specs/2026-05-14-deal-post-templates-design.md) | Track 1 image-gen design spec |
| [`docs/plans/2026-05-14-deal-post-templates.md`](plans/2026-05-14-deal-post-templates.md) | Track 1 image-gen implementation plan |
| [`Brand/deal-posts/README.md`](../Brand/deal-posts/README.md) | Image-gen operator SOP + pipeline diagram |
| [`docs/specs/2026-05-15-deal-reels-design.md`](specs/2026-05-15-deal-reels-design.md) | Reel sub-project design spec |
| [`docs/plans/2026-05-15-deal-reels.md`](plans/2026-05-15-deal-reels.md) | Reel sub-project implementation plan |
| [`Brand/deal-posts/reels/README.md`](../Brand/deal-posts/reels/README.md) | Reel-specific operator notes |

Some of these live on branches that haven't merged yet (PR #2 → `deal-engine-funnel`, PR #3 → `deal-post-templates`, PR #4 → `deal-reels`). Merging all three lands every doc on `main`.

---

## Troubleshooting top-10

| Symptom | Likely cause | Fix |
|---|---|---|
| Comment keyword → nothing happens | Keyword isn't in Supabase `deal_keywords` yet, or status isn't `active` | Run `npm run deal status <KEYWORD>` to confirm |
| `/d/{keyword}` → 404 | Same — keyword not in the registry | `npm run deal add ...` |
| `/d/{keyword}` → 500 | Supabase env vars missing on Vercel, or table not migrated | Check Vercel envs; confirm `deal_keywords` table exists |
| Reel renders silent | `<audio id="bg-music">` missing OR `music.mp3` absent | Confirm template has the id; drop a track at `Brand/deal-posts/reels/assets/music.mp3` |
| Reel render hangs/errors | Node < 22 or no ffmpeg | `nvm use 22 && ffmpeg -version` |
| Carousel slide 1 ≠ static | They share a Jinja macro, so they shouldn't drift. If they do, check `templates/_macros.html` was edited in two places. |
| Static / carousel render uses fallback font | Inter from Google Fonts didn't load before Playwright snapshot | Re-run online; the wait_for_timeout(400) and networkidle should cover most cases |
| Lead doesn't appear in GHL | `GHL_API_TOKEN` or `GHL_LOCATION_ID` missing on Vercel | Set them and redeploy |
| Carousel posts to TikTok by mistake | Downstream scheduler ignored `meta.json.platforms_by_format` | Make it read that field structurally instead of hardcoding |
| Output JPEGs > 5MB → Publer SSL upload fails | JPEG quality dial got bumped | Reset to `JPEG_QUALITY = 85` in `Brand/deal-posts/render.py` |
