# Deal Post Templates — Design Spec

*Created 2026-05-14. Track 1 of the VacationPro deal engine (see `Strategy/vacationpro-deal-engine-strategy.md`). Scope: the 4:5 deal static and 4:5 deal carousel generators. The 9:16 reel generator is a separate follow-up sub-project (tooling decided: Hyperframes).*

---

## 1. Purpose

The deal engine's content machine posts one specific tropical/Caribbean package per post: real destination, real price, a comment-keyword CTA. This sub-project builds the two image formats that carry those posts:

- **Deal static** — a single 4:5 image.
- **Deal carousel** — a multi-slide 4:5 carousel.

Both are generated from a deal's content in Sanity, styled in the VacationPro brand system, and output Publer-ready. The 9:16 reel is out of scope here.

---

## 2. Decisions locked in brainstorming

- **Scope:** image templates first (static + carousel). Reel is a separate sub-project, Hyperframes tooling.
- **Home:** a new `Brand/deal-posts/` directory. The existing `Brand/ads/_static_ads_gen.py` (Meta paid-ads generator) stays untouched.
- **Content source:** Sanity, queried by deal slug, over Sanity's HTTP/GROQ API. The website and the social posts stay in sync off one source of truth.
- **Imagery:** the deal's real `heroImage`/`galleryImages`; Gemini-generated background as a fallback when a needed image is missing.
- **Rendering:** unified — both formats are HTML/CSS templates rendered to 4:5 JPEGs via Playwright. A static is a one-frame "carousel." One template language, one render path, one stylesheet. The static and the carousel's slide 1 render from the same partial so they can never drift.
- **Language:** Python, consistent with the rest of `Brand/` (the existing carousel generator, static-ad generator, Playwright renderer, and Gemini scripts are all Python).

---

## 3. Pipeline

Per deal:

1. **Input** — a deal slug, the comment keyword, the formats to render (`static`, `carousel`, or both). Optional: a flight-estimate string.
2. **Fetch content** — query Sanity by slug for: title, destination, price, originalPrice, savingsPercent, heroImage, galleryImages, whatsIncluded, travelDates, duration, bookingWindow, disclaimer.
3. **Resolve imagery** — use the deal's real `heroImage`/`galleryImages`; if a needed image is missing, generate a Gemini background (reusing the existing Gemini call pattern from `Brand/ads/_static_ads_gen.py`).
4. **Build HTML** — inject content into the static and/or carousel templates, both styled by the shared `deal-styles.css`.
5. **Render** — Playwright renders each 4:5 frame (1080×1350) to JPEG at q=85 (compressed, Publer-ready — PNGs over 5MB cause Publer SSL upload errors).
6. **Write meta.json** — caption draft in VacationPro voice, the keyword, the format list, output paths, suggested scheduling.

**Output** lands in `Brand/deal-posts/{deal-slug}/`: `static-4x5.jpg`, `carousel/slide-01.jpg`…`slide-NN.jpg`, `meta.json`.

**Two run modes:**
- Single deal: `python generate.py --slug punta-cana-3n --keyword PUNTACANA --formats static,carousel`
- Batch: `python generate.py --batch path/to/deal-sheet.csv` — loops every row. This is what step 4 ("assembly") of the weekly-batch SOP (`Strategy/vacationpro-weekly-batch-workflow.md`) calls.

---

## 4. The templates

All frames are **4:5, 1080×1350**. One shared stylesheet, `templates/deal-styles.css`, holds every brand token so the brand system lives in exactly one place.

### Brand tokens (from `Brand/foundations/`)

- **Colors:** Hero Green `#4ac850`, Forest `#0f2e1a`, Cream `#fff8ec`, Amber `#f59e0b`, White `#ffffff`.
- **Font:** Inter (weights 500–900).
- **Logo:** the real `public/logo-white.svg`, embedded verbatim (never a hand-transcribed path, never a generic dot). Constrain its display size with CSS (`.mark svg { width:100%; height:100% }`) — the SVG file carries its own `width`/`height` that must be overridden.
- **Photo treatment:** full-bleed image with a forest-toned bottom scrim — `linear-gradient(180deg, rgba(15,46,26,0) 28%, rgba(15,46,26,0.55) 55%, rgba(15,46,26,0.95) 100%)`.

### `deal-static.html` — a single 4:5 frame

- Full-bleed real resort photo + forest scrim.
- Brand lockup (logo + `VacationPro` wordmark) pinned top-left.
- Green eyebrow: `DEAL DROP · {DESTINATION}`.
- Inter-900 headline: the deal hook (e.g. "Punta Cana, 5 nights").
- Amber price pill: `${price}` with `${originalPrice}` struck through and `{savingsPercent}% off`.
- Hero Green CTA pill: `Comment {KEYWORD} →`.

### `deal-carousel.html` — multiple 4:5 slides

Proposed 5-slide structure (slide count flexes — see below):

1. **Hook** — rendered from the *same partial* as `deal-static.html`. Photo + headline + price pill + CTA pill.
2. **What's included** — the `whatsIncluded` list from Sanity, green-check list over a photo + scrim.
3. **The details** — travel dates, duration, booking window, flight estimate (if provided). Scannable label/value rows.
4. **The catch** — the `disclaimer` / fine print, stated plainly. The brand voice non-negotiable is "surface the catch," so it gets its own slide. Skipped when the deal has no meaningful catch (carousel renders 4 slides instead of 5). The generator never renders an empty slide.
5. **CTA** — solid Hero Green slide: `Comment {KEYWORD}` + one line on what they get ("and I'll send you the link to book").

### CSS specificity note (caught during mockup)

A blanket `.frame > * { position:relative }` rule (intended to lift content above the photo) will silently override `position:absolute` on the photo layer and the brand lockup — equal specificity, later rule wins. The templates must scope that rule to exclude the absolutely-positioned layers (e.g. `.frame > *:not(.photo):not(.brand)`), or lift content via an explicit content wrapper instead. This bug produced a zero-height photo and a mis-placed logo in the mockup; the real templates must not reproduce it.

---

## 5. Modules

Each module has one responsibility and a clear interface, so it can be understood and tested on its own.

| File | Responsibility |
|---|---|
| `Brand/deal-posts/generate.py` | Entrypoint. Parses args, orchestrates single + batch runs, wires the modules together. |
| `Brand/deal-posts/sanity_client.py` | Fetch a deal by slug via Sanity's HTTP/GROQ API. Returns a typed deal dict. |
| `Brand/deal-posts/imagery.py` | Resolve imagery: prefer the deal's real `heroImage`/`galleryImages`; Gemini-generate a background when one is missing. |
| `Brand/deal-posts/render.py` | The Playwright → 4:5 JPEG renderer (q=85). Shared by both formats. |
| `Brand/deal-posts/captions.py` | Generate the caption draft in VacationPro voice; assemble `meta.json`. |
| `Brand/deal-posts/templates/deal-styles.css` | All brand tokens and shared component styles. |
| `Brand/deal-posts/templates/deal-static.html` | The static / carousel-slide-1 template (one shared partial). |
| `Brand/deal-posts/templates/deal-carousel.html` | The multi-slide carousel template. |

**Output (generated, not committed as source):** `Brand/deal-posts/{deal-slug}/static-4x5.jpg`, `Brand/deal-posts/{deal-slug}/carousel/slide-NN.jpg`, `Brand/deal-posts/{deal-slug}/meta.json`.

---

## 6. Inputs and data shapes

### Deal content (from Sanity, by slug)

The Sanity `deal` schema already provides everything needed: `title`, `shortDescription`, `heroImage`, `galleryImages`, `whatsIncluded`, `travelDates`, `duration`, `bookingWindow`, `price`, `originalPrice`, `savingsAmount`, `savingsPercent`, `destination`, `disclaimer`.

### Per-run inputs (not in Sanity)

- **keyword** — the comment keyword for the CTA. Comes from the weekly deal sheet / the `deal_keywords` registry. Passed as `--keyword` (single mode) or a column in the deal-sheet CSV (batch mode).
- **flight estimate** — optional string (e.g. "flights from major US airports from $150pp"). Sanity has no field for it; passed as `--flight-estimate` or an optional deal-sheet column. When absent, the "details" slide simply omits that line.

### `meta.json` (output)

Per deal: `slug`, `keyword`, `formats` rendered, `caption` (VacationPro voice draft), output file paths, suggested scheduling notes.

---

## 7. Caption voice

`captions.py` produces the caption draft following the locked VacationPro caption rules: 45 words or fewer total, body 15 words or fewer, hook in the "[Topic]… [reframe]" shape, CTA "Comment {KEYWORD} and I'll send you…". No em dashes or en dashes (project-wide writing rule).

---

## 8. Out of scope

- **The 9:16 reel generator** — separate sub-project, Hyperframes tooling, its own spec.
- **Publer scheduling** — `meta.json` carries scheduling hints; the actual scheduling is a separate step (the existing Publer flow / weekly-batch SOP step 5).
- **The `deal_keywords` registry and ManyChat wiring** — that is Track 2, already built (PR #2).
- **Refactoring `Brand/ads/_static_ads_gen.py`** — the paid Meta-ads generator stays as-is.

---

## 9. Success criteria

- `python generate.py --slug <slug> --keyword <KW> --formats static,carousel` produces `static-4x5.jpg`, a `carousel/` of 4–5 slides, and `meta.json` in `Brand/deal-posts/<slug>/`.
- Every frame is 1080×1350, JPEG q=85, under the Publer size threshold.
- The static and the carousel's slide 1 are pixel-identical (same partial).
- Brand tokens (colors, Inter, real logo, scrim) match `Brand/foundations/`.
- Batch mode renders a full weekly deal sheet in one run.
- Imagery falls back to Gemini cleanly when a deal lacks a usable photo.
