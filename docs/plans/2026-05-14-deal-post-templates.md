# Deal Post Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `Brand/deal-posts/` Python generators that turn a Sanity deal into a 4:5 deal-static JPEG and a 4:5 multi-slide deal-carousel, Publer-ready.

**Architecture:** A pipeline of small Python modules. `sanity_client` fetches deal content over Sanity's HTTP/GROQ API. `imagery` resolves real photos (Gemini fallback) and embeds them as base64 data URIs. `templating` renders Jinja2 HTML templates (one shared `_macros.html` so the static *is* carousel slide 1). `render` rasterizes HTML to 1080×1350 JPEGs via Playwright. `captions` builds the caption draft and `meta.json`. `generate` is the CLI orchestrator with single-deal and batch modes.

**Tech Stack:** Python 3.9, Jinja2 (templating), Playwright sync API (rendering), `requests` (Sanity HTTP), `urllib` (Gemini, matching the existing pattern), pytest (tests).

**What already exists (reference, do not modify):** `Brand/ads/_static_ads_gen.py` (the Gemini `gen_image` call pattern), `Brand/carousels/_render_png.py` (the Playwright render pattern), `Brand/foundations/` (brand tokens), `public/logo-white.svg` (the real logo). The design spec is `docs/specs/2026-05-14-deal-post-templates-design.md`.

---

## File Structure

| File | Responsibility |
|---|---|
| `.gitignore` (modify) | Change `Brand/` → `Brand/*` + negations so `Brand/deal-posts/` source is tracked, rendered output stays ignored |
| `Brand/deal-posts/requirements.txt` (create) | Documents Python deps |
| `Brand/deal-posts/conftest.py` (create) | Empty — makes pytest add `Brand/deal-posts/` to `sys.path` |
| `Brand/deal-posts/config.py` (create) | `load_env()` — parses `.env.local` into `os.environ` |
| `Brand/deal-posts/sanity_client.py` (create) | `build_deal_query`, `parse_deal`, `fetch_deal` |
| `Brand/deal-posts/captions.py` (create) | `build_caption`, `build_meta` |
| `Brand/deal-posts/imagery.py` (create) | `pick_image_urls`, `to_data_uri`, `generate_fallback`, `ensure_local_images` |
| `Brand/deal-posts/templating.py` (create) | `render_static`, `render_carousel`, `carousel_slide_count` |
| `Brand/deal-posts/render.py` (create) | `render_html_to_jpg` (Playwright) |
| `Brand/deal-posts/generate.py` (create) | `parse_cli_args`, `run_single`, `run_batch`, `main` |
| `Brand/deal-posts/templates/deal-styles.css` (create) | All brand tokens + component styles |
| `Brand/deal-posts/templates/_macros.html` (create) | Jinja macros: `hook_frame`, `included_frame`, `details_frame`, `catch_frame`, `cta_frame` |
| `Brand/deal-posts/templates/deal-static.html` (create) | Static page = `hook_frame` in an HTML shell |
| `Brand/deal-posts/templates/deal-carousel.html` (create) | One slide's HTML shell, parameterized by which frame |
| `Brand/deal-posts/tests/test_*.py` (create) | pytest tests per module |
| `Brand/deal-posts/tests/fixtures/sanity_deal.json` (create) | A captured Sanity response for tests |

**Generated, never committed** (stays gitignored): `Brand/deal-posts/{deal-slug}/static-4x5.jpg`, `.../carousel/slide-NN.jpg`, `.../meta.json`.

**Test command (used throughout):** `cd Brand/deal-posts && python3 -m pytest tests/ -v`

---

## Task 1: Project scaffold

**Files:**
- Modify: `.gitignore`
- Create: `Brand/deal-posts/requirements.txt`, `Brand/deal-posts/conftest.py`, `Brand/deal-posts/config.py`, `Brand/deal-posts/tests/test_config.py`

- [ ] **Step 1: Adjust `.gitignore` so deal-posts source is tracked**

In `.gitignore`, find the line `Brand/` (under "Large binary marketing assets"). Replace that single line with this block:

```
# Large binary marketing assets (regenerate or store in cloud, not git)
Brand/*
!Brand/deal-posts/
Brand/deal-posts/*
!Brand/deal-posts/*.py
!Brand/deal-posts/*.txt
!Brand/deal-posts/templates/
!Brand/deal-posts/tests/
Brand/deal-posts/templates/*
!Brand/deal-posts/templates/*.html
!Brand/deal-posts/templates/*.css
Brand/deal-posts/tests/*
!Brand/deal-posts/tests/*.py
!Brand/deal-posts/tests/fixtures/
Brand/deal-posts/tests/fixtures/*
!Brand/deal-posts/tests/fixtures/*.json
```

This re-includes only `Brand/deal-posts/` *source* files. Per-deal output folders (`Brand/deal-posts/punta-cana/` etc.) match `Brand/deal-posts/*` and are not re-included by any rule, so they stay ignored.

- [ ] **Step 2: Verify the gitignore change**

Run: `cd /Users/brendanobrien/Documents/Claude/vacationpro && git check-ignore -v Brand/deal-posts/generate.py Brand/deal-posts/punta-cana/static-4x5.jpg Brand/carousels/_generator.py`
Expected: `generate.py` is NOT listed (tracked), `punta-cana/static-4x5.jpg` IS listed (ignored), `Brand/carousels/_generator.py` IS listed (still ignored). If `generate.py` shows as ignored, the gitignore block is wrong — fix before continuing.

- [ ] **Step 3: Install pytest**

Run: `pip3 install pytest`
Expected: pytest installs without error. Verify: `python3 -m pytest --version` prints a version.

- [ ] **Step 4: Create `Brand/deal-posts/requirements.txt`**

```
# Python deps for the deal-posts generators. Install: pip3 install -r requirements.txt
jinja2>=3.1
playwright>=1.40
requests>=2.30
pytest>=7.0
```

- [ ] **Step 5: Create `Brand/deal-posts/conftest.py`**

```python
# Presence of this file makes pytest add Brand/deal-posts/ to sys.path,
# so tests can `import sanity_client` etc. directly. Intentionally empty.
```

- [ ] **Step 6: Write the failing test for `config.load_env`**

Create `Brand/deal-posts/tests/test_config.py`:

```python
from pathlib import Path
import config


def test_load_env_parses_keys(tmp_path, monkeypatch):
    env = tmp_path / ".env.local"
    env.write_text('# comment\nFOO=bar\nQUOTED="baz qux"\nEMPTYLINE=\n\nWITHEQ=a=b\n')
    monkeypatch.delenv("FOO", raising=False)
    monkeypatch.delenv("QUOTED", raising=False)
    monkeypatch.delenv("WITHEQ", raising=False)
    config.load_env(env)
    import os
    assert os.environ["FOO"] == "bar"
    assert os.environ["QUOTED"] == "baz qux"
    assert os.environ["WITHEQ"] == "a=b"


def test_load_env_does_not_overwrite_existing(tmp_path, monkeypatch):
    env = tmp_path / ".env.local"
    env.write_text("FOO=fromfile\n")
    monkeypatch.setenv("FOO", "fromshell")
    config.load_env(env)
    import os
    assert os.environ["FOO"] == "fromshell"


def test_load_env_missing_file_is_silent(tmp_path):
    config.load_env(tmp_path / "nope.env")  # must not raise
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_config.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'config'`.

- [ ] **Step 8: Implement `Brand/deal-posts/config.py`**

```python
"""Loads .env.local into os.environ for the deal-posts generators.
Python (unlike Next.js) does not auto-load .env files."""
import os
from pathlib import Path


def load_env(env_path: Path | None = None) -> None:
    """Parse KEY=VALUE lines from .env.local into os.environ.
    Does not overwrite variables already set in the environment.
    Missing file is a silent no-op."""
    if env_path is None:
        # Brand/deal-posts/config.py -> Brand/deal-posts -> Brand -> repo root
        env_path = Path(__file__).resolve().parents[2] / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        os.environ.setdefault(key, val)
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_config.py -v`
Expected: PASS, 3 tests.

- [ ] **Step 10: Commit**

```bash
git add .gitignore Brand/deal-posts/requirements.txt Brand/deal-posts/conftest.py Brand/deal-posts/config.py Brand/deal-posts/tests/test_config.py
git commit -m "chore: scaffold Brand/deal-posts (gitignore, pytest, config)"
```

---

## Task 2: Sanity client

**Files:**
- Create: `Brand/deal-posts/sanity_client.py`
- Create: `Brand/deal-posts/tests/test_sanity_client.py`
- Create: `Brand/deal-posts/tests/fixtures/sanity_deal.json`

- [ ] **Step 1: Create the test fixture**

Create `Brand/deal-posts/tests/fixtures/sanity_deal.json` — a captured-shape Sanity query response:

```json
{
  "result": {
    "title": "Punta Cana All-Inclusive Escape",
    "slug": "punta-cana-all-inclusive-escape",
    "destination": "Punta Cana",
    "price": 799,
    "originalPrice": 1499,
    "savingsPercent": 47,
    "heroImage": "https://cdn.sanity.io/images/abc/production/hero.jpg",
    "galleryImages": [
      "https://cdn.sanity.io/images/abc/production/g1.jpg",
      "https://cdn.sanity.io/images/abc/production/g2.jpg"
    ],
    "whatsIncluded": ["Round-trip airfare", "Airport transfers", "Oceanview room", "Unlimited meals & drinks"],
    "travelDates": "May - September 2026",
    "duration": "5 nights",
    "bookingWindow": "Book by June 30, 2026",
    "disclaimer": "Price is per person based on double occupancy. Resort fees not included."
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `Brand/deal-posts/tests/test_sanity_client.py`:

```python
import json
from pathlib import Path
import pytest
import sanity_client

FIXTURE = Path(__file__).parent / "fixtures" / "sanity_deal.json"


def test_build_deal_query_targets_deal_type_and_slug():
    q = sanity_client.build_deal_query("punta-cana-3n")
    assert '_type=="deal"' in q
    assert 'slug.current=="punta-cana-3n"' in q
    assert "[0]" in q  # single document


def test_parse_deal_normalizes_fields():
    raw = json.loads(FIXTURE.read_text())
    deal = sanity_client.parse_deal(raw)
    assert deal["slug"] == "punta-cana-all-inclusive-escape"
    assert deal["destination"] == "Punta Cana"
    assert deal["price"] == 799
    assert deal["originalPrice"] == 1499
    assert deal["savingsPercent"] == 47
    assert deal["heroImage"] == "https://cdn.sanity.io/images/abc/production/hero.jpg"
    assert deal["galleryImages"] == [
        "https://cdn.sanity.io/images/abc/production/g1.jpg",
        "https://cdn.sanity.io/images/abc/production/g2.jpg",
    ]
    assert deal["whatsIncluded"][0] == "Round-trip airfare"
    assert deal["disclaimer"].startswith("Price is per person")


def test_parse_deal_raises_when_not_found():
    with pytest.raises(ValueError, match="not found"):
        sanity_client.parse_deal({"result": None})


def test_parse_deal_defaults_missing_optional_fields():
    raw = {"result": {"title": "X", "slug": "x", "destination": "X", "price": 100,
                       "originalPrice": 200, "savingsPercent": 50, "heroImage": "h"}}
    deal = sanity_client.parse_deal(raw)
    assert deal["galleryImages"] == []
    assert deal["whatsIncluded"] == []
    assert deal["disclaimer"] == ""
    assert deal["travelDates"] == ""
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_sanity_client.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'sanity_client'`.

- [ ] **Step 4: Implement `Brand/deal-posts/sanity_client.py`**

```python
"""Fetches a VacationPro deal from Sanity over the HTTP/GROQ API."""
import os
import urllib.parse
import requests
import config

_FIELDS = (
    'title, "slug": slug.current, destination, price, originalPrice, savingsPercent, '
    "heroImage, galleryImages, whatsIncluded, travelDates, duration, bookingWindow, disclaimer"
)


def build_deal_query(slug: str) -> str:
    """Return the GROQ query for a single deal document by slug."""
    return f'*[_type=="deal" && slug.current=="{slug}"][0]{{{_FIELDS}}}'


def parse_deal(raw: dict) -> dict:
    """Normalize a Sanity query response into a deal dict.
    Raises ValueError if the deal was not found."""
    result = raw.get("result")
    if not result:
        raise ValueError(f"deal not found in Sanity response: {raw!r}")
    return {
        "title": result["title"],
        "slug": result["slug"],
        "destination": result["destination"],
        "price": result["price"],
        "originalPrice": result["originalPrice"],
        "savingsPercent": result["savingsPercent"],
        "heroImage": result["heroImage"],
        "galleryImages": result.get("galleryImages") or [],
        "whatsIncluded": result.get("whatsIncluded") or [],
        "travelDates": result.get("travelDates") or "",
        "duration": result.get("duration") or "",
        "bookingWindow": result.get("bookingWindow") or "",
        "disclaimer": result.get("disclaimer") or "",
    }


def fetch_deal(slug: str) -> dict:
    """Fetch and normalize a deal from Sanity by slug."""
    config.load_env()
    project = os.environ["SANITY_PROJECT_ID"]
    dataset = os.environ.get("SANITY_DATASET", "production")
    api_version = os.environ.get("SANITY_API_VERSION", "2026-03-09")
    token = os.environ["SANITY_API_WRITE_TOKEN"]  # write token also grants read
    query = build_deal_query(slug)
    url = (
        f"https://{project}.api.sanity.io/v{api_version}/data/query/{dataset}"
        f"?query={urllib.parse.quote(query)}"
    )
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=30)
    resp.raise_for_status()
    return parse_deal(resp.json())
```

> Note: if `.env.local` uses `NEXT_PUBLIC_SANITY_PROJECT_ID` instead of `SANITY_PROJECT_ID`, read `.env.local` and adjust the variable names in `fetch_deal` to match exactly. The `build_deal_query` and `parse_deal` functions are unaffected.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_sanity_client.py -v`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add Brand/deal-posts/sanity_client.py Brand/deal-posts/tests/test_sanity_client.py Brand/deal-posts/tests/fixtures/sanity_deal.json
git commit -m "feat: add Sanity client for deal-posts generator"
```

---

## Task 3: Captions and meta

**Files:**
- Create: `Brand/deal-posts/captions.py`
- Create: `Brand/deal-posts/tests/test_captions.py`

- [ ] **Step 1: Write the failing tests**

Create `Brand/deal-posts/tests/test_captions.py`:

```python
import captions

DEAL = {
    "title": "Punta Cana All-Inclusive Escape",
    "slug": "punta-cana-all-inclusive-escape",
    "destination": "Punta Cana",
    "price": 799,
    "originalPrice": 1499,
    "savingsPercent": 47,
    "duration": "5 nights",
    "travelDates": "May - September 2026",
    "disclaimer": "Price is per person.",
}


def test_build_caption_includes_destination_price_and_keyword():
    cap = captions.build_caption(DEAL, "PUNTACANA")
    assert "Punta Cana" in cap
    assert "799" in cap
    assert "PUNTACANA" in cap
    assert cap.lower().startswith("comment") or "comment puntacana" in cap.lower()


def test_build_caption_respects_45_word_limit():
    cap = captions.build_caption(DEAL, "PUNTACANA")
    assert len(cap.split()) <= 45


def test_build_caption_has_no_em_or_en_dashes():
    cap = captions.build_caption(DEAL, "PUNTACANA")
    assert "—" not in cap  # em dash
    assert "–" not in cap  # en dash


def test_build_meta_assembles_record():
    meta = captions.build_meta(
        DEAL, "PUNTACANA", ["static", "carousel"],
        {"static": "punta-cana/static-4x5.jpg", "carousel": ["punta-cana/carousel/slide-01.jpg"]},
    )
    assert meta["slug"] == "punta-cana-all-inclusive-escape"
    assert meta["keyword"] == "PUNTACANA"
    assert meta["formats"] == ["static", "carousel"]
    assert meta["outputs"]["static"] == "punta-cana/static-4x5.jpg"
    assert "caption" in meta and len(meta["caption"]) > 0
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_captions.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'captions'`.

- [ ] **Step 3: Implement `Brand/deal-posts/captions.py`**

```python
"""Builds the social caption draft and the meta.json record for a deal post.

Caption rules (locked VacationPro voice): 45 words or fewer total, body 15 words
or fewer, hook in a '[Topic]... [reframe]' shape, CTA 'Comment {KEYWORD} and
I'll send you...'. No em dashes or en dashes anywhere."""


def build_caption(deal: dict, keyword: str) -> str:
    """Return a caption draft for the deal post."""
    dest = deal["destination"]
    price = deal["price"]
    duration = deal.get("duration") or "your trip"
    # Hook + short body + comment-keyword CTA. Kept well under 45 words.
    hook = f"{dest} keeps selling out. This one hasn't yet."
    body = f"{duration}, ${price} per person, real dates."
    cta = (
        f"Comment {keyword} and I'll send you the link to book it. "
        f"Limited rooms, first come first served."
    )
    return f"{hook} {body} {cta}"


def build_meta(deal: dict, keyword: str, formats: list, outputs: dict) -> dict:
    """Assemble the meta.json record for a generated deal post."""
    return {
        "slug": deal["slug"],
        "keyword": keyword,
        "destination": deal["destination"],
        "price": deal["price"],
        "formats": formats,
        "outputs": outputs,
        "caption": build_caption(deal, keyword),
        "scheduling": {
            "platforms": ["facebook", "instagram", "tiktok"],
            "note": "Carousels to FB + IG; reels (separate) to all three.",
        },
    }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_captions.py -v`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/captions.py Brand/deal-posts/tests/test_captions.py
git commit -m "feat: add caption and meta builder for deal posts"
```

---

## Task 4: Imagery resolution

**Files:**
- Create: `Brand/deal-posts/imagery.py`
- Create: `Brand/deal-posts/tests/test_imagery.py`
- Reference: `Brand/ads/_static_ads_gen.py` (the Gemini `gen_image` pattern — read lines around the `URL` constant and the `gen_image` function)

- [ ] **Step 1: Write the failing tests**

Create `Brand/deal-posts/tests/test_imagery.py`:

```python
import base64
from pathlib import Path
import imagery


def test_pick_image_urls_uses_hero_and_gallery():
    deal = {
        "destination": "Punta Cana",
        "heroImage": "https://cdn/h.jpg",
        "galleryImages": ["https://cdn/g1.jpg", "https://cdn/g2.jpg"],
    }
    picks = imagery.pick_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["included"] == "https://cdn/g1.jpg"
    assert picks["details"] == "https://cdn/g2.jpg"


def test_pick_image_urls_falls_back_to_hero_when_gallery_short():
    deal = {"destination": "Aruba", "heroImage": "https://cdn/h.jpg", "galleryImages": []}
    picks = imagery.pick_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["included"] == "https://cdn/h.jpg"
    assert picks["details"] == "https://cdn/h.jpg"


def test_pick_image_urls_flags_missing_when_no_hero():
    deal = {"destination": "Aruba", "heroImage": None, "galleryImages": []}
    picks = imagery.pick_image_urls(deal)
    assert picks["hook"] is None


def test_to_data_uri_encodes_file(tmp_path):
    f = tmp_path / "x.png"
    f.write_bytes(b"\x89PNG\r\n\x1a\nFAKE")
    uri = imagery.to_data_uri(f)
    assert uri.startswith("data:image/png;base64,")
    assert base64.b64decode(uri.split(",", 1)[1]) == b"\x89PNG\r\n\x1a\nFAKE"


def test_to_data_uri_jpeg_mime(tmp_path):
    f = tmp_path / "x.jpg"
    f.write_bytes(b"\xff\xd8\xff")
    assert imagery.to_data_uri(f).startswith("data:image/jpeg;base64,")
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_imagery.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'imagery'`.

- [ ] **Step 3: Implement `Brand/deal-posts/imagery.py`**

```python
"""Resolves imagery for a deal post: prefers the deal's real photos, falls back
to a Gemini-generated background. Images are downloaded/generated to local files
and embedded as base64 data URIs so rendering needs no network access."""
import base64
import json
import os
import sys
import urllib.request
from pathlib import Path

import requests
import config

# Slide roles that need a background image.
ROLES = ("hook", "included", "details")


def pick_image_urls(deal: dict) -> dict:
    """Choose a source URL per slide role from the deal's real photos.
    hook -> heroImage; included -> galleryImages[0] or hero; details -> galleryImages[1] or hero.
    Any role with no usable image is None (caller must Gemini-generate a fallback)."""
    hero = deal.get("heroImage")
    gallery = deal.get("galleryImages") or []
    return {
        "hook": hero,
        "included": (gallery[0] if len(gallery) >= 1 else hero),
        "details": (gallery[1] if len(gallery) >= 2 else hero),
    }


def to_data_uri(path: Path) -> str:
    """Base64-encode a local image file as a data: URI."""
    path = Path(path)
    mime = "image/jpeg" if path.suffix.lower() in (".jpg", ".jpeg") else "image/png"
    b = base64.b64encode(path.read_bytes()).decode()
    return f"data:{mime};base64,{b}"


def generate_fallback(prompt: str, out_path: Path) -> bool:
    """Generate a background image with Gemini 2.5 Flash Image. Mirrors the
    gen_image() request/response pattern in Brand/ads/_static_ads_gen.py.
    Returns True on success, False (with a stderr note) on any failure —
    callers treat False as 'no fallback available'."""
    config.load_env()
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("  GEMINI_API_KEY not set; cannot generate fallback image", file=sys.stderr)
        return False
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash-image:generateContent?key={key}"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.load(r)
        for part in resp.get("candidates", [{}])[0].get("content", {}).get("parts", []):
            if "inlineData" in part:
                Path(out_path).write_bytes(base64.b64decode(part["inlineData"]["data"]))
                return True
    except Exception as e:  # noqa: BLE001 - surface the error, keep going
        print(f"  gemini fallback failed: {e}", file=sys.stderr)
    return False


def ensure_local_images(deal: dict, work_dir: Path) -> dict:
    """For each slide role, download the real photo (or Gemini-generate a fallback)
    into work_dir and return {role: Path}. work_dir must already exist."""
    work_dir = Path(work_dir)
    picks = pick_image_urls(deal)
    out = {}
    for role in ROLES:
        url = picks[role]
        dest = work_dir / f"{role}.jpg"
        if url:
            resp = requests.get(url, timeout=60)
            resp.raise_for_status()
            dest.write_bytes(resp.content)
        else:
            prompt = (
                f"A stunning, photorealistic travel photo of {deal['destination']}: "
                f"tropical beach resort, golden hour, no text, no people in foreground."
            )
            png = work_dir / f"{role}.png"
            if not generate_fallback(prompt, png):
                raise RuntimeError(f"no image available for role '{role}' and Gemini fallback failed")
            dest = png
        out[role] = dest
    return out
```

> Note: `GEMINI_API_KEY` is not in `.env.local` (the existing `_static_ads_gen.py` is run with it passed inline). The fallback path therefore only works when `GEMINI_API_KEY` is set in the environment. This is acceptable: the common case is a deal that *has* real photos, where the fallback never fires. `generate_fallback` degrades gracefully (returns `False`) when the key is absent.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_imagery.py -v`
Expected: PASS, 5 tests. (The tests cover only the pure functions `pick_image_urls` and `to_data_uri`; `generate_fallback` and `ensure_local_images` are network I/O, exercised in Task 9.)

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/imagery.py Brand/deal-posts/tests/test_imagery.py
git commit -m "feat: add imagery resolution for deal posts"
```

---

## Task 5: Templates (CSS + HTML)

**Files:**
- Create: `Brand/deal-posts/templates/deal-styles.css`
- Create: `Brand/deal-posts/templates/_macros.html`
- Create: `Brand/deal-posts/templates/deal-static.html`
- Create: `Brand/deal-posts/templates/deal-carousel.html`

No tests in this task — the templates are verified by `templating.py`'s tests in Task 6 and by rendering in Tasks 7 and 9. This task is pure asset creation.

- [ ] **Step 1: Create `Brand/deal-posts/templates/deal-styles.css`**

```css
/* VacationPro deal-post brand tokens. Single source of brand styling. */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; }

.frame {
  width: 1080px; height: 1350px; position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 80px; color: #fff8ec;
}
.photo { position: absolute; inset: 0; background-size: cover; background-position: center; }
.photo::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(15,46,26,0) 28%, rgba(15,46,26,0.55) 55%, rgba(15,46,26,0.95) 100%);
}
/* Lift content above the photo. MUST exclude the absolutely-positioned layers
   (.photo, .brand) or it overrides their position:absolute (equal specificity,
   later rule wins) — this bug was caught in the design mockup. */
.frame > *:not(.photo):not(.brand) { position: relative; z-index: 1; }

.brand { position: absolute; top: 72px; left: 80px; display: flex; align-items: center; gap: 16px; z-index: 2; }
.brand .mark { width: 56px; height: 56px; }
.brand .mark svg { width: 100%; height: 100%; display: block; }
.brand .wordmark { font-size: 26px; font-weight: 800; letter-spacing: 0.5px; color: #fff8ec; }

.eyebrow { font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 4px; color: #4ac850; margin-bottom: 24px; }
h1 { font-size: 108px; font-weight: 900; letter-spacing: -0.03em; line-height: 0.98; margin-bottom: 36px; }
h2 { font-size: 72px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; margin-bottom: 32px; }

.pricerow { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
.price-pill {
  background: #f59e0b; color: #0f2e1a; font-size: 80px; font-weight: 900;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums; padding: 14px 40px; border-radius: 999px;
}
.was { font-size: 38px; font-weight: 700; text-decoration: line-through; opacity: 0.75; }
.off { font-size: 32px; font-weight: 800; color: #4ac850; text-transform: uppercase; letter-spacing: 1px; }

.cta-pill {
  display: inline-flex; align-items: center; gap: 14px; background: #4ac850; color: #fff;
  font-size: 34px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
  padding: 22px 44px; border-radius: 999px; align-self: flex-start;
}

.checks { list-style: none; }
.checks li { font-size: 40px; font-weight: 600; line-height: 1.55; padding-left: 60px; position: relative; }
.checks li::before { content: '\2713'; position: absolute; left: 0; color: #4ac850; font-weight: 900; }

.rows { display: flex; flex-direction: column; gap: 20px; }
.row { display: flex; justify-content: space-between; gap: 32px; font-size: 34px; }
.row .label { font-weight: 700; color: #4ac850; text-transform: uppercase; letter-spacing: 1px; }
.row .value { font-weight: 500; text-align: right; }

.catch-box { background: rgba(15,46,26,0.85); padding: 48px; border-left: 10px solid #f59e0b; border-radius: 8px; }
.catch-label { font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #f59e0b; margin-bottom: 20px; }
.catch-body { font-size: 36px; font-weight: 500; line-height: 1.45; }

.sub { font-size: 36px; font-weight: 500; line-height: 1.45; max-width: 840px; margin-top: 8px; }

/* Solid Hero Green CTA frame */
.cta-frame { background: #4ac850; }
.cta-frame .eyebrow { color: #0f2e1a; opacity: 0.85; }
.cta-frame h1 { color: #fff; }
.cta-frame .sub { color: #fff; opacity: 0.95; }
.cta-frame .brand .wordmark { color: #fff; }
```

- [ ] **Step 2: Create `Brand/deal-posts/templates/_macros.html`**

Each macro renders one `.frame` div. `deal`, `keyword`, `images` (role -> data URI string), `flight_estimate` are passed in by `templating.py`.

```html
{% macro brand() %}
<div class="brand"><div class="mark">{{ logo_svg|safe }}</div><div class="wordmark">VacationPro</div></div>
{% endmacro %}

{% macro hook_frame(deal, keyword, images) %}
<div class="frame">
  <div class="photo" style="background-image:url('{{ images.hook }}')"></div>
  {{ brand() }}
  <div class="eyebrow">Deal Drop &middot; {{ deal.destination }}</div>
  <h1>{{ deal.destination }},<br>{{ deal.duration or 'your escape' }}.</h1>
  <div class="pricerow">
    <span class="price-pill">${{ deal.price }}</span>
    <span class="was">${{ deal.originalPrice }}</span>
    <span class="off">{{ deal.savingsPercent }}% off</span>
  </div>
  <div class="cta-pill">Comment {{ keyword }} &rarr;</div>
</div>
{% endmacro %}

{% macro included_frame(deal, images) %}
<div class="frame">
  <div class="photo" style="background-image:url('{{ images.included }}')"></div>
  {{ brand() }}
  <div class="eyebrow">What's Included</div>
  <h2>Everything but<br>the sunscreen.</h2>
  <ul class="checks">
    {% for item in deal.whatsIncluded %}<li>{{ item }}</li>{% endfor %}
  </ul>
</div>
{% endmacro %}

{% macro details_frame(deal, images, flight_estimate) %}
<div class="frame">
  <div class="photo" style="background-image:url('{{ images.details }}')"></div>
  {{ brand() }}
  <div class="eyebrow">The Details</div>
  <h2>Real dates,<br>real pricing.</h2>
  <div class="rows">
    {% if deal.travelDates %}<div class="row"><span class="label">Travel</span><span class="value">{{ deal.travelDates }}</span></div>{% endif %}
    {% if deal.duration %}<div class="row"><span class="label">Length</span><span class="value">{{ deal.duration }}</span></div>{% endif %}
    {% if flight_estimate %}<div class="row"><span class="label">Flights</span><span class="value">{{ flight_estimate }}</span></div>{% endif %}
    {% if deal.bookingWindow %}<div class="row"><span class="label">Book by</span><span class="value">{{ deal.bookingWindow }}</span></div>{% endif %}
  </div>
</div>
{% endmacro %}

{% macro catch_frame(deal, images) %}
<div class="frame">
  <div class="photo" style="background-image:url('{{ images.details }}')"></div>
  {{ brand() }}
  <div class="eyebrow">The Catch</div>
  <div class="catch-box">
    <div class="catch-label">Before you book</div>
    <div class="catch-body">{{ deal.disclaimer }}</div>
  </div>
</div>
{% endmacro %}

{% macro cta_frame(deal, keyword) %}
<div class="frame cta-frame">
  {{ brand() }}
  <div class="eyebrow">Your Move</div>
  <h1>Comment<br>{{ keyword }}</h1>
  <div class="sub">and I'll send you the link to book this deal. Real pricing, real dates, limited rooms.</div>
</div>
{% endmacro %}
```

- [ ] **Step 3: Create `Brand/deal-posts/templates/deal-static.html`**

```html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>{{ css|safe }}</style></head><body>
{% import '_macros.html' as m with context %}
{{ m.hook_frame(deal, keyword, images) }}
</body></html>
```

- [ ] **Step 4: Create `Brand/deal-posts/templates/deal-carousel.html`**

This template renders ONE slide (one `.frame`), selected by the `slide` variable. `templating.py` renders it once per slide.

```html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>{{ css|safe }}</style></head><body>
{% import '_macros.html' as m with context %}
{% if slide == 'hook' %}{{ m.hook_frame(deal, keyword, images) }}
{% elif slide == 'included' %}{{ m.included_frame(deal, images) }}
{% elif slide == 'details' %}{{ m.details_frame(deal, images, flight_estimate) }}
{% elif slide == 'catch' %}{{ m.catch_frame(deal, images) }}
{% elif slide == 'cta' %}{{ m.cta_frame(deal, keyword) }}
{% endif %}
</body></html>
```

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/templates/
git commit -m "feat: add deal-post HTML templates and brand stylesheet"
```

---

## Task 6: Templating module

**Files:**
- Create: `Brand/deal-posts/templating.py`
- Create: `Brand/deal-posts/tests/test_templating.py`

- [ ] **Step 1: Write the failing tests**

Create `Brand/deal-posts/tests/test_templating.py`:

```python
import templating

DEAL = {
    "title": "Punta Cana Escape", "slug": "punta-cana-escape", "destination": "Punta Cana",
    "price": 799, "originalPrice": 1499, "savingsPercent": 47, "duration": "5 nights",
    "travelDates": "May - September 2026", "bookingWindow": "Book by June 30",
    "whatsIncluded": ["Round-trip airfare", "Oceanview room"], "disclaimer": "Per person.",
}
IMAGES = {"hook": "data:image/jpeg;base64,AAA", "included": "data:image/jpeg;base64,BBB",
          "details": "data:image/jpeg;base64,CCC"}


def test_render_static_contains_core_content():
    html = templating.render_static(DEAL, "PUNTACANA", IMAGES)
    assert "Punta Cana" in html
    assert "$799" in html
    assert "Comment PUNTACANA" in html
    assert "data:image/jpeg;base64,AAA" in html
    assert "<style>" in html  # css inlined


def test_render_carousel_returns_one_html_per_slide():
    slides = templating.render_carousel(DEAL, "PUNTACANA", IMAGES, flight_estimate="from $180pp")
    # hook, included, details, catch, cta = 5 (deal has a disclaimer)
    assert len(slides) == 5
    assert "Comment PUNTACANA" in slides[0]      # hook slide
    assert "Round-trip airfare" in slides[1]     # included slide
    assert "from $180pp" in slides[2]            # details slide
    assert "Per person." in slides[3]            # catch slide
    assert "Your Move" in slides[4]              # cta slide


def test_render_carousel_skips_catch_slide_when_no_disclaimer():
    deal = dict(DEAL, disclaimer="")
    slides = templating.render_carousel(deal, "PUNTACANA", IMAGES, flight_estimate="")
    assert len(slides) == 4  # catch slide skipped


def test_carousel_slide_count():
    assert templating.carousel_slide_count(DEAL) == 5
    assert templating.carousel_slide_count(dict(DEAL, disclaimer="")) == 4


def test_render_static_equals_carousel_slide_one():
    """The static and carousel slide 1 both come from the hook_frame macro:
    their hook content must match."""
    html_static = templating.render_static(DEAL, "PUNTACANA", IMAGES)
    slides = templating.render_carousel(DEAL, "PUNTACANA", IMAGES, flight_estimate="")
    for marker in ("Deal Drop", "Punta Cana", "$799", "Comment PUNTACANA", IMAGES["hook"]):
        assert marker in html_static
        assert marker in slides[0]
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_templating.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'templating'`.

- [ ] **Step 3: Implement `Brand/deal-posts/templating.py`**

```python
"""Renders the deal-post Jinja2 templates to HTML strings.
- render_static: one HTML string (the hook frame).
- render_carousel: a list of HTML strings, one per slide.
The static and carousel slide 1 both come from the hook_frame macro, so they
cannot drift."""
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATES_DIR = Path(__file__).parent / "templates"
_LOGO_PATH = Path(__file__).resolve().parents[2] / "public" / "logo-white.svg"

_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


def _css() -> str:
    return (_TEMPLATES_DIR / "deal-styles.css").read_text()


def _logo_svg() -> str:
    return _LOGO_PATH.read_text()


def carousel_slide_count(deal: dict) -> int:
    """Number of carousel slides for this deal (catch slide is skipped when the
    deal has no disclaimer)."""
    return 5 if deal.get("disclaimer") else 4


def _carousel_slide_names(deal: dict) -> list:
    names = ["hook", "included", "details"]
    if deal.get("disclaimer"):
        names.append("catch")
    names.append("cta")
    return names


def render_static(deal: dict, keyword: str, images: dict) -> str:
    """Render the standalone deal-static HTML (the hook frame)."""
    return _env.get_template("deal-static.html").render(
        deal=deal, keyword=keyword, images=images, css=_css(), logo_svg=_logo_svg()
    )


def render_carousel(deal: dict, keyword: str, images: dict, flight_estimate: str = "") -> list:
    """Render the deal carousel as a list of single-slide HTML strings."""
    template = _env.get_template("deal-carousel.html")
    out = []
    for slide in _carousel_slide_names(deal):
        out.append(template.render(
            deal=deal, keyword=keyword, images=images, css=_css(),
            logo_svg=_logo_svg(), slide=slide, flight_estimate=flight_estimate,
        ))
    return out
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_templating.py -v`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/templating.py Brand/deal-posts/tests/test_templating.py
git commit -m "feat: add templating module for deal posts"
```

---

## Task 7: Render module

**Files:**
- Create: `Brand/deal-posts/render.py`
- Create: `Brand/deal-posts/tests/test_render.py`
- Reference: `Brand/carousels/_render_png.py` (the existing Playwright pattern)

- [ ] **Step 1: Write the failing test**

Create `Brand/deal-posts/tests/test_render.py`. This is an integration test — it actually runs Playwright.

```python
from pathlib import Path
import render

# A minimal self-contained 1080x1350 HTML frame (solid color, no external assets,
# so it renders identically in any environment including sandboxes).
SAMPLE_HTML = """<!DOCTYPE html><html><head><style>
* { margin:0; padding:0; }
.frame { width:1080px; height:1350px; background:#4ac850; }
</style></head><body><div class="frame"></div></body></html>"""


def test_render_html_to_jpg_produces_correct_size(tmp_path):
    out = tmp_path / "frame.jpg"
    render.render_html_to_jpg(SAMPLE_HTML, out)
    assert out.exists()
    from PIL import Image
    with Image.open(out) as im:
        assert im.size == (1080, 1350)
        assert im.format == "JPEG"
        # the frame is solid hero-green: a center pixel must not be white
        px = im.getpixel((540, 675))
        assert px != (255, 255, 255)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_render.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'render'`.

- [ ] **Step 3: Implement `Brand/deal-posts/render.py`**

```python
"""Rasterizes a single-frame HTML string to a 1080x1350 JPEG via Playwright.
Mirrors the approach in Brand/carousels/_render_png.py."""
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

WIDTH, HEIGHT = 1080, 1350
JPEG_QUALITY = 85  # Publer-ready; PNGs over 5MB cause Publer SSL upload errors


def render_html_to_jpg(html: str, out_path: Path) -> Path:
    """Render one frame of HTML to a 1080x1350 JPEG at out_path."""
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as tf:
        tf.write(html)
        tmp_html = Path(tf.name)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            ctx = browser.new_context(
                viewport={"width": WIDTH, "height": HEIGHT}, device_scale_factor=2
            )
            page = ctx.new_page()
            page.goto(f"file://{tmp_html.resolve()}", wait_until="networkidle")
            page.wait_for_timeout(400)  # let webfonts settle
            page.screenshot(
                path=str(out_path), type="jpeg", quality=JPEG_QUALITY,
                clip={"x": 0, "y": 0, "width": WIDTH, "height": HEIGHT},
            )
            browser.close()
    finally:
        tmp_html.unlink(missing_ok=True)
    return out_path
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_render.py -v`
Expected: PASS, 1 test. If Playwright errors that chromium is missing, run `python3 -m playwright install chromium` and retry.

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/render.py Brand/deal-posts/tests/test_render.py
git commit -m "feat: add Playwright render module for deal posts"
```

---

## Task 8: Generate orchestrator

**Files:**
- Create: `Brand/deal-posts/generate.py`
- Create: `Brand/deal-posts/tests/test_generate.py`

- [ ] **Step 1: Write the failing tests**

Create `Brand/deal-posts/tests/test_generate.py`:

```python
import csv
import pytest
import generate


def test_parse_cli_args_single_mode():
    args = generate.parse_cli_args(
        ["--slug", "punta-cana-3n", "--keyword", "puntacana", "--formats", "static,carousel"]
    )
    assert args["mode"] == "single"
    assert args["slug"] == "punta-cana-3n"
    assert args["keyword"] == "PUNTACANA"          # normalized to uppercase
    assert args["formats"] == ["static", "carousel"]
    assert args["flight_estimate"] == ""


def test_parse_cli_args_defaults_formats_to_both():
    args = generate.parse_cli_args(["--slug", "x", "--keyword", "X"])
    assert args["formats"] == ["static", "carousel"]


def test_parse_cli_args_single_mode_requires_slug_and_keyword():
    with pytest.raises(SystemExit):
        generate.parse_cli_args(["--keyword", "X"])
    with pytest.raises(SystemExit):
        generate.parse_cli_args(["--slug", "x"])


def test_parse_cli_args_batch_mode():
    args = generate.parse_cli_args(["--batch", "deal-sheet.csv"])
    assert args["mode"] == "batch"
    assert args["batch_csv"] == "deal-sheet.csv"


def test_read_deal_sheet_parses_rows(tmp_path):
    csv_path = tmp_path / "sheet.csv"
    with open(csv_path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["slug", "keyword", "formats", "flight_estimate"])
        w.writerow(["punta-cana-3n", "puntacana", "static,carousel", "from $180pp"])
        w.writerow(["aruba-5n", "aruba", "carousel", ""])
    rows = generate.read_deal_sheet(csv_path)
    assert rows[0] == {"slug": "punta-cana-3n", "keyword": "PUNTACANA",
                       "formats": ["static", "carousel"], "flight_estimate": "from $180pp"}
    assert rows[1] == {"slug": "aruba-5n", "keyword": "ARUBA",
                       "formats": ["carousel"], "flight_estimate": ""}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_generate.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'generate'`.

- [ ] **Step 3: Implement `Brand/deal-posts/generate.py`**

```python
"""CLI orchestrator for the deal-post generators.

Single deal:  python generate.py --slug punta-cana-3n --keyword PUNTACANA --formats static,carousel
Batch:        python generate.py --batch path/to/deal-sheet.csv

Batch CSV columns: slug,keyword,formats,flight_estimate
"""
import argparse
import csv
import json
import sys
import tempfile
from pathlib import Path

import sanity_client
import imagery
import templating
import render
import captions

OUTPUT_ROOT = Path(__file__).parent


def parse_cli_args(argv: list) -> dict:
    """Parse CLI args into a normalized dict. Exits (SystemExit) on bad input."""
    parser = argparse.ArgumentParser(description="Generate VacationPro deal posts.")
    parser.add_argument("--slug")
    parser.add_argument("--keyword")
    parser.add_argument("--formats", default="static,carousel")
    parser.add_argument("--flight-estimate", dest="flight_estimate", default="")
    parser.add_argument("--batch")
    ns = parser.parse_args(argv)

    if ns.batch:
        return {"mode": "batch", "batch_csv": ns.batch}
    if not ns.slug or not ns.keyword:
        parser.error("single mode requires both --slug and --keyword (or use --batch)")
    return {
        "mode": "single",
        "slug": ns.slug,
        "keyword": ns.keyword.strip().upper(),
        "formats": [f.strip() for f in ns.formats.split(",") if f.strip()],
        "flight_estimate": ns.flight_estimate,
    }


def read_deal_sheet(csv_path) -> list:
    """Read the weekly deal-sheet CSV into a list of normalized job dicts."""
    rows = []
    with open(csv_path, newline="") as f:
        for raw in csv.DictReader(f):
            rows.append({
                "slug": raw["slug"].strip(),
                "keyword": raw["keyword"].strip().upper(),
                "formats": [x.strip() for x in raw.get("formats", "static,carousel").split(",") if x.strip()],
                "flight_estimate": (raw.get("flight_estimate") or "").strip(),
            })
    return rows


def generate_deal(slug: str, keyword: str, formats: list, flight_estimate: str = "") -> dict:
    """Generate the requested formats for one deal. Returns the meta.json dict."""
    deal = sanity_client.fetch_deal(slug)
    deal_dir = OUTPUT_ROOT / slug
    deal_dir.mkdir(parents=True, exist_ok=True)
    outputs = {}

    with tempfile.TemporaryDirectory() as work:
        local = imagery.ensure_local_images(deal, Path(work))
        images = {role: imagery.to_data_uri(path) for role, path in local.items()}

        if "static" in formats:
            html = templating.render_static(deal, keyword, images)
            out = deal_dir / "static-4x5.jpg"
            render.render_html_to_jpg(html, out)
            outputs["static"] = str(out.relative_to(OUTPUT_ROOT))

        if "carousel" in formats:
            slides_html = templating.render_carousel(deal, keyword, images, flight_estimate)
            carousel_dir = deal_dir / "carousel"
            carousel_dir.mkdir(exist_ok=True)
            slide_paths = []
            for i, slide_html in enumerate(slides_html, start=1):
                out = carousel_dir / f"slide-{i:02d}.jpg"
                render.render_html_to_jpg(slide_html, out)
                slide_paths.append(str(out.relative_to(OUTPUT_ROOT)))
            outputs["carousel"] = slide_paths

    meta = captions.build_meta(deal, keyword, formats, outputs)
    (deal_dir / "meta.json").write_text(json.dumps(meta, indent=2))
    return meta


def run_single(args: dict) -> None:
    meta = generate_deal(args["slug"], args["keyword"], args["formats"], args["flight_estimate"])
    print(f"  done: {args['slug']} -> {meta['outputs']}")


def run_batch(args: dict) -> None:
    jobs = read_deal_sheet(args["batch_csv"])
    print(f"batch: {len(jobs)} deals")
    for job in jobs:
        try:
            generate_deal(job["slug"], job["keyword"], job["formats"], job["flight_estimate"])
            print(f"  done: {job['slug']}")
        except Exception as e:  # noqa: BLE001 - one bad deal must not abort the batch
            print(f"  FAILED: {job['slug']}: {e}", file=sys.stderr)


def main(argv: list | None = None) -> None:
    args = parse_cli_args(sys.argv[1:] if argv is None else argv)
    if args["mode"] == "batch":
        run_batch(args)
    else:
        run_single(args)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_generate.py -v`
Expected: PASS, 5 tests.

- [ ] **Step 5: Run the full test suite**

Run: `cd Brand/deal-posts && python3 -m pytest tests/ -v`
Expected: PASS — all tests across test_config, test_sanity_client, test_captions, test_imagery, test_templating, test_render, test_generate.

- [ ] **Step 6: Commit**

```bash
git add Brand/deal-posts/generate.py Brand/deal-posts/tests/test_generate.py
git commit -m "feat: add deal-post generate orchestrator (single + batch)"
```

---

## Task 9: End-to-end verification

**Files:** none (verification only — may require real `.env.local` credentials and network access)

- [ ] **Step 1: Note on the Gemini fallback path**

The E2E below uses a deal that *has* a `heroImage`, so the Gemini fallback never fires. To exercise the fallback separately, set `GEMINI_API_KEY` in the environment and run against a deal with no images — out of scope for this verification, but confirm `imagery.generate_fallback` matches the endpoint in `Brand/ads/_static_ads_gen.py` (`gemini-2.5-flash-image` on `generativelanguage.googleapis.com`).

- [ ] **Step 2: Find a real deal slug**

Run: `cd /Users/brendanobrien/Documents/Claude/vacationpro && npx tsx scripts/list-deals.ts`
Expected: prints deal slugs. Pick one with a `heroImage` set. If `scripts/list-deals.ts` cannot run, query Sanity directly or ask the repo owner for a valid deal slug.

- [ ] **Step 3: Generate a single deal, both formats**

Run: `cd Brand/deal-posts && python3 generate.py --slug <real-slug> --keyword TESTKEY --formats static,carousel --flight-estimate "from $180pp"`
Expected: prints `done: <slug> -> {...}`. No traceback.

- [ ] **Step 4: Verify the outputs**

Run: `ls -la Brand/deal-posts/<real-slug>/ Brand/deal-posts/<real-slug>/carousel/ && cat Brand/deal-posts/<real-slug>/meta.json`
Expected: `static-4x5.jpg` exists; `carousel/` has 4 or 5 `slide-NN.jpg` files; `meta.json` has the caption, keyword `TESTKEY`, formats, and output paths.

- [ ] **Step 5: Visually spot-check**

Run: `open Brand/deal-posts/<real-slug>/static-4x5.jpg Brand/deal-posts/<real-slug>/carousel/slide-01.jpg`
Expected: 1080×1350 frames, real resort photo, forest scrim, real logo top-left, Inter typography, amber price pill, green CTA pill. slide-01 and static-4x5 are visually identical (same hook frame).

- [ ] **Step 6: Confirm output stays gitignored**

Run: `cd /Users/brendanobrien/Documents/Claude/vacationpro && git status --short Brand/deal-posts/`
Expected: only source files (if any uncommitted) show — NO `<slug>/` output folder, no `.jpg`, no `meta.json`. If output files appear, the Task 1 gitignore block needs fixing.

- [ ] **Step 7: Clean up the test output**

Run: `rm -rf Brand/deal-posts/<real-slug>`
(The test deal's rendered output is throwaway; the generator recreates it on demand.)

---

## Out of scope (do not build here)

- The 9:16 reel generator (separate sub-project, Hyperframes tooling).
- Publer scheduling (the existing Publer flow consumes `meta.json` separately).
- Refactoring `Brand/ads/_static_ads_gen.py` (the paid Meta-ads generator stays as-is).
- The `deal_keywords` registry / ManyChat wiring (Track 2, already built).
