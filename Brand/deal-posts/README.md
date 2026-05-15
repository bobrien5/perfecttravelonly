# Deal Post Generators — Workflow & SOP

Generates 4:5 (1080×1350) deal-post images for the VacationPro deal engine: a single static frame and a multi-slide carousel, both styled in the VacationPro brand system, both fed by a single Sanity deal slug.

This README is the operator-facing SOP. The design spec lives at [`docs/specs/2026-05-14-deal-post-templates-design.md`](../../docs/specs/2026-05-14-deal-post-templates-design.md); the implementation plan at [`docs/plans/2026-05-14-deal-post-templates.md`](../../docs/plans/2026-05-14-deal-post-templates.md).

---

## What it produces

For one deal slug:

```
Brand/deal-posts/{slug}/
├── static-4x5.jpg              ← single hook frame, IG/FB feed
├── carousel/
│   ├── slide-01.jpg            ← hook (visually identical to static-4x5.jpg)
│   ├── slide-02.jpg            ← what's included
│   ├── slide-03.jpg            ← the details (dates, length, flights, book-by)
│   ├── slide-04.jpg            ← the catch (only if the deal has a disclaimer)
│   └── slide-05.jpg            ← comment-keyword CTA (Hero Green frame)
└── meta.json                   ← caption draft, keyword, output paths, scheduling targets
```

The carousel skips the "catch" slide automatically when the deal has no disclaimer (so a 4-slide carousel is normal). The static and slide-01 render from the same Jinja macro so they never visually drift.

The `{slug}/` output folder is **gitignored** — generated on demand, never committed.

---

## Pipeline

```
                       ┌──────────────────────────────────────┐
                       │  Inputs                              │
                       │   • deal slug (--slug or CSV)        │
                       │   • keyword     (--keyword or CSV)   │
                       │   • formats     (default: both)      │
                       │   • flight_estimate (optional)       │
                       └──────────────┬───────────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │   generate.py         │  ← CLI orchestrator
                          └─────┬────────────┬────┘
                                │            │
              sanity_client.py  │            │  imagery.py
              ────────────────  ▼            ▼  ─────────────────────────
              GROQ over HTTP                   • pick real photos
              + slug validation                  (heroImage / gallery)
              → fetch_deal(slug)               • download → temp dir
                                                • Gemini fallback if missing
                                                • to_data_uri (base64)
                                │            │
                                ▼            ▼
                          ┌────────────────────────┐
                          │   templating.py        │  ← Jinja2 + macros
                          │   • render_static      │     deal-static.html
                          │   • render_carousel    │     deal-carousel.html
                          └────────────┬───────────┘     _macros.html
                                       │                 deal-styles.css
                                       ▼
                          ┌────────────────────────┐
                          │   render.py            │  ← Playwright → JPEG
                          │   • render_html_to_jpg │     1080×1350, q=85
                          └────────────┬───────────┘
                                       │
                          ┌────────────▼─────────────────────────┐
                          │   captions.py                        │
                          │   • build_caption (VacationPro voice)│
                          │   • build_meta (meta.json record)    │
                          └────────────┬─────────────────────────┘
                                       │
                                       ▼
                          ┌────────────────────────┐
                          │   Brand/deal-posts/    │
                          │     {slug}/            │
                          │       static-4x5.jpg   │
                          │       carousel/*.jpg   │
                          │       meta.json        │
                          └────────────┬───────────┘
                                       │
                                       ▼
                              Publer scheduling
                          (existing weekly flow)
```

---

## Prerequisites

- Python 3.9+
- Sanity credentials in `.env.local` at the repo root:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION`
  - `SANITY_API_WRITE_TOKEN` (the write token also grants read)
- Dependencies installed: `pip3 install -r Brand/deal-posts/requirements.txt`
- Playwright Chromium installed: `python3 -m playwright install chromium`
- Optional: `GEMINI_API_KEY` in the shell environment (only needed for the fallback path — when a deal has no usable photos in Sanity)

---

## Usage

### Single deal

```bash
cd Brand/deal-posts
python3 generate.py \
  --slug punta-cana-all-inclusive-escape \
  --keyword PUNTACANA \
  --formats static,carousel \
  --flight-estimate "from $180pp"
```

- `--slug`: the Sanity `deal.slug.current` value (kebab-case; the slug is validated and rejected if it contains anything else)
- `--keyword`: the ManyChat comment keyword (auto-uppercased)
- `--formats`: comma-separated, any of `static`, `carousel` (default: both)
- `--flight-estimate`: optional copy for the details slide; omit to skip that row

Output lands in `Brand/deal-posts/{slug}/`. Existing output for the same slug is overwritten.

### Batch (from the weekly deal sheet)

```bash
cd Brand/deal-posts
python3 generate.py --batch path/to/deal-sheet.csv
```

CSV columns (header row required):

| slug | keyword | formats | flight_estimate |
|---|---|---|---|
| `punta-cana-3n` | `puntacana` | `static,carousel` | `from $180pp` |
| `aruba-5n` | `aruba` | `carousel` | (blank) |

The batch is **per-deal error-isolated**: one bad deal logs `FAILED: ...` to stderr and the batch continues. The summary line tells you how many succeeded.

### Listing deal slugs

To pick a slug from Sanity:

```bash
npx tsx scripts/list-deals.ts          # if Node + tsx available
```

Or via Python (no shell env needed beyond `.env.local`):

```bash
cd Brand/deal-posts
python3 -c "
from sanity_client import build_deal_query
import os, urllib.parse, requests, config
config.load_env()
q = '*[_type==\"deal\"][0..20]{\"slug\": slug.current, title, heroImage}'
url = f'https://{os.environ[\"NEXT_PUBLIC_SANITY_PROJECT_ID\"]}.api.sanity.io/v{os.environ[\"NEXT_PUBLIC_SANITY_API_VERSION\"]}/data/query/{os.environ[\"NEXT_PUBLIC_SANITY_DATASET\"]}?query={urllib.parse.quote(q)}'
print(requests.get(url, headers={'Authorization': f'Bearer {os.environ[\"SANITY_API_WRITE_TOKEN\"]}'}).text)
"
```

---

## What's in `meta.json`

```json
{
  "slug": "punta-cana-all-inclusive-escape",
  "title": "Punta Cana All-Inclusive Escape",
  "keyword": "PUNTACANA",
  "destination": "Punta Cana",
  "price": 799,
  "travelDates": "May - September 2026",
  "formats": ["static", "carousel"],
  "outputs": {
    "static": "punta-cana-all-inclusive-escape/static-4x5.jpg",
    "carousel": [
      "punta-cana-all-inclusive-escape/carousel/slide-01.jpg",
      "punta-cana-all-inclusive-escape/carousel/slide-02.jpg",
      "punta-cana-all-inclusive-escape/carousel/slide-03.jpg",
      "punta-cana-all-inclusive-escape/carousel/slide-04.jpg",
      "punta-cana-all-inclusive-escape/carousel/slide-05.jpg"
    ]
  },
  "caption": "Punta Cana keeps selling out. This one hasn't yet. ...",
  "generated_at": "2026-05-15T...",
  "scheduling": {
    "platforms_by_format": {
      "static": ["facebook", "instagram"],
      "carousel": ["facebook", "instagram"]
    }
  }
}
```

The caption is a **draft** — review before posting. The voice rules are enforced (45-word cap, no em/en dashes), so it's safe to post as-is, but a quick human read keeps it natural.

`platforms_by_format` encodes the carousel-FB+IG-only rule structurally — downstream Publer scripting reads this rather than guessing, so a carousel can never accidentally route to TikTok.

---

## Integration with the weekly batch

This generator is **step 4 ("assembly")** of the weekly batch SOP (`Strategy/vacationpro-weekly-batch-workflow.md`). The full weekly flow:

1. **Deal intake** — fill the deal sheet (one row per deal you're publishing this week)
2. **Brief generation** — Claude drafts the scripts/captions/slide outlines per deal
3. **Visuals** — covered by *this generator* (downloads real Sanity photos; Gemini fallback if needed)
4. **Assembly** — `python3 generate.py --batch deal-sheet.csv` produces every deal's `static-4x5.jpg`, `carousel/slide-*.jpg`, `meta.json`
5. **Schedule** — push the JPEGs to Publer; the FB/IG split comes straight from `meta.json` → `platforms_by_format`
6. **Funnel sync** — register each row's keyword via the `vacationpro deal` CLI (Track 2; separate)

The reel format (9:16) is **out of scope** for this generator — it's a separate Track 1 sub-project (Hyperframes-based) coming later.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `KeyError: 'NEXT_PUBLIC_SANITY_PROJECT_ID'` | `.env.local` missing or unreadable | Check the file exists at repo root and contains the four Sanity vars |
| `ValueError: invalid slug: ...` | Slug isn't kebab-case lowercase | Use the slug exactly as stored in Sanity (`scripts/list-deals.ts`) |
| `ValueError: deal not found in Sanity response` | No deal document has that slug | Re-list deals; check for typos |
| `RuntimeError: no image available for role '...' and Gemini fallback failed` | Deal has no usable photo AND `GEMINI_API_KEY` isn't set | Either add a `heroImage` in Sanity or `export GEMINI_API_KEY=...` |
| `ValueError: caption is N words, over the 45-word limit` | The deal's destination or duration field is unusually long | Shorten the destination/duration in Sanity, or accept a smaller deal universe |
| Playwright errors `Executable doesn't exist` | Chromium not installed | `python3 -m playwright install chromium` |
| Output looks wrong / fonts default to Arial | Inter from Google Fonts didn't load (offline?) | Run while online; Inter loads from `fonts.googleapis.com` |
| `git status` shows `Brand/deal-posts/{slug}/...` files | The `.gitignore` block at line 58+ got modified | Check that `Brand/deal-posts/*` and its negations are intact |

---

## Tests

```bash
cd Brand/deal-posts
python3 -m pytest tests/ -v
```

33 tests cover the pure logic (Sanity query/parsing, caption rules, imagery resolution, templating, CLI/CSV parsing) and one integration test that exercises the Playwright renderer end-to-end. The full suite runs in about 2 seconds.

---

## File layout

```
Brand/deal-posts/
├── README.md                ← this doc
├── requirements.txt         ← Python deps
├── conftest.py              ← pytest path setup
├── config.py                ← .env.local loader
├── sanity_client.py         ← Sanity HTTP/GROQ client
├── imagery.py               ← real photos + Gemini fallback + base64 data URIs
├── templating.py            ← Jinja2 wrapper
├── render.py                ← Playwright → 1080×1350 JPEG
├── captions.py              ← caption draft + meta.json builder
├── generate.py              ← CLI orchestrator (single + batch)
├── templates/
│   ├── deal-styles.css      ← all brand tokens
│   ├── _macros.html         ← one Jinja macro per slide
│   ├── deal-static.html     ← static page
│   └── deal-carousel.html   ← one slide at a time
└── tests/                   ← pytest tests + fixtures
```

Source is **tracked**; per-deal output (`{slug}/`) is **gitignored** (regenerated on demand).
