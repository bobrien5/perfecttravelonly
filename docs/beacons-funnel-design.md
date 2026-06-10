# VacationPro Beacons Funnel — Design + Launch Spec

*Created 2026-05-15, revised 2026-05-18 after live teardown of `beacons.ai/jane.and.gigi`. Goal: ship `beacons.ai/vacationpro` today with the per-deal PDF storefront model, two subscription tiers, and the concierge inquiry path.*

---

## 1. Jane & Gigi teardown — what they actually do

Pulled from the live `beacons.ai/jane.and.gigi` page (May 2026). This is the verified blueprint, not assumptions.

### Header
- Avatar + display name "Jane & Gigi"
- Bio: *"Helping 600K+ travelers find affordable dream vacations ✈️"* — the social-proof number is doing real work
- Three social icons: email, TikTok, Instagram. **No Facebook in the bio.** (They post on FB but don't link it in bio.)

### Layer 1 — Three top-of-page CTAs (in this order)

| Position | Button | Subtitle | Destination |
|---|---|---|---|
| 1 | **Concierge Trip Planning** | VIP Planning Service by Jane and Gigi | CognitoForms inquiry |
| 2 | **Travel Club Membership** | Premium access $14.99/mo personalized travel packages, vault access + more | Stripe direct buy, $14.99/mo recurring |
| 3 | **SUBSCRIBE AND SAVE** | Weekly Travel Deals | Stripe direct buy, $4.99/mo recurring |

### Layer 2 — Travel Deal Vault (THE engine)

A storefront grid of **25+ individual deal PDFs at $6.99 each**, each sold via Beacons' native shop module. Every PDF is one specific deal or one curated "top 10" list. Examples (with verbatim labels):

**Specific deals ($6.99 each):**
- "100% off flights for Temptation Cancun"
- "1 WEEK Hawaii for $824"
- "St Lucia $540"
- "Los Cabos $932"
- "St Thomas All Inclusive $999" (subtitle: "No PASSPORT needed!")
- "Jamaica Deal $571" (subtitle: "Adults only Resort")
- "Punta Cana For $681"
- "$449 to San Juan"
- "Curaçao $778 Travel Deal"
- "Aruba Travel Deal" (subtitle: "$1046 per person for all inclusive resort")
- "Maui $697 Travel Deal!"
- "Secrets Cap Cana - Flights 100% off"
- "Cancun $445 Travel Deal"
- "Hawaii for $640"
- "Costa Rica $375 Travel Deal"
- "St Croix $628 Travel Deal" (subtitle: "Includes Breakfast!")
- "Jamaica $706 Deal"
- "St Thomas Ritz for $952"
- "3 Bahamas Travel Deals under $700 BUNDLE"

**Curated "Top 10" lists ($6.99 each):**
- "Top 10 Hidden Gem All Inclusive Resorts"
- "Top 10 Party All Inclusive Resorts"
- "Top 10 most Exclusive resorts in the world"
- "Top 10 Family All Inclusives"

**High-ticket products ($199 each):**
- "LIFETIME Travel Vault Access" (subtitle: "New Travel Deals added daily")
- "Make Money Online through Travel" — their travel-agent course

### Layer 3 — Bottom secondary links
- **Travel Agent Application** → CognitoForms — "Start Your Travel Career" (recruits agents for downline commissions)
- **Travel Business Course** → CognitoForms — "Step-by-step how we turned $200 into a 6 figure business"
- **Viator** → affiliate link — "Book your activities & excursions"

### Layer 4 — Email subscribe + reviews carousel

- Native Beacons email form (no Beehiiv visible — they use Beacons' built-in)
- Client Reviews carousel below

### Insights I had wrong before

| What I assumed | What J&G actually does |
|---|---|
| One $7 Caribbean Resort Guide | 25+ separate $6.99 PDFs, one per deal or one per curated list |
| Lead magnet drives email signups | No prominent free lead magnet at all. They monetize the audience directly with $6.99 impulse buys. |
| Concierge is buried | Concierge is **button 1**, above subscriptions and store |
| One product, one pitch per post | Every deal post they make has a corresponding $6.99 PDF on Beacons — the post is the marketing for that exact product |
| Beehiiv for email | Beacons-native email (not Beehiiv) |
| CognitoForms is a placeholder | They use CognitoForms intentionally — it's a free, robust intake form tool |

### Why this works at their scale

- **Impulse-price discipline.** $6.99 is below the threshold where most people deliberate. Travel-curious + scrolling + sees `$571 Jamaica all-inclusive deal` → tap → buy.
- **Subscription compounding.** $4.99/mo and $14.99/mo capture engaged followers as MRR.
- **Long-tail catalog.** Every old deal stays for sale forever. New deals add to the vault, never replace it.
- **Inventory = content.** Every social post they make becomes a permanent product. No separate product creation.
- **Two-tier high-ticket.** $199 vault and $199 course catch the highest-intent buyers without sales-call friction.

---

## 2. VacationPro Beacons — the model we're shipping

Mirror J&G's layout almost exactly. The deal-engine pipeline already produces 90% of the content needed.

### Profile
- **Handle:** `beacons.ai/vacationpro` (claim `vacationpro.co` as fallback)
- **Display name:** VacationPro
- **Avatar:** `public/logo.svg` → 400×400 PNG
- **Header background:** A wide Caribbean shot from Sanity gallery
- **Bio:** "Helping [X]K+ travelers find affordable Caribbean & tropical vacations ✈️" — fill in your real combined-follower number (354K → use "350K+")
- **Social icons:** email, TikTok, Instagram (skip Facebook in bio — match J&G)

### Layer 1 — Top 3 CTAs (in this exact order)

| Position | Button | Subtitle | Destination | Status |
|---|---|---|---|---|
| 1 | **Concierge Trip Planning** | Free VIP planning by VacationPro | CognitoForms inquiry **OR** `vacationpro.co/d/concierge` (we already have the landing-page route) | Build today |
| 2 | **Travel Club Membership** | Premium access $14.99/mo: weekly deals, full vault, priority concierge | Stripe checkout link, $14.99/mo recurring | Build week 2 |
| 3 | **SUBSCRIBE AND SAVE** | Weekly Travel Deals delivered | Stripe checkout link, $4.99/mo recurring | Build week 2 |

### Layer 2 — Travel Deal Vault

The storefront. Each entry is a $6.99 PDF + carousel/reel-style thumbnail. Goal: **5 products live today, 10 by end of week, 20+ by end of month.**

The PDF format (1 deal = 1 PDF) draws straight from the deal-engine output:
- **Cover** (1 page) — destination + price hook on a hero photo + brand lockup
- **The deal** (1–2 pages) — what's included, real dates, real flight estimates, full disclosures
- **How to book it** (1 page) — the specific resort, booking window, what to do next
- **About VacationPro** (1 page) — soft CTA to concierge / travel club

That's a ~5 page PDF per deal — produced as a byproduct of every deal post we already generate.

**Starter pricing:** $6.99 (match J&G exactly — they've tested into it). Test $9.99 on a "Top 10" SKU later.

**Day-1 product slate (ship these today):**

Pull from your existing Sanity deals — pick 5 with the strongest hooks:

1. *Punta Cana 5-night all-inclusive escape — $799* — $6.99
2. *Cancun all-inclusive + flights — $697* — $6.99
3. *Jamaica adults-only Montego Bay — $571* — $6.99
4. *Aruba 3-night couples package — $720* — $6.99
5. *Top 10 Caribbean Resorts Ranked by Trip Type — 2026* — $6.99 (the curated list — this is the "Caribbean Resort Guide" I was originally drafting, but as a $6.99 SKU not a $7 hero product)

### Layer 3 — High-ticket items (bottom of vault)

- **LIFETIME VacationPro Vault Access — $199** (every current + future deal PDF, plus weekly new drops)
- *(Future)* **The VacationPro Playbook — How I Built This — $199** — the operator course. Build later once the volume justifies it.

### Layer 4 — Secondary links

- **Become a Travel Agent with VacationPro** → CognitoForms — "Start your travel career under VacationPro." (Once you have downline-commission terms with World Via Pro.)
- **Viator** → affiliate — "Book your tours & excursions"
- *(Future)* Amazon Associates storefront for travel gear

### Layer 5 — Email subscribe + reviews

- Native Beacons email form
- 5–10 client reviews from past Tristar / concierge clients (gather these — strongest social proof we can ship)

---

## 3. The killer integration with the deal engine

This is the part that makes our setup ridiculous:

```
       Sanity deal (one row)
              │
              ▼
         generate.py
       (already built)
              │
   ┌──────────┼──────────┬─────────────┐
   ▼          ▼          ▼             ▼
static.jpg carousel/  reel-9x16.mp4   deal.pdf  ← NEW: render same data to PDF
   │          │          │             │
   ▼          ▼          ▼             ▼
 Publer (social)        Beacons (paid PDF)
   │                      │
   ▼                      ▼
Free reach            $6.99 buy
   │                      │
   └────────┬─────────────┘
            ▼
     Comment KEYWORD
            │
            ▼
       ManyChat DM
            │
            ▼
     vacationpro.co/d/keyword
            │
            ▼
   ┌────────┴────────┐
   ▼                 ▼
GHL/Tristar       World Via Pro
  ($250/lead)    booking (90/10)
```

**One deal → one social post → one PDF for sale → one lead capture funnel.** The social post sells the PDF, the PDF sells the booking. We already produce the first three legs; the PDF is the only new render path, and it's a tiny extension of the templating module.

---

## 4. Launch sequence — today

### Pre-launch (this morning, ~1h)
- [ ] Sign up for `beacons.ai/vacationpro` (Pro plan — strips the "Made with Beacons" footer)
- [ ] Set profile, avatar, bio, header image
- [ ] Add the three social icons (email, TikTok, Instagram)
- [ ] Add Layer 1 button #1: **Concierge Trip Planning** — point to a CognitoForms intake (free) OR your existing `/d/concierge` route (decide which lands faster today)

### Build today (~2–3h)
- [ ] **Extend the deal-engine pipeline with a PDF render path** — a new format `pdf` alongside `static`, `carousel`, `reel`. Same Sanity input, new Jinja template, output goes to `Brand/deal-posts/{slug}/deal.pdf`. I'll scaffold this in a new branch parallel to PR #4.
- [ ] Render the first 5 deal PDFs from the slate above
- [ ] Upload each as a $6.99 product to Beacons' shop module
- [ ] Add the "Top 10 Caribbean Resorts" curated PDF (mostly editorial — I'll draft it)
- [ ] Add the LIFETIME Vault Access SKU at $199 (placeholder — actual content is "all current + future deal PDFs")

### Defer to week 2
- Stripe subscription setup ($4.99/mo and $14.99/mo) — needs a Stripe Connect account and price IDs configured
- Travel Agent Application CognitoForms — needs your World Via Pro downline terms
- Reviews carousel — needs you to gather 5–10 testimonials

### Activation posts (today)
- [ ] Update bio link on TikTok, IG, FB to the new Beacons URL
- [ ] Post the launch announcement (one reel covering the vault, one carousel, one FB text post — drafts below)
- [ ] DM the announcement to your top 10 most engaged followers

---

## 5. Launch post drafts

### TikTok / IG Reel (30 sec)

**Title overlay (frame 1):** "I'm putting every deal I find into a vault."

**Voiceover:**
> "Here's what I'm doing. Every Caribbean and tropical deal I post — exact resort, exact dates, exact booking link — is now in my Travel Deal Vault. Each one's $6.99. Or join the monthly Travel Club, get the whole vault, every new deal, and priority concierge for $14.99 a month. Link in bio. First five deals are live right now."

**On-screen text rotation:** EVERY DEAL / VAULT / $6.99 EACH / WEEKLY DROPS / LINK IN BIO

**End frame:** "VacationPro · Link in bio" on Hero Green

### Instagram carousel (5 slides, 4:5)

| # | Content |
|---|---|
| 1 | "The VacationPro Travel Deal Vault is open." Hero photo. |
| 2 | "Each deal: $6.99." 5 bullets: Resort name + price · Real travel dates · Flight estimates · How to book · Booking-window discipline |
| 3 | "Or get the whole vault." 3 bullets: $14.99/mo · Every deal · Priority concierge |
| 4 | "5 deals live today." List: Punta Cana $799 · Cancun $697 · Jamaica $571 adults-only · Aruba $720 · Top 10 Resorts ranked |
| 5 | CTA: "Link in bio. Drops weekly." Hero Green. |

### Facebook post

> The VacationPro Travel Deal Vault is open. Every Caribbean and tropical deal I find — exact resort, dates, booking link — is now a $6.99 download. Or join the Travel Club at $14.99/mo and get everything: every current deal, every new drop, priority concierge. First five deals are live right now. Link below.

(Pin the Beacons link as the first comment.)

---

## 6. After-launch metrics (week 1)

| Metric | Target |
|---|---|
| Beacons page views | 3,000+ |
| Vault product sales | 50+ at $6.99 = $350+ |
| Concierge inquiries | 15+ |
| Email signups | 200+ |
| Top product by units | Identify it; build 3 more in that style |

If a single $6.99 product breaks 100 sales in week 1, that's the format we double down on (specific deal vs curated list).

---

## 7. Next builds (Sept 1 target)

To hit $10k/mo MRR by Sept 1 at your audience scale:

| Week | Net-new |
|---|---|
| W1 | Beacons live, 5 deal PDFs, concierge form, launch posts |
| W2 | Stripe subscriptions live ($4.99/mo + $14.99/mo); 10+ PDFs in the vault |
| W3 | 15+ PDFs; first sponsorship pitch sent; Beehiiv weekly newsletter wired to subscribers |
| W4 | 20+ PDFs; reviews carousel populated; Travel Agent Application live |
| W5–W12 | Weekly cadence: 4-5 new deal PDFs per week, every social post drives a vault sale, concierge volume scales |

**Hitting J&G's ~25 product baseline takes 4–6 weeks at our cadence. With your reach, that's the foundation that makes $10k/mo MRR realistic by end of summer.**

---

*Companion deliverables to ship today:*
- The deal-engine PDF render path (new format added to `generate.py`)
- The first 5 deal PDFs from the slate
- The "Top 10 Caribbean Resorts" curated PDF
- Launch post drafts (above)
