# Carousel Batch 1 — Production Plan

**Spec:** [2026-04-18-carousel-system-design.md](../specs/2026-04-18-carousel-system-design.md)
**Goal:** Produce 10 carousels (2 weeks of daily posts) for VacationPro on FB + IG.
**Cadence:** 1 carousel/day, posted simultaneously to FB + IG.
**Photo sourcing:** Mix — AI (Nano Banana) for covers/CTAs/hidden-gem spotlights; Unsplash for ranked-entry resort photos.

---

## Batch 1 Content Matrix

Two full 5-post mix cycles = 10 carousels.

| # | Date (ET) | Pillar | Type | Working Hook |
|---|-----------|--------|------|--------------|
| 1 | 2026-04-19 | Ranked Resorts | Engagement | Top 10 adults-only all-inclusives in the Caribbean |
| 2 | 2026-04-20 | Budget / Value | Engagement | 7 all-inclusives under $300/night that feel like $1,000 |
| 3 | 2026-04-21 | Ranked Resorts | Engagement | Ranked: the 8 best all-inclusives for couples in Jamaica |
| 4 | 2026-04-22 | Audience-Specific | Engagement | 6 best all-inclusives for first-time travelers in 2026 |
| 5 | 2026-04-23 | Hidden Gem | **Lead gen** | The adults-only resort in the DR nobody's talking about |
| 6 | 2026-04-24 | Ranked Resorts | Engagement | Top 10 swim-up suite resorts in the Caribbean |
| 7 | 2026-04-25 | Budget / Value | Engagement | 7 Caribbean all-inclusives under $250/night |
| 8 | 2026-04-26 | Ranked Resorts | Engagement | Ranked: 8 best family all-inclusives in the Caribbean |
| 9 | 2026-04-27 | Audience-Specific | Engagement | 6 best all-inclusives for 50+ homeowners in 2026 |
| 10 | 2026-04-28 | Hidden Gem | **Lead gen** | This Jamaica resort is a $400/night steal — and nobody's booking it |

**Note:** Per Brendan's ShipSticks "no Mexico" rule — that applies to ShipSticks only. VacationPro carousels CAN include Mexico (core all-inclusive market). But Batch 1 intentionally favors Caribbean / Jamaica / DR to test demand before doubling down.

---

## Phase 1 — Setup (do once, applies to all 10)

### Task 1.1: Confirm ManyChat keywords

**Action:** Pick 2 keywords for the lead-gen posts (#5 and #10). Keywords should be single word, all-caps, memorable.

**Proposed:**
- Post #5 → `PARADISE`
- Post #10 → `STEAL`

**Verify:** each keyword maps to the existing landing-page-signup ManyChat flow. If the flow is generic (one landing page for all), use any keyword. If per-post magnets, pick the right flow for each.

### Task 1.2: Prepare rendering environment

**Action:** Confirm the existing `Brand/templates/carousel.html` renders to PNG.

Open the file in a browser at 2x zoom to confirm slides look correct:
```bash
open /Users/brendanobrien/Documents/Claude/vacationpro/Brand/templates/carousel.html
```

Install Puppeteer (one-time) if not already, for HTML → PNG batch rendering:
```bash
cd /Users/brendanobrien/Documents/Claude/vacationpro && npm list puppeteer || npm install --save-dev puppeteer
```

### Task 1.3: Add NEW slide archetypes to carousel.html

Add these slide variants to `Brand/templates/carousel.html` (extend existing CSS/markup):

**a) Ranked entry with Amber rank badge:**
```html
<div class="slide">
  <div class="slide-photo" style="background-image: url('[RESORT_PHOTO]')"></div>
  <div class="rank-badge">#10</div>
  <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
  <h1>[Resort Name]</h1>
  <div class="body" style="color:#fff8ec;margin-bottom:16px;">[Location]</div>
  <div class="body">[1-line "why it's here" hook]</div>
</div>
```

CSS addition:
```css
.rank-badge {
  position: absolute; top: 80px; left: 80px; z-index: 2;
  font-size: 160px; font-weight: 900; color: #f59e0b;
  letter-spacing: -0.03em; line-height: 1;
  text-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
```

**b) CTA — ManyChat comment keyword:**
```html
<div class="slide slide-green">
  <div class="eyebrow">GET THE GUIDE</div>
  <h1>Comment<br>"[KEYWORD]"<br>for the full guide.</h1>
  <div class="body">We'll DM you the resorts, prices, and booking windows.</div>
  <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
</div>
```

**c) CTA — Save (engagement):**
```html
<div class="slide slide-green">
  <div class="eyebrow">SAVE THIS POST</div>
  <h1>Save this for<br>your next trip.</h1>
  <div class="body">Follow @vacationpro for more all-inclusive finds.</div>
  <div class="brand-footer"><div class="brand-dot"></div>VacationPro</div>
</div>
```

Commit:
```bash
git -C /Users/brendanobrien/Documents/Claude/vacationpro add Brand/templates/carousel.html
git -C /Users/brendanobrien/Documents/Claude/vacationpro commit -m "feat(brand): add ranked-entry and ManyChat CTA slide variants"
```

### Task 1.4: Build HTML → PNG render script

Create `vacationpro/scripts/render-carousel.mjs`:

```javascript
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const [,, htmlPath, outDir] = process.argv;
if (!htmlPath || !outDir) { console.error('usage: node render-carousel.mjs <html> <outDir>'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
await page.goto('file://' + path.resolve(htmlPath));
const slides = await page.$$('.slide');
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: path.join(outDir, `slide-${String(i+1).padStart(2,'0')}.png`) });
}
await browser.close();
console.log(`Rendered ${slides.length} slides to ${outDir}`);
```

Test:
```bash
cd /Users/brendanobrien/Documents/Claude/vacationpro && node scripts/render-carousel.mjs Brand/templates/carousel.html /tmp/carousel-test
open /tmp/carousel-test
```

Expected: PNG files slide-01.png through slide-N.png, each 2160×2160 (2x).

---

## Phase 2 — Per-Carousel Production (repeat 10x)

For **each** of the 10 carousels, follow this loop. Estimate: ~45 min per carousel.

**Working directory convention:** `vacationpro/Brand/carousels/2026-04-NN-[slug]/`

### Step 2.1: Create working folder + content brief

```bash
mkdir -p /Users/brendanobrien/Documents/Claude/vacationpro/Brand/carousels/2026-04-19-top-10-adults-caribbean
```

Create `brief.md` in that folder with:
- Final hook headline
- List of resort entries (name, location, "why it's here" line, price band)
- ManyChat keyword (if lead gen)
- Caption draft

### Step 2.2: Source photos

**For ranked-entry slides (engagement posts):**
- Use Unsplash. Search: `[resort name]`, `[destination] resort`, `[destination] pool`, `adults only resort`
- Aim for 1600px+ wide, high saturation, water/pool dominant
- Save to `<carousel-folder>/photos/slide-NN.jpg`
- Log source URL + license in `<carousel-folder>/photos/SOURCES.md`

**For hidden-gem / spotlight slides (lead gen posts):**
- Use Nano Banana (AI) for a hero shot of the resort type (can't AI a specific real resort's lobby)
- Prompt template: `luxury [adults-only/family] all-inclusive resort in [region], [specific scene: swim-up suite / infinity pool / beachfront], golden hour, professional travel photography, 4K`
- Save output to `<carousel-folder>/photos/slide-NN.jpg`

### Step 2.3: Build slides HTML

Copy `Brand/templates/carousel.html` to `<carousel-folder>/carousel.html`, then edit:
- Replace cover slide: eyebrow + hook headline
- Replace each `.slide-photo` `background-image` URL with local photo path
- Fill ranked entry text (name, location, hook)
- Replace final slide with correct CTA variant (Save for engagement, ManyChat keyword for lead gen)

### Step 2.4: Render PNGs

```bash
cd /Users/brendanobrien/Documents/Claude/vacationpro && node scripts/render-carousel.mjs Brand/carousels/2026-04-19-top-10-adults-caribbean/carousel.html Brand/carousels/2026-04-19-top-10-adults-caribbean/out
```

Open the output folder and eyeball every slide:
- Text overlap? Bump font size or move.
- Photo too bright? Darken gradient.
- Rank badge cuts off? Reposition.

### Step 2.5: Write caption

In `<carousel-folder>/caption.txt`, use the framework from spec:

```
[Hook line repeating headline promise]

[2–3 lines context]

[Engagement posts]: Save this for your next trip. Which one's going on your list?
[Lead gen posts]:   Comment "KEYWORD" and I'll DM you the full breakdown.

#allinclusive #[region] #caribbean #vacationpro #traveltips
```

### Step 2.6: Schedule via Publer

Use the Publer MCP (`mcp-servers/publer/`) to schedule the post:
- **Accounts:** VacationPro FB page + VacationPro IG
- **Post type:** Carousel (multi-image)
- **Images:** all PNGs from `out/` in order
- **Caption:** contents of `caption.txt`
- **Scheduled time:** target date at primary slot (recommend 11am ET — highest engagement window from existing data)

Confirm the post appears in Publer queue.

### Step 2.7: For lead-gen posts — wire ManyChat

For carousels #5 and #10:
- Verify the keyword (`PARADISE` / `STEAL`) is active in ManyChat
- Confirm the auto-DM flow points to the correct landing page
- Test by commenting the keyword on the scheduled post preview (if available)

### Step 2.8: Commit

```bash
cd /Users/brendanobrien/Documents/Claude/vacationpro
git add Brand/carousels/2026-04-19-top-10-adults-caribbean
git commit -m "content: carousel #1 - top 10 adults-only caribbean"
```

---

## Phase 3 — QA + Launch Readiness

### Task 3.1: Batch preview

After all 10 are rendered, review them together:
```bash
open /Users/brendanobrien/Documents/Claude/vacationpro/Brand/carousels/
```

Check for:
- Visual consistency (fonts, colors, rank-badge placement)
- Headline variety (no two covers feeling identical)
- Photo quality (no blurry or off-brand shots)
- No Mexico in Batch 1 (per content matrix above)

### Task 3.2: Publer queue check

In Publer, verify the 10 posts are scheduled for 2026-04-19 through 2026-04-28, one per day, same time slot, both FB and IG.

### Task 3.3: ManyChat smoke test

Comment `PARADISE` on a live VacationPro post (any one) that uses the same flow — confirm the DM fires and the landing page link works.

### Task 3.4: Launch-day plan

On 2026-04-19:
- Confirm carousel #1 published on both FB and IG
- Check first 2 hours of engagement — save rate, comments, reach
- Note which hook format performs best for Batch 2 planning

---

## Phase 4 — Post-Batch Review (2026-04-29)

After the 10th carousel posts:

1. Pull metrics per carousel (reach, saves, shares, ManyChat keyword hits for #5 and #10)
2. Rank top 3 and bottom 3 by saves/reach
3. Document learnings in `Brand/carousels/BATCH-1-REVIEW.md`
4. Decide Batch 2: double down on top-performing pillars, drop or fix bottom performers

---

## Open Items / Dependencies

- [ ] ManyChat keyword / flow mapping confirmed (Task 1.1) — blocker for carousels #5 and #10
- [ ] Puppeteer installed (Task 1.2) — blocker for all rendering
- [ ] Unsplash sourcing workflow acceptable (no paid stock subscription needed)
- [ ] Nano Banana quota available for ~4-6 AI image generations

---

## Notes

- **No Mexico in Batch 1** by design (test Caribbean/Jamaica/DR demand first). This is not the ShipSticks "no Mexico" rule — VacationPro is allowed to feature Mexico in future batches.
- **Countdown order** for ranked lists (#10 → #1) is a deliberate swipe-through driver.
- **AI photos only for hidden-gem spotlights** because specific ranked resorts need real photos for credibility.
