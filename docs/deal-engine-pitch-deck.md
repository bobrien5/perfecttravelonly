---
marp: true
theme: default
size: 16:9
paginate: true
backgroundColor: "#fff8ec"
color: "#0f2e1a"
style: |
  section {
    font-family: 'Inter', sans-serif;
    padding: 60px 80px;
    font-size: 28px;
    line-height: 1.4;
  }
  section.cover { background: #0f2e1a; color: #fff8ec; padding: 100px; }
  section.cover h1 { color: #4ac850; font-size: 96px; line-height: 1.0; margin-bottom: 24px; }
  section.cover h2 { color: #fff8ec; font-size: 36px; font-weight: 500; opacity: 0.85; }
  section.cover .tag { color: #f59e0b; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 48px; }
  section.section-divider { background: #4ac850; color: #fff8ec; padding: 100px; }
  section.section-divider h1 { color: #fff; font-size: 92px; line-height: 1.0; }
  section.section-divider .num { color: #0f2e1a; font-size: 28px; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 32px; opacity: 0.8; }
  h1 { color: #0f2e1a; font-weight: 900; font-size: 56px; letter-spacing: -0.02em; line-height: 1.05; margin-bottom: 32px; }
  h2 { color: #4ac850; font-weight: 700; font-size: 22px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 24px; }
  h3 { color: #0f2e1a; font-weight: 800; font-size: 32px; margin-top: 24px; margin-bottom: 12px; }
  strong { color: #0f2e1a; font-weight: 800; }
  em { color: #4ac850; font-style: normal; font-weight: 700; }
  ul, ol { padding-left: 28px; }
  li { margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 22px; }
  th { text-align: left; padding: 14px 12px; background: #0f2e1a; color: #fff8ec; }
  td { padding: 12px; border-bottom: 1px solid #d6cfb8; }
  tr:last-child td { border-bottom: none; }
  blockquote { border-left: 6px solid #f59e0b; padding-left: 24px; color: #0f2e1a; font-size: 32px; font-weight: 700; line-height: 1.3; }
  .price { color: #4ac850; font-weight: 900; font-size: 64px; font-variant-numeric: tabular-nums; }
  .footnote { color: #6b7280; font-size: 18px; margin-top: 40px; }
  section::after { color: #6b7280; }
---

<!-- _class: cover -->

<div class="tag">VacationPro · 2026</div>

# The Deal Engine

## A creator-led travel brand for Caribbean, beach, and tropical packages. Built to convert.

---

<!-- _class: section-divider -->

<div class="num">01</div>

# The opportunity

---

## Tropical travel intent is huge — and noisy

- Caribbean and beach packages are one of the highest-search, highest-spend leisure categories in the US
- Buyers don't trust generic deal aggregators ("is this real? is it now? what's the catch?")
- Creator-led travel brands convert orders of magnitude better than display ads because they bring a *person* and a *deal* in one post
- Jane & Gigi (`@jane.and.gigi`) is proof: two sisters, a deal-of-the-day reel cadence, a `Comment KEYWORD` funnel, and an estimated **$180K-$360K/yr** off ~150-300K followers

<div class="footnote">VacationPro is positioned in the same operator slot, with tooling that lets a duo run it on autopilot.</div>

---

<!-- _class: section-divider -->

<div class="num">02</div>

# The problem

---

## Deal media doesn't convert. Travel agencies don't scale.

| Existing player | What they do | Why it doesn't fit a small operator |
|---|---|---|
| **TravelPirates / HolidayPirates** | Deal aggregation media at scale | $22M revenue requires 165 employees. Pennies per user. Volume game. |
| **Generic affiliate sites** | List deals, hope clicks convert | No relationship with the user. Tiny commission, no upsell. |
| **Traditional travel agents** | High-touch, phone-based | Doesn't scale. No content engine. No funnel. |
| **Jane & Gigi-style creator agency** | Posts deals, comment-keyword funnel, books through them | **Works.** Requires creative + operational discipline. |

> The opening is for a creator-led travel brand with the *content output* of a media company and the *commission economics* of an agency.

---

<!-- _class: section-divider -->

<div class="num">03</div>

# The play

---

## VacationPro = the Jane & Gigi model with operational tooling

<h2>Positioning</h2>

A deal-discovery brand for **Caribbean, beach, and tropical** vacation packages. Narrower than J&G (who post anywhere), wide enough to cover all-inclusives, beach resorts, island getaways, and tropical packages.

<h2>The promise to a follower</h2>

> "I find you a real beach package with real pricing, and I make booking it effortless."

<h2>The wedge</h2>

Specialist focus in a high-spend category, plus the operational tooling so the content + funnel runs without us touching keyboards every day.

---

<!-- _class: section-divider -->

<div class="num">04</div>

# The product

---

## Three-format content engine, one deal in, three posts out

<h2>From a single Sanity deal slug:</h2>

| Format | Spec | Channel |
|---|---|---|
| **Deal static** | 4:5 single image, hook + price pill | FB feed, IG feed |
| **Deal carousel** | 4:5 multi-slide (hook → included → details → catch → CTA) | FB, IG |
| **Deal reel** | 9:16 15-second MP4, Ken-Burns + music + on-screen text | FB Reels, IG Reels, TikTok |

Every post ends in `Comment {KEYWORD}`. All branded. All Publer-ready. All built by one CLI command.

```bash
python3 generate.py --slug punta-cana --keyword PUNTACANA --formats static,carousel,reel
```

---

## The funnel: comment → DM → landing → lead → booking

```
follower comments PUNTACANA on a post
       │
       ▼
ManyChat (universal flow) → calls our resolve endpoint
       │
       ▼
GET /api/manychat/resolve?keyword=PUNTACANA
   → looks up Supabase deal_keywords
   → returns DM copy + landing URL
       │
       ▼
ManyChat publicly replies + DMs the landing URL
       │
       ▼
vacationpro.co/d/puntacana  ← per-deal landing page
       │
       ▼
ClaimOfferForm  →  GHL (Tristar pipeline, $250/qualified lead)
                    or → World Via Pro (booking, 90/10 commission)
```

---

## End-to-end pipeline (one picture)

```
  Sanity deal  ──►  generate.py  ──►  static.jpg + carousel/*.jpg + reel.mp4 + meta.json
                                                  │
                                                  ▼
                                            Publer (FB/IG/TikTok)
                                                  │
                              audience comments KEYWORD
                                                  ▼
                                         ManyChat universal flow
                                                  │
                              /api/manychat/resolve?keyword=X
                                                  ▼
                                         /d/{keyword} landing page
                                                  │
                                                  ▼
                                  ┌──────────────────────────────┐
                                  │ GHL → Tristar ($250/lead)    │
                                  │ OR                           │
                                  │ World Via Pro booking (Phase │
                                  │ 2; 90/10 commission, $29/mo) │
                                  └──────────────────────────────┘
```

---

<!-- _class: section-divider -->

<div class="num">05</div>

# Business model

---

## Six revenue streams stacked on one audience

| Stream | Status | Per-unit economics |
|---|---|---|
| Tristar lead-gen | **Live** | $250 per qualified webinar attendee |
| FB Creator monetization | **Live** | $-pennies per 1K eligible views |
| Newsletter ad revenue | **Live** | Grows with list |
| Brand sponsorships | **Live** | Rate rises with audience size |
| **Booking commissions** | **Phase 2** (World Via Pro) | ~$115-$210 net per booking (90% of supplier comm., minus $29/mo flat) |
| Group trips + travel club | **Phase 3** | TrovaTrip-style per traveler + recurring membership |

Plus optional paid lead-gen via Meta ads (`meta-ads` MCP-integrated, feeds the same Tristar pipeline).

---

<!-- _class: section-divider -->

<div class="num">06</div>

# Forecast

---

## 6-month revenue forecast (assumption-driven)

| Scenario | 6-mo total | Month-6 run rate (annualized) |
|---|---|---|
| **Conservative** | ~$22,200 | ~$68K/yr |
| **Base** | ~$72,300 | ~$214K/yr |
| **Aggressive** | ~$241,100 | ~$704K/yr |

Sensitivity, in order of impact:

1. **Comments per deal post** (drives lead volume → Tristar revenue)
2. **Lead-to-webinar conversion** (the $250 gate)
3. **Booking attach rate** once World Via Pro is live (Phase 2)
4. **Audience growth rate** (compounds everything)

<div class="footnote">Full assumption tables: Strategy/vacationpro-revenue-forecast.md</div>

---

## Why the curve bends fast

- Same audience monetizes 4x: lead, FB Creator, newsletter, sponsorship
- World Via Pro (Phase 2) adds a 5th stream on the *same* funnel, no extra audience required
- Group trips + travel club (Phase 3) layer recurring + high-ticket revenue without scaling content
- Content tooling means audience scaling doesn't require headcount scaling — same two people can run 1000 deals/year as easily as 100

---

<!-- _class: section-divider -->

<div class="num">07</div>

# What's built

---

## The whole engine is built. Three PRs in flight.

| PR | Track | Built |
|---|---|---|
| **#2** | Track 2: funnel | Supabase `deal_keywords` registry, `vacationpro deal` CLI (add/list/status/sync), `/api/manychat/resolve` endpoint, `/d/[keyword]` landing route, GHL pipeline wired |
| **#3** | Track 1: images | 4:5 deal static + 4:5 deal carousel generators (Python + Playwright, Sanity-fed, Gemini fallback for missing photos) |
| **#4** | Track 1: reels | 9:16 deal reel generator (Python + Hyperframes + GSAP + ffmpeg), end-to-end verified at 1080×1920, 15s, 30fps, with audio |

End-to-end tested against a real Sanity deal. **45 unit tests** across the pipeline. Output stays gitignored. One CLI runs the whole lot.

---

## Tooling stack (what does the work)

- **Next.js 15 + Tailwind** — the landing pages, the resolve API
- **Supabase Postgres** — the keyword registry
- **GoHighLevel** — lead capture + Tristar pipeline
- **ManyChat** — the comment → DM automation
- **Sanity** — deal content (photos, copy, pricing) — single source of truth
- **Playwright + Jinja2** — 4:5 image rendering
- **Hyperframes + ffmpeg** — 9:16 reel rendering
- **Publer** — schedules everything to FB/IG/TikTok
- **Vercel** — hosts everything

---

<!-- _class: section-divider -->

<div class="num">08</div>

# Go to market

---

## Operating cadence (already specified, ready to run)

<h3>Daily (~10 min)</h3>

Glance at yesterday's posts in Publer; check GHL for new leads; tag the interesting ones.

<h3>Weekly</h3>

1. **Intake** — drop the week's deals into deal-sheet.csv
2. **Build** — `python3 generate.py --batch deal-sheet.csv`
3. **Schedule** — push to Publer (4 posts/day, 8a/12p/4p/8p ET)
4. **Funnel sync** — `npm run deal sync` writes keywords to Supabase
5. **Analytics** — end of week: comments / DMs / clicks / leads / commissions per deal

<h3>Monthly</h3>

Pull performance: which destinations convert, which keywords get traction, which deal sources have the best landing-page click-through. Re-cut the deal sheet against winners.

---

<!-- _class: section-divider -->

<div class="num">09</div>

# Team & roadmap

---

## Team

- **Brendan O'Brien** — operator. Background in Ship&Play (social, influencer, paid). Owns content strategy, brand, partnerships.
- **Jordan** — partner. Operations + deal sourcing.
- **Claude (the tooling agent)** — builds and maintains the engine. Weekly batch is one CLI call.

**Headcount math:** one duo can run a 4-posts/day cadence across three channels because the *content* is generated and the *funnel* is automated. Scaling audience does not require scaling headcount.

---

## Roadmap

| Phase | Window | What unlocks |
|---|---|---|
| **Phase 1** | Now | Lead-gen revenue via Tristar ($250/qualified lead) — funnel live, content engine live |
| **Phase 2** | Week 3+ | World Via Pro booking commissions (signup complete; landing page CTA flips on once tested) |
| **Phase 3** | Month 3+ | Group trips (TrovaTrip-style) + travel club (recurring membership) |

---

<!-- _class: section-divider -->

<div class="num">10</div>

# Risks

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Lead quality is thin → Tristar yield disappoints | Eligibility questions on the landing form filter early; deal sheet rotates underperforming destinations |
| ManyChat per-contact cost grows at scale | Native Meta API (Private Replies) is the documented phase-2+ fallback — same UX, no per-contact pricing |
| Reach drops if every post feels like an ad | 1-2 supporting posts/day (destination tips, travel news) are built into the cadence already |
| Supplier commission rates compress | Diversify suppliers via World Via Pro; layer in group trips and travel club (commission-independent) |
| Algorithm changes (FB / IG / TikTok) tank a channel | Multi-channel by design; reels go to all three; carousels go to two |
| Music licensing on reels | Royalty-free track curated on platform (Epidemic Sound / Artlist / Uppbeat). Never use copyrighted audio. |

---

<!-- _class: section-divider -->

<div class="num">11</div>

# Next steps

---

## What's left between now and live

- [x] Brand + strategy locked
- [x] All three production tracks built (3 PRs in review)
- [x] World Via Pro account signed up
- [ ] **Apply Supabase migration** for `deal_keywords` table (SQL ready, paste into Supabase SQL editor)
- [ ] **Drop royalty-free music track** at `Brand/deal-posts/reels/assets/music.mp3`
- [ ] **One-time ManyChat setup** — universal "deal keyword" flow with a Dynamic Content block calling `/api/manychat/resolve`
- [ ] **Smoke-test PR preview deploys**, then merge PRs #2, #3, #4
- [ ] **Run first weekly batch** — 4-7 deals, post live

Once those land, the engine is producing leads on day one and bookings within ~2 weeks.

---

<!-- _class: cover -->

<div class="tag">Thank you</div>

# Let's run a week.

## Brendan O'Brien · VacationPro

bobrien0222@gmail.com
