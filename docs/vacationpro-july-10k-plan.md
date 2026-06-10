# VacationPro — $10k/mo in July, 2026

*Today is May 18, 2026. Target: $10k/mo run rate confirmed during July (10–11 weeks out, ending July 31). Builds on the J&G storefront teardown: 25+ \$6.99 PDFs + two subscription tiers + concierge.*

**Three-phase shape, not a single sprint:**
- **Phase 1 (W1–3, May 18 – Jun 7):** foundation — Beacons live, PDF pipeline, first 15 SKUs, first concierge closes
- **Phase 2 (W4–7, Jun 8 – Jul 5):** layering — subscriptions compound, sponsorships land, vault to 25+ SKUs
- **Phase 3 (W8–11, Jul 6 – Jul 31):** confirm $10k+/mo run rate sustained across 2–3 consecutive weeks

**Floor case:** $7–9k/mo MRR by mid-July, $10k+/mo confirmed by end of July. **Stretch case:** $12–18k/mo by end of July if any of the W5+ items break right (viral hit, group concierge booking, big sponsor close).

> Earlier draft of this doc targeted July 1 specifically. Sliding to "in July" (end of July) means subscriptions and sponsorships have time to compound — both of those need 4+ weeks of cycle time to contribute meaningfully. The week-by-week milestones below still apply; W6 of the original timeline now becomes a checkpoint, not a finish line.

This doc supersedes [`vacationpro-summer-10k-execution.md`](vacationpro-summer-10k-execution.md) as the active plan. That one stays as the longer-view fallback.

---

## 1. The $10k/mo target, broken down

At your scale (354K combined, ~10M impressions/mo), the J&G playbook pro-rates to a realistic monthly mix:

| Stream | July target | Notes |
|---|---|---|
| **$6.99 deal PDFs** | $4,500 | ~640 sales/mo, ~21/day. At 0.1% Beacons CTR × 3% buy rate it's hit by day 30. |
| **Concierge bookings** (World Via Pro 90/10) | $3,000 | ~20 bookings × ~$150 net. Existing inbound is the unlock — needs response-time discipline. |
| **Subscriptions** ($4.99/mo + $14.99/mo) | $1,200 | ~150 subscribers blended; small contribution by July 1, compounds after. |
| **Affiliate** (Amazon + Booking + Viator) | $700 | Slow-and-steady; placing affiliate links in every guide PDF compounds. |
| **Sponsorships / Tristar legacy** | $600 | 1 sponsorship deal or steady Tristar trickle. |
| **TOTAL** | **$10,000** | |

The two flexible levers if any stream lags: bump PDF volume (more SKUs in the vault) or push paid lead-gen ads against the Tristar pipeline ($300-500 ad spend can yield $1.5-2K/mo of Tristar leads).

---

## 2. What's already built (head start)

- ✅ **Deal-engine pipeline** (PR #3 image gen + PR #4 reels) — Sanity → social-ready static/carousel/reel
- ✅ **Funnel infra** (PR #2) — Supabase `deal_keywords` registry, `/api/manychat/resolve` endpoint, `/d/[keyword]` landing pages, GHL → Tristar wiring
- ✅ **World Via Pro account** (90/10 split, $29/mo) — booking commission engine
- ✅ **Audience: 280K TT + 42K IG + 32K FB, 10M monthly impressions** — distribution exists
- ✅ **Sanity deal catalog** — content base for the PDF storefront
- ✅ **Beehiiv account** — already in the tech stack

## What's missing (net-new this sprint)

| Build | Owner | Days |
|---|---|---|
| **PDF render path in `generate.py`** — new `--formats pdf` option, Jinja template, ~5 pages/deal | Claude | 1–2 |
| **Beacons.ai/vacationpro** account + storefront layout | Brendan | 1 |
| **First 10 deal PDFs** rendered + uploaded | Claude renders, Brendan uploads | 1 |
| **Stripe checkout** for $4.99/mo and $14.99/mo subscriptions | Brendan | 1 |
| **CognitoForms concierge intake** (or `/d/concierge` page on vacationpro.co) | Claude | 0.5 |
| **Beehiiv welcome sequence** (5 emails) | Claude drafts, Brendan loads | 0.5 |
| **2 hr DM-response SOP** for concierge inquiries | Brendan operates | ongoing |
| **Sponsorship pitch deck** (1-pager rate card + audience numbers) | Claude drafts | 0.5 |
| **Supabase migration** for `deal_keywords` (still pending) | Brendan, 5 min | 0.1 |
| **ManyChat universal flow** + Dynamic Content block | Brendan, 30 min | 0.1 |
| **Music track** dropped at `Brand/deal-posts/reels/assets/music.mp3` | Brendan | 0.5 |

Net-new build budget: ~5 days of Claude work + ~3 days of Brendan ops setup. The rest is daily operations.

---

## 3. Six-week roadmap (high level)

| Week | Window | Theme | $10k progress |
|---|---|---|---|
| **W1** | May 18–24 | Foundation: pipeline + first 5 PDFs live | $500–1,500 |
| **W2** | May 25–31 | Vault to 10 PDFs + concierge SOP locked + Beehiiv live | $1,500–3,000 |
| **W3** | Jun 1–7 | Subscriptions live + 15 PDFs + first sponsorship pitch sent | $3,000–5,000 |
| **W4** | Jun 8–14 | Optimize what's converting + 20 PDFs + first sponsorship landed | $5,000–7,000 |
| **W5** | Jun 15–21 | Scale: 25 PDFs + paid ads test + concierge volume up | $7,000–9,000 |
| **W6** | Jun 22–30 | Stabilize + verify run rate for 2 weeks | **$10,000+** |

---

## 4. Week 1 — day by day (the foundation week)

Highest leverage. Every day matters.

### Day 1 — Monday, May 18 (today)
- [ ] **Claude:** Spec the new `pdf` format in `generate.py`. Create the PDF Jinja template (5-page layout: cover, the deal, how to book, what's included, soft concierge CTA).
- [ ] **Claude:** Open a `deal-pdfs` branch off `deal-reels` (so it inherits the existing modules).
- [ ] **Brendan:** Apply the Supabase migration (SQL is in PR #2 — paste it into the Supabase SQL editor). Unblocks the funnel.
- [ ] **Brendan:** Sign up for `beacons.ai/vacationpro` (Pro plan, ~$10/mo to strip footer). Configure profile, avatar, header image, bio.
- [ ] **Brendan:** Drop a royalty-free `music.mp3` into `Brand/deal-posts/reels/assets/`. (Epidemic Sound or Artlist subscription if not already.)

### Day 2 — Tuesday, May 19
- [ ] **Claude:** Build the PDF render path. Add `pdf` to `--formats`, wire it to a new `templating.render_pdf(deal, keyword)` function. Test it produces a 5-page 8.5×11 PDF.
- [ ] **Claude:** Render the first 5 deal PDFs from your Sanity catalog. Pick deals with strong photos + clear hooks.
- [ ] **Brendan:** ManyChat one-time setup — universal "deal keyword" flow + Dynamic Content block calling `/api/manychat/resolve`. ~30 minutes.

### Day 3 — Wednesday, May 20
- [ ] **Claude:** Draft the "Top 10 Caribbean Resorts Ranked by Trip Type — 2026" curated PDF as the first non-deal SKU.
- [ ] **Claude:** Draft concierge intake form (or wire the existing `/d/concierge` route on vacationpro.co with a Calendly link).
- [ ] **Brendan:** Upload the first 5 deal PDFs + Top 10 to Beacons at $6.99 each. Add cover thumbnails (the existing Sanity heroImage works as a 1:1 crop).
- [ ] **Brendan:** Add Layer 1 buttons on Beacons: Concierge inquiry, placeholder for Travel Club, placeholder for Subscribe & Save.

### Day 4 — Thursday, May 21
- [ ] **Claude:** Draft Beehiiv 5-email welcome sequence. Trigger: subscriber tagged `beacons-buyer` or `concierge-inquiry`.
- [ ] **Claude:** Draft 3 launch posts (TikTok reel script + IG carousel + FB text). The reel is the priority — use the existing reel generator if it's faster.
- [ ] **Brendan:** Load the welcome sequence into Beehiiv. Test fire to your own email.
- [ ] **Brendan:** Update bio link on TikTok, IG, FB to `beacons.ai/vacationpro`.

### Day 5 — Friday, May 22 — LAUNCH DAY
- [ ] **Brendan:** Post the launch reel on TikTok + IG.
- [ ] **Brendan:** Post the IG carousel + FB text post + stories on IG and FB.
- [ ] **Brendan:** DM the launch announcement to your top 10 most engaged followers (warm-touch).
- [ ] **Brendan:** Set the 2-hour DM response SOP — handle every concierge inquiry within 2 hours during waking hours. Use a templated first-reply.
- [ ] **Brendan + Claude:** Watch the Beacons analytics. Aim for 1,000+ page views and 10+ sales by EOD Sunday.

### Day 6 — Saturday, May 23
- [ ] **Claude:** Render 3 more deal PDFs (vault now at 8 specific deals + Top 10).
- [ ] **Brendan:** Post the second batch (a reel covering 1 of the new deal PDFs).
- [ ] **Brendan:** Respond to all DMs / concierge inquiries from launch.

### Day 7 — Sunday, May 24 — Week 1 retro
- [ ] **Brendan + Claude:** Pull the numbers — Beacons views, PDF sales by SKU, concierge inquiries, email signups, DM volume.
- [ ] Identify the top-selling SKU format (specific deal vs Top 10 list). Plan W2 to lean into that format.
- [ ] **Brendan:** Re-rank the Beacons button order based on what's actually getting clicks.

**Week 1 exit criteria:**
- 8+ PDFs live on Beacons
- 50+ PDF sales = $350+ revenue
- 10+ concierge inquiries (the existing inbound, now routed)
- 200+ Beacons-driven email signups
- Funnel pipeline (Supabase + ManyChat + landing) fully operational

---

## 5. Weeks 2–6 milestones

### Week 2 (May 25–31): Volume + concierge close discipline
- [ ] PDF vault to 12 SKUs. Mix: 8 specific deals + 4 curated "Top X" lists.
- [ ] Beehiiv welcome sequence live and tagging buyers vs leads
- [ ] First concierge BOOKING closes (target: 1–3 closes, each = ~$150 net commission)
- [ ] Pricing test: try $9.99 on one "Top 10" SKU to see if curated lists support higher AOV
- [ ] **Target:** $1,500–3,000 cumulative

### Week 3 (Jun 1–7): Subscriptions + first sponsor pitch
- [ ] Stripe checkout for **Travel Club $14.99/mo** and **Subscribe & Save $4.99/mo** wired to Beacons
- [ ] Travel Club benefits page (what they actually get for $14.99/mo)
- [ ] Sponsorship outreach: pitch 5 brands (luggage, travel apps, insurance) with a one-page rate card + audience numbers
- [ ] Pinterest account live, weekly 10-pin batch
- [ ] PDF vault to 15 SKUs
- [ ] **Target:** $3,000–5,000 cumulative ($1.5K+ that week)

### Week 4 (Jun 8–14): Optimize + first sponsor close
- [ ] A/B test Beacons button labels + order based on W1–3 data
- [ ] First sponsorship closes (target: $750–1,500 for one post)
- [ ] First concierge volume scaling: 8–12 bookings/wk
- [ ] PDF vault to 20 SKUs
- [ ] Reviews carousel populated with 5+ real client testimonials
- [ ] **Target:** $5,000–7,000 cumulative ($2K+ that week)

### Week 5 (Jun 15–21): Scale + paid ads test
- [ ] Paid lead-gen ads via Meta Ads MCP: $500 test budget against Tristar pipeline (lead-gen ads with eligibility-qualified instant forms)
- [ ] Concierge volume to 15–20 bookings/wk
- [ ] LIFETIME Vault Access $199 SKU live with messaging
- [ ] PDF vault to 25+ SKUs
- [ ] **Target:** $7,000–9,000 cumulative ($2K+ that week)

### Week 6 (Jun 22–30): Stabilize + first checkpoint
- [ ] Run-rate check: weekly revenue ≥ $1,750 (= $7K/mo pace)
- [ ] Concierge sustained at 15+ bookings/mo
- [ ] Sponsorship #1 closed + invoiced, sponsorship #2 in negotiation
- [ ] First Travel Club retention check (any churn from W3 cohort)
- [ ] **Checkpoint target: $7,000–9,000/mo MRR pace, on track for $10K by month-end**

### Week 7 (Jul 1–7): Push to $10k pace
- [ ] PDF vault to 30 SKUs (steady 4–5 new SKUs/week)
- [ ] Subscriptions compound: W3 cohort hits 6-week mark, Travel Club retention data visible
- [ ] Concierge volume to 20+ bookings/mo
- [ ] Paid ads test outcome reviewed; double down if ROAS > 2× or kill it
- [ ] First Lifetime Vault Access ($199) sales accumulating
- [ ] **Target: $1,800–2,500 weekly revenue ($10K monthly pace)**

### Week 8 (Jul 8–14): Confirm the run rate
- [ ] Two consecutive weeks at $10K/mo pace = run rate "confirmed"
- [ ] Sponsorship #2 closed
- [ ] PDF vault to 35 SKUs
- [ ] **Target: weekly revenue ≥ $2,300 ($10K+ monthly pace)**

### Weeks 9–11 (Jul 15 – Jul 31): Stabilize + plan August
- [ ] Run rate held at $10K+/mo for 3 consecutive weeks → **target hit**
- [ ] Plan next phase (group trips, the $199 course, paid ads at scale)
- [ ] Begin sponsorship #3 outreach
- [ ] **Target: $10,000–14,000/mo confirmed run rate by July 31**

---

## 6. Build vs Ops responsibility split

### Claude (build + drafts)
- PDF render path in the deal-engine
- Deal PDF Jinja template + render verification
- Top 10 / curated PDFs (editorial)
- Beehiiv welcome sequence copy
- Launch post drafts (TikTok reel + IG carousel + FB text)
- Concierge intake page or Cognito form draft
- Sponsorship pitch deck / one-pager
- Travel Club benefits page copy
- Lifetime Vault Access description + messaging
- Weekly analytics pulls

### Brendan (ops + accounts + cadence)
- Beacons signup + button configuration + product uploads
- Stripe subscription setup
- ManyChat one-time flow setup
- Supabase migration application
- Music track sourcing
- All social posting (4 posts/day cadence)
- DM responses (2-hour SLA)
- Concierge calls and Calendly bookings
- Sponsorship outreach calls and negotiations
- Testimonial gathering

### Both
- Daily revenue / metrics review
- Weekly retro
- Vault SKU planning (which deals to render next)

---

## 7. Risks + what could push past July 1

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Beacons setup takes more than a day | Low | -3 days | Pro plan is paid signup, fast; if issues arise, use shop.beacons.ai/vacationpro storefront only and patch the bio link |
| ManyChat flow doesn't trigger DMs reliably | Low | -1 wk | Already verified with Track 2's resolve endpoint; if it breaks, fall back to manual DM with a saved-reply macro |
| Stripe subscription setup fragile | Med | -1 wk | If Stripe Connect is hard, fall back to LemonSqueezy or direct Stripe payment links; subscriptions are W3, so we have time |
| Concierge response-time SOP slips | Med | -50% close rate | This is the single biggest revenue lever. If DMs sit > 24h, leads die. Lock the 2-hour rule on day 1. |
| Top-of-vault PDFs flop (sales < 5/day in W1) | Med | -50% PDF revenue | Pivot: switch to curated "Top 10" SKUs which convert better than single-deal SKUs; J&G has 4 of these for a reason |
| First sponsorship doesn't close by W4 | Med | -$1.5K | Lower-tier brands ($300-500 placements) close faster; pitch 10 instead of 5 |
| FB/IG algorithm changes tank reach in W2 | Low | -30% impressions | Multi-platform by design (TikTok + IG + FB); reels go to all three |
| World Via Pro onboarding incomplete | Med | -$3K (concierge stream) | If WVP isn't issuing commissions by W3, route concierge to Tristar lead-gen as a fallback (still pays $250/qualified) |

---

## 8. Daily metrics dashboard (track from Day 1)

A simple sheet (or Notion table) — pull these every day:

| Metric | Where it comes from | Daily target by W6 |
|---|---|---|
| Beacons page views | Beacons analytics | 1,500+ |
| PDF sales count | Beacons orders | 25+ |
| PDF revenue | Beacons orders × $6.99 (or higher) | $175+ |
| Concierge inquiries | DM volume tagged "concierge" | 5+ |
| Concierge bookings closed | World Via Pro pipeline | 1+ |
| Email signups | Beehiiv new subs | 30+ |
| TikTok post impressions (24h) | TikTok analytics | 200K+ |
| Top of funnel: comment-keyword count | ManyChat / Beacons referrer | 100+ |

End-of-week roll-up on Sundays. Adjust the following Monday's posts based on what worked.

---

## 9. The "if everything breaks right" stretch

If two of these stack in W1–4, July 1 hits closer to $15K/mo:

1. **A viral TikTok hit (>2M views) drops in W2-3.** Drives 20K+ new followers. Compounds every downstream stream.
2. **One concierge booking is a group trip (5+ travelers, $5K+ package).** Single-deal commission of $500-800.
3. **A sponsor pre-commits to a 3-post package** instead of a single placement.
4. **The $199 Lifetime Vault picks up 10 buyers in W4** ($1,990 burst).
5. **One viral guide ($6.99 PDF) clears 200 sales in 48 hours.** ~$1,400 spike, plus halo effect on related SKUs.

Don't plan for these. Don't ignore them when they happen — leverage them immediately (pin to bio, run a sale, push paid ads to the spike).

---

## 10. Next action — right now

Two parallel kickoffs today:

**Brendan (next 30 minutes):**
1. Apply the Supabase migration (5 min — SQL surfaced earlier)
2. Sign up for `beacons.ai/vacationpro` Pro plan and reserve the handle

**Claude (next session):**
1. Spec + build the PDF render path on a new branch
2. Render the first 5 deal PDFs from Sanity
3. Draft the launch reel script + IG carousel

Once your two items are done, ping me — I'll have the PDFs ready to upload + the Beacons button copy + launch posts queued.
