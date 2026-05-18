# VacationPro Beacons Launch Pack

*Everything you need to launch the storefront today. Six PDFs ready in [`pdfs/`](pdfs/), product copy below, launch post drafts below, day-of checklist below.*

**Format:** 2-page sell-sheets modeled on the actual Jane & Gigi product (verified at `janeandgigi.my.canva.site/travel-deal-st-lucia-royalton`). Page 1 = the deal (price hero + amenities + booking link). Page 2 = "how to book it yourself like a travel advisor" (best travel dates + best departure airports + flight tips + booking discipline). The Top 10 SKU is the only longer-format product in this batch — it's a curated list, not a deal sheet.

---

## One thing to do before uploading: add your affiliate booking links

The 5 deal PDFs render with a "Contact concierge to book" fallback by default — that's so you can ship today. For each deal, once you have the affiliate URL ready (Booking.com / Expedia checkout pre-loaded with the room and dates), re-render that one deal with:

```bash
cd Brand/deal-posts
python3 generate.py --slug <slug> --keyword <KEY> --formats pdf \
  --booking-link "https://www.expedia.com/checkout/session/...your-affiliate-link..."
```

That bakes the tap-able **Accommodation: {resort}** button on page 1 into the PDF. Then re-upload to Beacons (Beacons supports product file updates without changing the URL). Same workflow J&G uses — direct affiliate revenue every time a buyer of the $6.99 PDF clicks through and books.

The Top 10 PDF doesn't use a booking link (it's a curated list).

---

## The 6 launch SKUs

All six PDFs are in `pdfs/` and ready to upload to Beacons. Each at **$6.99**.

| # | File | Title for Beacons | Keyword | Thumbnail source |
|---|---|---|---|---|
| 1 | `01-PUNTACANA-punta-cana-all-inclusive-3-nights.pdf` | **Punta Cana All-Inclusive · 3 Nights + Flights for Two — $697** | PUNTACANA | Use page 1 (cover) as JPG export |
| 2 | `02-CANCUN-cancun-all-inclusive-3-nights.pdf` | **Cancun All-Inclusive · 3 Nights + Flights for Two — $697** | CANCUN | Use page 1 (cover) as JPG export |
| 3 | `03-ARUBA-aruba-adults-only-3-nights.pdf` | **Aruba Adults-Only Escape · 3 Nights — $224** | ARUBA | Use page 1 (cover) as JPG export |
| 4 | `04-JAMAICA-montego-bay-all-inclusive.pdf` | **Montego Bay Jamaica · All-Inclusive 3 Nights + Flights — $697** | JAMAICA | Use page 1 (cover) as JPG export |
| 5 | `05-HAWAII-hilton-hawaiian-village.pdf` | **Hilton Hawaiian Village Waikiki · 25% Off — $307** | HAWAII | Use page 1 (cover) as JPG export |
| 6 | `06-TOP10-caribbean-resorts-ranked.pdf` | **Top 10 Caribbean Resorts Ranked by Trip Type — 2026** | TOP10 | Make a custom 1:1 cover or use the cover slide |

To grab a cover thumbnail from any PDF: open in Preview → File → Export → JPEG → 1024×1024 crop. Or screenshot the first page.

---

## Product copy for Beacons (paste into each listing)

### 1. Punta Cana All-Inclusive · $697

**Title:** Punta Cana All-Inclusive · 3 Nights + Flights for Two — $697

**Description (short):**
> The full deal in one PDF: resort name, exact dates, what's included, flight cities, and the booking window that saves the most. Plus the honest details and how to lock it in.

**Description (long, expand on Beacons):**
> Real Caribbean travel deal, real pricing, no fluff. This 5-page PDF lays out a complete Punta Cana all-inclusive package: 3 nights at the resort, round-trip airfare for two, airport transfers, unlimited meals and drinks, and the booking timing that saves you the most. Includes the catch (yes, every deal has one — we surface it on page 4), an FAQ on the questions everyone asks, and a step-by-step on how to book through VacationPro concierge if you want a hand. Instant download.

---

### 2. Cancun All-Inclusive · $697

**Title:** Cancun All-Inclusive · 3 Nights + Flights for Two — $697

**Description (short):**
> The full Cancun deal in one PDF: resort, dates, what's included, flight cities, booking window, the catch, FAQ, and how to book.

**Description (long):**
> The complete Cancun all-inclusive package in one download: 3 nights resort, flights for two, transfers, unlimited food and drink. The PDF includes the booking window (when this rate disappears), the honest catch on the deal, the questions you should ask before booking, and a step-by-step to lock it in. 5 pages, instant download.

---

### 3. Aruba Adults-Only Escape · $224

**Title:** Aruba Adults-Only Escape · 3 Nights — $224

**Description (short):**
> Aruba, 3 nights, adults-only, $224. The exact resort, the catch, and how to grab it before it's gone.

**Description (long):**
> One of the most under-the-radar adults-only deals in the Caribbean right now. Aruba, 3 nights, no kids, $224 per person. The 5-page PDF has the resort name, exact dates, what's included, the booking window (this one moves fast), the catch (we always tell you), and an FAQ. If you want help locking it in, the last page connects you to VacationPro concierge. Instant download.

---

### 4. Montego Bay Jamaica · $697

**Title:** Montego Bay Jamaica · All-Inclusive 3 Nights + Flights — $697

**Description (short):**
> Jamaica all-inclusive in Montego Bay. 3 nights, flights for two, everything in. The full deal in one PDF.

**Description (long):**
> Montego Bay all-inclusive at one of the best-reviewed resorts in the area. 3 nights, flights for two, transfers, unlimited food and drink. The PDF includes the resort, the dates, the booking window, the honest catch, the FAQ, and the step-by-step to book. 5 pages, instant download. If you want help with current dates or rooms, VacationPro concierge is on the last page.

---

### 5. Hilton Hawaiian Village Waikiki · $307

**Title:** Hilton Hawaiian Village Waikiki · 25% Off — $307

**Description (short):**
> Hawaii without the Hawaii price. Hilton Hawaiian Village Waikiki, 25% off, $307. The full deal in one PDF.

**Description (long):**
> Hawaii deals don't come this clean very often. Hilton Hawaiian Village Waikiki, 25% off, $307 per person. The 5-page PDF has the resort, the exact dates, what's included, the booking window before it disappears, the catch, and an FAQ. Last page is the concierge connect-line if you want help with rooms or the package details. Instant download.

---

### 6. Top 10 Caribbean Resorts Ranked by Trip Type — 2026

**Title:** Top 10 Caribbean Resorts Ranked by Trip Type — 2026

**Description (short):**
> Stop reading 50 review sites. 10 picks, ranked by trip type — couples, family, adults-only, honeymoon, group, hidden gem, no-passport-needed. Plus how we ranked them.

**Description (long):**
> The Caribbean has hundreds of all-inclusive resorts and most reviews are useless because the resort that ruins a couples trip can be perfect for a family of four. This 28-page guide breaks down our top 10 picks by trip type: couples, family, adults-only, honeymoon, group, hidden gem, and "no passport needed" US territories. Each pick includes who it's for, what makes it special, and the VacationPro pick (the specific room block or category we recommend). Instant download.

---

## Day-of launch checklist

### Pre-launch (this morning, ~1 hour)
- [ ] Sign up `beacons.ai/vacationpro` (Pro plan, ~$10/mo)
- [ ] Set profile: avatar = VacationPro logo, header = Caribbean wide shot, bio = "Helping 350K+ travelers find affordable Caribbean & tropical vacations ✈️"
- [ ] Add social icons (email, TikTok, Instagram — skip FB per J&G's pattern)
- [ ] Add Layer 1 buttons in this order:
  1. **Concierge Trip Planning** → CognitoForms intake or `vacationpro.co/concierge`
  2. **Travel Club Membership** → placeholder (deferred to W3)
  3. **Subscribe and Save** → placeholder (deferred to W3)

### Upload (1 hour)
- [ ] In Beacons admin → Store → New Product
- [ ] Upload each of the 6 PDFs as a separate product
- [ ] For each: paste the title + description from above, set price to $6.99, upload the cover thumbnail
- [ ] Save and publish all 6

### Bio swap (15 minutes)
- [ ] Update bio link on **TikTok** → `beacons.ai/vacationpro`
- [ ] Update bio link on **Instagram** → `beacons.ai/vacationpro`
- [ ] Update bio link on **Facebook** → `beacons.ai/vacationpro`
- [ ] Pinterest if you're using it (add the link to your profile)

### Launch posts (1 hour)
- [ ] Post TikTok launch reel (script below)
- [ ] Post Instagram carousel (slides below)
- [ ] Post Facebook text + carousel (copy below)
- [ ] Add 3-frame story on IG and FB: "New deal vault live. Tap the link in bio."
- [ ] DM the announcement to top 10 most engaged followers

### Watch (continuous, day 1)
- [ ] Check Beacons analytics every 2 hours
- [ ] Respond to every concierge DM inside 2 hours during waking hours
- [ ] Note which SKU sells first and which CTA is getting clicks

---

## Launch posts

### TikTok / IG Reel (30 sec)

**Title overlay (frame 1):** "I'm putting every travel deal I find into a vault"

**Voiceover:**
> "Here's what I'm doing. Every Caribbean and tropical deal I post — the resort, the dates, the booking link, the honest catch — is now in my Travel Deal Vault. Each one's six bucks. Six deals live right now, including an Aruba adults-only for $224 and Hawaii at 25% off. Link in bio. Or comment VAULT and I'll send it to you."

**On-screen text rotation (1–2 words at a time):**
> EVERY DEAL · IN ONE VAULT · $6.99 EACH · WEEKLY DROPS · LINK IN BIO

**End frame:** "VacationPro · Link in bio" on solid Hero Green

### Instagram carousel (5 slides, 4:5)

| # | Headline | Body |
|---|---|---|
| 1 | "The Travel Deal Vault is open." | "Every Caribbean and tropical deal, in one place. $6.99 each." (Hero photo background) |
| 2 | "What's inside each PDF" | "✓ Resort name & exact dates · ✓ What's included · ✓ Flight cities · ✓ Booking window · ✓ The catch · ✓ How to book" |
| 3 | "6 deals live today" | "Punta Cana $697 · Cancun $697 · Aruba adults-only $224 · Jamaica $697 · Hawaii 25% off $307 · Top 10 Resorts Ranked" |
| 4 | "Why $6.99?" | "Same price as a coffee. Saves you 4 hours of review-hopping and lets me keep dropping new deals every week." |
| 5 | "Link in bio." | "Or comment VAULT and I'll DM it." (Hero Green) |

### Facebook (text post)

> The VacationPro Travel Deal Vault is open. Every Caribbean and tropical deal I find — the resort, the dates, the booking link, the honest catch — is now a $6.99 download. Six deals live today including Aruba adults-only at $224 and Hawaii at 25% off ($307). One Top 10 Caribbean Resorts guide too. Link in comments.

Pin a comment with the Beacons link.

### Story frames (3 frames each on IG and FB)

| Frame | Visual | Text |
|---|---|---|
| 1 | Hero photo (Punta Cana beach) | "New: VacationPro Travel Deal Vault" |
| 2 | List of 6 SKUs | "6 deals live · $6.99 each · Tap link" |
| 3 | Beacons URL screenshot | "Link in bio → Get the vault" |

---

## What I'll have ready by tomorrow

- 5 more deal PDFs to push to Beacons (vault to 11 SKUs by end of W1)
- The Beehiiv welcome sequence drafts (5 emails)
- Concierge intake form spec (if you want to use `/d/concierge` on vacationpro.co instead of CognitoForms)
- Daily metrics dashboard template

Once you confirm Beacons is live and the bio links are swapped, I'll start rendering the W1 batch.
