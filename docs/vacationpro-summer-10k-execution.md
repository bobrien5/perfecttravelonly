# VacationPro — Summer Execution Roadmap to $10k/mo

*Companion to [`vacationpro-business-plan.md`](vacationpro-business-plan.md). Maps the business plan onto what's already built, calls out the gaps, and sequences the first 90 days. Target: $10k/mo MRR by Sept 1, 2026 (~15 weeks from 2026-05-15).*

---

## $10k/mo, broken down

Target stream mix at run-rate (these are reasonable, not guaranteed; tune as data lands):

| Stream | Target $/mo | How to get there |
|---|---|---|
| Digital products ($5–6 guides via Beacons) | **$2,500** | ~500 sales/mo → ~16/day. Needs traffic + 4–6 SKUs. |
| Concierge bookings (commissions via World Via Pro 90/10) | **$4,000** | ~25 bookings/mo at ~$160 net per booking. Needs DM funnel + reply discipline. |
| Affiliate income | **$1,500** | Amazon Associates + Booking.com + Viator/GetYourGuide + credit cards. Compounding clicks. |
| Sponsorships | **$1,500** | 1–2 paid placements/mo at $750–1,500. Only meaningful once audience clears ~30K combined. |
| Tristar lead-gen (legacy stream from prior strategy — optional) | $500–1,500 | Keep running quietly if it pays; don't expand it. |
| **TOTAL** | **~$10,000** | |

The two biggest levers are **digital products** and **concierge**. Sponsorships ramp last; affiliate is the slow-and-steady multiplier.

---

## What's already built (reusable)

The deal-engine work from the last sprint maps directly onto the new plan — it's the operational backbone for **Pillar 2 (Deals)** and the **lead-magnet → DM** funnel:

| Existing build | Used for what (in the new plan) |
|---|---|
| **`Brand/deal-posts/` Python pipeline** (PR #3, #4) — static, carousel, reel generators driven by Sanity content | Pillar 2 (deals) *and* Pillar 1 (aspiration) *and* Pillar 5 (guides) — every pillar uses the same image / carousel / reel formats, just with different copy. The generators are pillar-agnostic. |
| **`deal_keywords` registry + `/api/manychat/resolve` endpoint + `/d/[keyword]` landing page** (PR #2) | Lead-magnet delivery (e.g. "Comment GUIDE → DM the Caribbean Resort Guide download") and concierge inquiry intake. Not deal-specific. |
| **GHL → Tristar pipeline wiring** | Lead capture infra. Concierge leads can route the same way; just a new pipeline stage. |
| **World Via Pro account (90/10, $29/mo)** | The booking commission engine for the concierge stream. |
| **Publer integration** | Multi-channel scheduling for the cadence (TikTok / IG / FB). |
| **Beehiiv + SendGrid** | Email platform (already wired into the existing site). |

The deal engine's funnel mechanics translate cleanly: change the keyword from `PUNTACANA` (deal) to `RESORTGUIDE` (lead magnet) or `CONCIERGE` (inquiry) — same plumbing.

---

## What's missing (net-new work)

| Gap | What it is | Difficulty |
|---|---|---|
| **First digital product** | One $5–6 guide (Caribbean Resort Guide) authored + designed in Canva/Notion/Figma | **Days** |
| **Beacons.ai storefront** | Sign up, list products, link from bio everywhere | **1 hour** |
| **Lead magnet PDF** | "Top 25 Caribbean Resorts" downloadable; drives email signups | **Days** |
| **Beehiiv welcome sequence** | 5-email sequence that warms new subscribers and sells the first guide | **1 day** |
| **Pinterest account + pin templates** | Travel converts on Pinterest; the existing 4:5 carousel template repurposes 1:1 | **1 day** |
| **TikTok content (Pillar 1 / 4)** | Aspiration + lifestyle content. The reel generator covers Pillar 2 (deals). New templates for ranking videos, POV clips, comparison graphics. | **1–2 weeks** |
| **Affiliate program signups** | Amazon Associates, Booking.com, Viator, GetYourGuide, travel credit cards | **2–3 hours** |
| **Concierge inquiry funnel** | Landing page variant + Calendly + intake form | **Days** (the `/d/[keyword]` route is reusable) |
| **Multi-pillar content cadence** | Daily output across 5 pillars, not just the deal pillar | **Ongoing** |
| **Sponsorship pitch deck + cold-outreach list** | Wait until ~30K combined followers; have it ready in advance | **2 days** |

The largest single net-new item is **content production volume across 5 pillars** — that's a daily creative practice, not a one-time build. The tooling supports it; the work is sourcing photos and writing copy for each post.

---

## 90-day sequenced rollout

### Weeks 1–2 (May 15 – May 28) — "Money sooner, audience always"

Goal: ship the digital product + lead magnet + Beacons. Start broader content cadence.

- [ ] **Apply Supabase migration** (the `deal_keywords` SQL — pending; needs to be pasted into Supabase SQL editor)
- [ ] **Smoke-test PR previews** for #2, #3, #4; merge in order
- [ ] **Drop royalty-free music** at `Brand/deal-posts/reels/assets/music.mp3`
- [ ] **ManyChat universal flow** set up (one-time; user owns)
- [ ] **Ship Digital Product #1: Caribbean Resort Guide** ($5–6). Write + design + publish to Beacons. Promote on FB / IG / TikTok / Pinterest.
- [ ] **Ship lead magnet: "Top 25 Caribbean Resorts" PDF**, with comment-keyword delivery (`Comment RESORTS → DM the PDF`). Reuses the ManyChat funnel.
- [ ] **Beehiiv welcome sequence** (5 emails: welcome → top guides → first deal → concierge offer → reactivation)
- [ ] **Affiliate signups** (Amazon Associates, Booking.com, Viator) — minimum bar to start earning
- [ ] **First 4-deal weekly batch** runs through the deal engine; posts go live

### Weeks 3–6 (May 29 – Jun 25) — "Three more pillars come alive"

Goal: build the content engine across all 5 pillars. Concierge funnel live.

- [ ] **Booking Go-Live**: landing page CTA flips to "Reserve with deposit" on bookable deals (World Via Pro live)
- [ ] **Pinterest account live**, weekly batch of 10 pins repurposed from carousels
- [ ] **TikTok cadence to 2–4 posts/day**: 2 deal-engine reels + 2 aspiration/lifestyle clips
- [ ] **Digital Product #2** (Best All-Inclusive Resorts) shipped to Beacons
- [ ] **Concierge inquiry funnel**: `/d/concierge` page with intake form + Calendly link, promoted in stories + bio
- [ ] **Aspiration content template** added to the generator (ranking videos like "Top 10 Caribbean Islands")
- [ ] **Travel-tips carousel template** added (Pillar 3)
- [ ] First brand sponsorship outreach to luggage + travel app brands (3–5 cold pitches/week)

### Weeks 7–12 (Jun 26 – Aug 6) — "Compound and convert"

Goal: optimize what's working, scale traffic, layer in sponsorship revenue.

- [ ] **Digital Products #3, #4** (Budget vs Luxury, Honeymoon Guide)
- [ ] **Weekly analytics loop** running: per-pillar performance, per-format CTR, per-keyword lead conversion
- [ ] **Concierge volume scale**: aim for 10+ bookings/mo by week 12
- [ ] **First sponsorship landed** (luggage brand most likely first)
- [ ] **Email list to 5,000+** via lead magnet + content funnel
- [ ] **Top-converting pillar gets doubled** (probably aspiration or guides — likely the top organic drivers)

### Weeks 13–15 (Aug 7 – Sep 1) — "Hit run rate"

Goal: stabilize at $10k/mo.

- [ ] **Verify run rate**: weekly revenue snapshot ≥ $2,300/wk for 3 consecutive weeks
- [ ] **Concierge offer tiering**: free inquiry → $99 planning fee tier → VIP planning ($299)
- [ ] **Affiliate optimization**: bundle product placements (e.g., "what's in my carry-on" → Amazon links)
- [ ] **Pitch deck ready** for next-tier sponsors (resort partnerships, cruise companies)

---

## This week's first three ships *(highest leverage)*

1. **Apply the Supabase migration** (15 min — paste SQL into Supabase SQL editor). Unblocks the whole funnel.
2. **Ship Digital Product #1: Caribbean Resort Guide on Beacons** (1–2 days). Fastest path to first dollar of new revenue under the new plan.
3. **Set up Beehiiv welcome sequence** (half day). Captures every lead the funnel generates into a list we own.

Everything else fans out from these three.

---

## Reconciling with the prior pitch deck + master SOP

The earlier pitch deck (`deal-engine-pitch-deck.pdf`) and master SOP (`deal-engine-master-sop.md`) are accurate for **Pillar 2 (Deals)** and the **funnel infrastructure** — but they're scoped to the deal-engine angle of the new plan, not the full media + concierge + digital products framing.

Don't throw them out — they're still operationally correct for the "Deals" pillar and the funnel plumbing. But the **canonical strategic doc going forward is [`vacationpro-business-plan.md`](vacationpro-business-plan.md)**. Treat the deal-engine docs as the tactical Pillar-2 manual; treat this execution roadmap as the bridge between the two.

Once the digital-products + concierge streams are live, it's worth rewriting the pitch deck around the broader 4-stream / 5-pillar model.

---

## Open questions to settle as we ramp

1. **Tristar lead-gen** — keep it running quietly? Most of the prior plan's revenue forecast leaned on Tristar's $250/lead. The new plan doesn't include it. Recommend: leave it running, count what it pays as bonus revenue, don't actively grow it.
2. **Pillar 4 (luxury / POV / aesthetic) — who shoots that content?** Real B-roll is hard to generate; Sanity has resort photos but not POV beach clips. Either source stock (Pexels/Coverr), buy a cheap content trip, or partner with a content creator for swap.
3. **Concierge response time** — DM → first reply within how long? J&G typically replies within hours, often manually. We'll need a basic playbook (template replies, calendar booking link) before this scales.
4. **Pricing on the guides** — $5–6 is good for impulse buy. Worth A/B testing a $9 "Pro" version with extra destinations or seasonal addenda?

---

*Status as of 2026-05-15:*
- Deal-engine pipeline built and end-to-end-verified ✅
- World Via Pro signed up ✅
- Supabase migration pending (paste-in step) ⏳
- ManyChat universal flow pending (user setup) ⏳
- Music track pending (sourcing) ⏳
- Digital products / Beacons / Pinterest / broader content cadence — net-new, starts this week
