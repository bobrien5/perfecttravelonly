# Deal Reels (9:16) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing `Brand/deal-posts/` pipeline (PR #3) with a `reel` format that produces a 15-second 9:16 MP4 per deal using Hyperframes — same CLI, same `meta.json`, same output folder as the image generators.

**Architecture:** A new `Brand/deal-posts/reels/` subpackage. Pure beat-planning logic (`beats.py`) chooses 1–4 text beats from Sanity content. A Jinja2 template renders the existing prototype-proven Hyperframes composition (logo lockup + hook + Ken-Burns beats + Hero-Green CTA + music track) into an `index.html`. `builder.py` materializes a scratch Hyperframes project in a temp dir, runs `npx hyperframes lint` then `npx hyperframes render`, and moves the output MP4 into `Brand/deal-posts/{slug}/reel-9x16.mp4`. The existing `generate.py` gains `reel` as a third `--formats` option; `captions.py` and `imagery.py` get small additive touches.

**Tech Stack:** Python 3.9 (`subprocess`, `tempfile`, `shutil`, `pathlib`, `jinja2`), Node 22 + Hyperframes CLI 0.6.7+ (HeyGen, GSAP timeline), ffmpeg 8 (Hyperframes uses it under the hood). Existing modules from PR #3: `sanity_client`, `imagery`, `captions`, `config`.

**Reference:** The working composition at `~/Documents/Claude/hyperframes-sandbox/test-video/index.html` proves the syntax + brand styling on the current machine. Use it as a stylistic anchor; do not literally copy its 3-scene structure — the new template follows the spec's hook + 4-beat + CTA anatomy.

**What already exists:** PR #3 ships `sanity_client.fetch_deal`, `imagery.pick_image_urls` / `ensure_local_images` / `to_data_uri`, `captions.build_caption` / `build_meta`, `generate.parse_cli_args` / `read_deal_sheet` / `generate_deal` / `run_single` / `run_batch`. The reel work composes on top of those rather than reimplementing.

---

## File Structure

| File | Responsibility |
|---|---|
| `.gitignore` (modify) | Re-include `Brand/deal-posts/reels/` source + assets; keep generated `*.mp4` ignored |
| `Brand/deal-posts/reels/__init__.py` (create) | Empty — marks the package |
| `Brand/deal-posts/reels/beats.py` (create) | `plan_beats(deal) -> list[Beat]` — pure logic; pick up to 4 beat texts from Sanity content, compute timings |
| `Brand/deal-posts/reels/builder.py` (create) | `build_reel(deal, keyword, work_dir, out_path) -> Path` — orchestrate scratch project, lint, render, move output |
| `Brand/deal-posts/reels/template/index.html.j2` (create) | The Hyperframes composition (logo + hook + beat scenes + CTA + audio track) |
| `Brand/deal-posts/reels/template/hyperframes.json` (create) | Hyperframes project config — copied verbatim per build |
| `Brand/deal-posts/reels/template/reel-styles.css` (create) | All brand tokens + scene styles for the reel |
| `Brand/deal-posts/reels/assets/music.mp3` (sourcing prereq) | Royalty-free track, ~15 s; user supplies before Task 8 |
| `Brand/deal-posts/reels/assets/logo-white.svg` (create as copy) | Symlink/copy of `public/logo-white.svg` so the scratch project has it |
| `Brand/deal-posts/reels/README.md` (create) | Operator notes — what the music must be, how to swap it, how to tune beats |
| `Brand/deal-posts/reels/tests/__init__.py` (create) | Empty |
| `Brand/deal-posts/reels/tests/test_beats.py` (create) | Beat-planning unit tests |
| `Brand/deal-posts/captions.py` (modify) | Add `reel` to `outputs` and `platforms_by_format` in `build_meta` when present |
| `Brand/deal-posts/imagery.py` (modify) | Add `pick_reel_image_urls(deal) -> dict` and `ensure_local_reel_images(deal, work_dir) -> dict` (hero + up to 4 beat photos) |
| `Brand/deal-posts/generate.py` (modify) | Accept `reel` in `--formats`; in `generate_deal`, call `reels.builder.build_reel` when present |
| `Brand/deal-posts/tests/test_imagery.py` (modify) | Test `pick_reel_image_urls` |
| `Brand/deal-posts/tests/test_captions.py` (modify) | Test `build_meta` reel branch |

**Generated, never committed:** `Brand/deal-posts/{slug}/reel-9x16.mp4`.

**Test command throughout:** `cd Brand/deal-posts && python3 -m pytest tests/ reels/tests/ -v`

---

## Task 1: Project scaffold + Node + music prereq

**Files:**
- Modify: `.gitignore`
- Create: `Brand/deal-posts/reels/__init__.py`, `Brand/deal-posts/reels/tests/__init__.py`, `Brand/deal-posts/reels/assets/.gitkeep`, `Brand/deal-posts/reels/README.md`

- [ ] **Step 1: Verify Node ≥ 22 on the build machine**

Run: `node --version`
Expected: `v22.x` or higher. **If it reports `v20.x` or lower, stop here.** Hyperframes 0.6.7 requires Node ≥ 22 (`npm warn EBADENGINE` on the current machine confirms this). Install Node 22 via `nvm install 22 && nvm use 22` (or `nvm alias default 22`) and re-run. Do not continue until `node --version` reports ≥ 22.

- [ ] **Step 2: Verify Hyperframes CLI is reachable + ffmpeg present**

Run: `npx --yes hyperframes --version 2>&1 | tail -1 && ffmpeg -version 2>&1 | head -1`
Expected: a Hyperframes version (e.g. `0.6.7`) and an ffmpeg version (e.g. `ffmpeg version 8.1`). No `EBADENGINE` warning.

- [ ] **Step 3: Adjust `.gitignore` to track reel source + assets, ignore output**

The PR #3 block (starting at the line `Brand/*`) currently has these re-includes:
```
!Brand/deal-posts/*.py
!Brand/deal-posts/*.txt
!Brand/deal-posts/*.md
!Brand/deal-posts/templates/
!Brand/deal-posts/tests/
```

Add immediately after those lines (before `Brand/deal-posts/templates/*`):
```
!Brand/deal-posts/reels/
Brand/deal-posts/reels/*
!Brand/deal-posts/reels/*.py
!Brand/deal-posts/reels/*.md
!Brand/deal-posts/reels/template/
!Brand/deal-posts/reels/assets/
!Brand/deal-posts/reels/tests/
Brand/deal-posts/reels/template/*
!Brand/deal-posts/reels/template/*.html
!Brand/deal-posts/reels/template/*.j2
!Brand/deal-posts/reels/template/*.css
!Brand/deal-posts/reels/template/*.json
Brand/deal-posts/reels/assets/*
!Brand/deal-posts/reels/assets/*.mp3
!Brand/deal-posts/reels/assets/*.svg
!Brand/deal-posts/reels/assets/.gitkeep
Brand/deal-posts/reels/tests/*
!Brand/deal-posts/reels/tests/*.py
```

Per-deal output (`Brand/deal-posts/{slug}/reel-9x16.mp4`) is already covered by the existing `Brand/deal-posts/*` rule (no negation re-includes it). Verify:

```bash
git check-ignore -v Brand/deal-posts/reels/builder.py Brand/deal-posts/reels/template/index.html.j2 Brand/deal-posts/reels/assets/music.mp3 Brand/deal-posts/punta-cana/reel-9x16.mp4
```
Expected: the first three are **not** listed (tracked); `punta-cana/reel-9x16.mp4` IS listed (ignored).

- [ ] **Step 4: Create the empty package + asset stubs**

```bash
mkdir -p Brand/deal-posts/reels/template Brand/deal-posts/reels/assets Brand/deal-posts/reels/tests
touch Brand/deal-posts/reels/__init__.py Brand/deal-posts/reels/tests/__init__.py Brand/deal-posts/reels/assets/.gitkeep
```

- [ ] **Step 5: Copy the brand logo into the reels assets**

The reel composition needs `logo-white.svg` co-located with the other assets so Hyperframes can resolve it inside a scratch render dir.

Run: `cp public/logo-white.svg Brand/deal-posts/reels/assets/logo-white.svg`

- [ ] **Step 6: Write `Brand/deal-posts/reels/README.md`**

```markdown
# Deal Reels (9:16) — Operator Notes

Extension of [`Brand/deal-posts/`](../README.md) that adds a 15-second 9:16 MP4 reel format. Reuses the same Sanity data and lives at the same per-deal output folder.

## Run

```bash
cd Brand/deal-posts
python3 generate.py --slug <slug> --keyword KEY --formats reel
```

`--formats static,carousel,reel` produces all three in one command.

## Prerequisites

1. **Node ≥ 22**: `node --version`. If lower: `nvm install 22 && nvm use 22`.
2. **ffmpeg** on PATH: `ffmpeg -version`.
3. **Music track** at `Brand/deal-posts/reels/assets/music.mp3`: royalty-free, cleared for commercial use, roughly 15 s (longer is fine; the composition trims). Sources: Epidemic Sound, Artlist, Uppbeat, etc. **Do not commit copyrighted tracks.**

## What it produces

`Brand/deal-posts/{slug}/reel-9x16.mp4` — 1080×1920, 15.0 s, 30 fps, with audio.

## Anatomy

- 0.0–1.5 s: hook (destination + price)
- 1.5–12.0 s: 1–4 Ken-Burns beats over gallery photos, with rotating value-prop text
- 12.0–15.0 s: Hero Green CTA (`Comment KEYWORD`)

Beats are planned by [`beats.py`](beats.py) from `whatsIncluded`, `travelDates`/`duration`, `originalPrice`/`savingsPercent`, and `bookingWindow`. Beats with no source content are skipped; the remaining beats stretch to fill the body window.

## Swapping the music track

Drop a new MP3 at `assets/music.mp3` and re-run. The composition references that exact path.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm warn EBADENGINE` | Node < 22 | `nvm install 22 && nvm use 22` |
| `lint failed: ...` | Composition shape broke | Read the lint output; the message names the bad attribute/track |
| Output MP4 is silent | Music file missing or invalid | Confirm `assets/music.mp3` exists and plays in Quicktime |
| Output MP4 wrong dimensions | Root `data-width`/`data-height` modified | Restore to `1080`/`1920` |
| `RuntimeError: render produced no MP4` | Hyperframes failed silently | Re-run with verbose: `npx hyperframes render --verbose` from the scratch dir Builder prints |
```

- [ ] **Step 7: Commit**

```bash
git add .gitignore Brand/deal-posts/reels/__init__.py Brand/deal-posts/reels/tests/__init__.py Brand/deal-posts/reels/assets/.gitkeep Brand/deal-posts/reels/assets/logo-white.svg Brand/deal-posts/reels/README.md
git -c user.name=bobrien5 commit -m "$(cat <<'EOF'
chore: scaffold Brand/deal-posts/reels (gitignore, README, assets)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Beat planning (`beats.py`)

**Files:**
- Create: `Brand/deal-posts/reels/beats.py`
- Create: `Brand/deal-posts/reels/tests/test_beats.py`

The reel body window is 1.5 – 12.0 s (10.5 s total). We plan up to 4 beats; if some sources are missing we plan fewer and the remaining beats expand to fill the window evenly.

- [ ] **Step 1: Write the failing tests**

Create `Brand/deal-posts/reels/tests/test_beats.py`:

```python
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import beats


FULL_DEAL = {
    "destination": "Punta Cana",
    "duration": "5 nights",
    "travelDates": "May - September 2026",
    "whatsIncluded": ["Round-trip airfare", "Oceanview room", "Unlimited meals"],
    "price": 799,
    "originalPrice": 1499,
    "savingsPercent": 47,
    "bookingWindow": "Book by Jun 30",
    "disclaimer": "Price is per person, based on double occupancy.",
}


def test_plan_beats_full_deal_has_four_beats():
    bs = beats.plan_beats(FULL_DEAL)
    assert len(bs) == 4
    # Beat texts are short, single-line, no em/en dashes
    for b in bs:
        assert len(b.text) <= 32
        assert "—" not in b.text and "–" not in b.text


def test_plan_beats_timings_cover_body_window_exactly():
    bs = beats.plan_beats(FULL_DEAL)
    assert bs[0].start == 1.5
    assert bs[-1].start + bs[-1].duration == 12.0
    # Beats are contiguous
    for prev, curr in zip(bs, bs[1:]):
        assert abs((prev.start + prev.duration) - curr.start) < 0.01


def test_plan_beats_assigns_image_indexes_in_order():
    bs = beats.plan_beats(FULL_DEAL)
    assert [b.image_index for b in bs] == [0, 1, 2, 3]


def test_plan_beats_skips_missing_sources_and_stretches():
    # Deal with no whatsIncluded and no bookingWindow → only 2 beats
    deal = dict(FULL_DEAL, whatsIncluded=[], bookingWindow="")
    bs = beats.plan_beats(deal)
    assert len(bs) == 2
    # Body window still covered exactly
    assert bs[0].start == 1.5
    assert abs((bs[-1].start + bs[-1].duration) - 12.0) < 0.01
    # Each remaining beat got 5.25 s (10.5 / 2)
    for b in bs:
        assert abs(b.duration - 5.25) < 0.01


def test_plan_beats_at_least_one_beat_even_when_all_sources_missing():
    deal = {
        "destination": "X", "duration": "", "travelDates": "",
        "whatsIncluded": [], "price": 100, "originalPrice": 100,
        "savingsPercent": 0, "bookingWindow": "", "disclaimer": "",
    }
    bs = beats.plan_beats(deal)
    assert len(bs) == 1
    assert bs[0].start == 1.5
    assert abs(bs[0].duration - 10.5) < 0.01
    # The fallback beat uses the destination
    assert "X" in bs[0].text or len(bs[0].text) > 0


def test_plan_beats_savings_beat_uses_percent_when_present():
    deal = dict(FULL_DEAL, savingsPercent=47)
    bs = beats.plan_beats(deal)
    savings_beat = [b for b in bs if "47" in b.text or "%" in b.text]
    assert savings_beat, f"no savings beat among {[b.text for b in bs]}"


def test_beat_dataclass_shape():
    b = beats.Beat(text="x", start=1.5, duration=2.5, image_index=0)
    assert b.text == "x" and b.start == 1.5 and b.duration == 2.5 and b.image_index == 0
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest reels/tests/test_beats.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'beats'`.

- [ ] **Step 3: Implement `Brand/deal-posts/reels/beats.py`**

```python
"""Plans the on-screen text beats for a deal reel.

The reel body window is 1.5 - 12.0 s (10.5 s total). We plan up to 4 beats from
the deal's Sanity content. Beats with no source content are skipped; the
remaining beats stretch to fill the body window evenly. We always return at
least one beat (a destination fallback) so the body is never empty."""
from dataclasses import dataclass
from typing import List

BODY_START = 1.5
BODY_END = 12.0
BODY_WINDOW = BODY_END - BODY_START  # 10.5 s
MAX_BEATS = 4
TEXT_LIMIT = 32


@dataclass
class Beat:
    text: str
    start: float
    duration: float
    image_index: int


def _clip(text: str) -> str:
    """Trim a beat text to the on-screen length limit, single-line."""
    text = " ".join(text.split())
    if len(text) <= TEXT_LIMIT:
        return text
    return text[: TEXT_LIMIT - 1].rstrip() + "."


def _beat_candidates(deal: dict) -> List[str]:
    """Pick up to 4 candidate beat texts from the deal, in display order.
    Each candidate is None if the source content is missing or empty."""
    out = []

    # Beat 1: first whatsIncluded item
    included = deal.get("whatsIncluded") or []
    out.append(_clip(included[0]) if included else None)

    # Beat 2: duration + travelDates combined (or whichever is present)
    duration = (deal.get("duration") or "").strip()
    dates = (deal.get("travelDates") or "").strip()
    if duration and dates:
        out.append(_clip(f"{duration}, {dates}"))
    elif duration:
        out.append(_clip(duration))
    elif dates:
        out.append(_clip(dates))
    else:
        out.append(None)

    # Beat 3: savings (percent if available, else was/now if originalPrice differs)
    savings_pct = deal.get("savingsPercent") or 0
    price = deal.get("price") or 0
    orig = deal.get("originalPrice") or 0
    if savings_pct and savings_pct > 0:
        out.append(_clip(f"{int(savings_pct)}% off"))
    elif orig and price and orig > price:
        out.append(_clip(f"Was ${int(orig)}, now ${int(price)}"))
    else:
        out.append(None)

    # Beat 4: bookingWindow (else short disclaimer)
    window = (deal.get("bookingWindow") or "").strip()
    if window:
        out.append(_clip(window))
    else:
        out.append(None)

    return out


def plan_beats(deal: dict) -> List[Beat]:
    """Return the list of beats for this deal, sized to fill the body window.
    At least one beat is always returned (destination fallback)."""
    candidates = [t for t in _beat_candidates(deal) if t]
    if not candidates:
        # Fallback: a single destination beat fills the whole body window.
        dest = (deal.get("destination") or "Your trip").strip()
        candidates = [_clip(dest)]

    candidates = candidates[:MAX_BEATS]
    n = len(candidates)
    per_beat = BODY_WINDOW / n

    return [
        Beat(text=t, start=round(BODY_START + i * per_beat, 3),
             duration=round(per_beat, 3), image_index=i)
        for i, t in enumerate(candidates)
    ]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest reels/tests/test_beats.py -v`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/reels/beats.py Brand/deal-posts/reels/tests/test_beats.py
git -c user.name=bobrien5 commit -m "$(cat <<'EOF'
feat: add reel beat planner

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Captions update — reel branch

**Files:**
- Modify: `Brand/deal-posts/captions.py`
- Modify: `Brand/deal-posts/tests/test_captions.py`

`build_meta` already returns `outputs` and `scheduling.platforms_by_format`. We add a `reel` branch.

- [ ] **Step 1: Write the failing tests**

Open `Brand/deal-posts/tests/test_captions.py` and append (after the existing tests):

```python
def test_build_meta_reel_branch_includes_tiktok():
    meta = captions.build_meta(
        DEAL, "PUNTACANA", ["static", "carousel", "reel"],
        {
            "static": "punta-cana/static-4x5.jpg",
            "carousel": ["punta-cana/carousel/slide-01.jpg"],
            "reel": "punta-cana/reel-9x16.mp4",
        },
    )
    assert meta["outputs"]["reel"] == "punta-cana/reel-9x16.mp4"
    assert "tiktok" in meta["scheduling"]["platforms_by_format"]["reel"]
    assert meta["scheduling"]["platforms_by_format"]["reel"] == ["facebook", "instagram", "tiktok"]


def test_build_meta_reel_omitted_when_format_not_present():
    meta = captions.build_meta(DEAL, "PUNTACANA", ["static"], {"static": "x.jpg"})
    assert "reel" not in meta["outputs"]
    assert "reel" not in meta["scheduling"]["platforms_by_format"]
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_captions.py -v`
Expected: FAIL — the new tests fail because `build_meta` doesn't yet handle `reel`.

- [ ] **Step 3: Update `Brand/deal-posts/captions.py`**

Locate the existing `build_meta` function. The current platforms map in PR #3 sets `platforms_by_format` only for `static` and `carousel`. Modify `build_meta` so the `platforms_by_format` mapping conditionally includes `reel`:

Replace the existing `scheduling` block inside `build_meta` (the one that builds `platforms_by_format`) with:

```python
    platforms_by_format = {}
    if "static" in formats:
        platforms_by_format["static"] = ["facebook", "instagram"]
    if "carousel" in formats:
        platforms_by_format["carousel"] = ["facebook", "instagram"]
    if "reel" in formats:
        platforms_by_format["reel"] = ["facebook", "instagram", "tiktok"]
```

Make sure that the `outputs` dict passed through to the meta record already contains whatever the caller provided (including a `reel` key); `build_meta` is content-agnostic about it.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_captions.py -v`
Expected: PASS — all captions tests including the two new ones.

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/captions.py Brand/deal-posts/tests/test_captions.py
git -c user.name=bobrien5 commit -m "$(cat <<'EOF'
feat: extend build_meta with reel format + tiktok platform

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Imagery update — reel image picker

**Files:**
- Modify: `Brand/deal-posts/imagery.py`
- Modify: `Brand/deal-posts/tests/test_imagery.py`

Reels need up to 5 images (one for the hook frame, one per beat × 4). The existing `pick_image_urls` returns 3 roles (hook/included/details). Add a parallel `pick_reel_image_urls`.

- [ ] **Step 1: Write the failing tests**

Open `Brand/deal-posts/tests/test_imagery.py` and append:

```python
def test_pick_reel_image_urls_uses_hero_and_gallery_in_order():
    deal = {
        "destination": "Punta Cana",
        "heroImage": "https://cdn/h.jpg",
        "galleryImages": ["https://cdn/g1.jpg", "https://cdn/g2.jpg", "https://cdn/g3.jpg", "https://cdn/g4.jpg"],
    }
    picks = imagery.pick_reel_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["beat1"] == "https://cdn/g1.jpg"
    assert picks["beat2"] == "https://cdn/g2.jpg"
    assert picks["beat3"] == "https://cdn/g3.jpg"
    assert picks["beat4"] == "https://cdn/g4.jpg"


def test_pick_reel_image_urls_falls_back_to_hero_when_gallery_short():
    deal = {"destination": "X", "heroImage": "https://cdn/h.jpg", "galleryImages": ["https://cdn/g1.jpg"]}
    picks = imagery.pick_reel_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["beat1"] == "https://cdn/g1.jpg"
    # No gallery[1..3]: fall back to hero
    assert picks["beat2"] == "https://cdn/h.jpg"
    assert picks["beat3"] == "https://cdn/h.jpg"
    assert picks["beat4"] == "https://cdn/h.jpg"


def test_pick_reel_image_urls_flags_missing_when_no_hero():
    deal = {"destination": "X", "heroImage": None, "galleryImages": []}
    picks = imagery.pick_reel_image_urls(deal)
    assert picks["hook"] is None
    assert picks["beat1"] is None
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_imagery.py -v`
Expected: FAIL — the new tests fail because `pick_reel_image_urls` doesn't exist.

- [ ] **Step 3: Update `Brand/deal-posts/imagery.py`**

Add this constant and function at module scope (under the existing `ROLES` tuple):

```python
REEL_ROLES = ("hook", "beat1", "beat2", "beat3", "beat4")


def pick_reel_image_urls(deal: dict) -> dict:
    """Choose a source URL per reel slot from the deal's real photos.
    hook -> heroImage; beat1..4 -> galleryImages[0..3] or hero fallback."""
    hero = deal.get("heroImage")
    gallery = deal.get("galleryImages") or []
    return {
        "hook": hero,
        "beat1": gallery[0] if len(gallery) >= 1 else hero,
        "beat2": gallery[1] if len(gallery) >= 2 else hero,
        "beat3": gallery[2] if len(gallery) >= 3 else hero,
        "beat4": gallery[3] if len(gallery) >= 4 else hero,
    }


def ensure_local_reel_images(deal: dict, work_dir) -> dict:
    """Download (or Gemini-generate) all reel images into work_dir.
    Returns {role: Path}. work_dir must already exist. Same shape as the
    existing ensure_local_images but for the 5 reel roles."""
    from pathlib import Path
    import requests
    work_dir = Path(work_dir)
    picks = pick_reel_image_urls(deal)
    out = {}
    for role in REEL_ROLES:
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
                raise RuntimeError(f"no image available for reel role '{role}' and Gemini fallback failed")
            dest = png
        out[role] = dest
    return out
```

`generate_fallback` and `requests` are already imported at the top of the existing `imagery.py` from PR #3. The `from pathlib import Path` and `import requests` inside the function are redundant but harmless; keep them if it makes the function self-contained — or delete if the top-level imports are already there. (Check the existing file and remove duplicate imports if so.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd Brand/deal-posts && python3 -m pytest tests/test_imagery.py -v`
Expected: PASS — all imagery tests including the three new ones.

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/imagery.py Brand/deal-posts/tests/test_imagery.py
git -c user.name=bobrien5 commit -m "$(cat <<'EOF'
feat: add reel image picker + local-image downloader

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Reel template (CSS + Jinja HTML + project config)

**Files:**
- Create: `Brand/deal-posts/reels/template/reel-styles.css`
- Create: `Brand/deal-posts/reels/template/hyperframes.json`
- Create: `Brand/deal-posts/reels/template/index.html.j2`

The composition is 1080×1920, 15.0 s. Three scene types stacked over a persistent logo lockup: hook (0-1.5s), N beat scenes (1.5-12s) with Ken Burns, CTA (12-15s). Audio track plays 0-15s on a separate track-index. **No fade-in on the hook frame** — it must be visible at frame 0 (Milo rule).

- [ ] **Step 1: Create `Brand/deal-posts/reels/template/hyperframes.json`**

```json
{
  "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
  "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  "paths": {
    "blocks": "compositions",
    "components": "compositions/components",
    "assets": "assets"
  }
}
```

- [ ] **Step 2: Create `Brand/deal-posts/reels/template/reel-styles.css`**

```css
/* VacationPro deal-reel styles. 1080x1920 @ 30fps. */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 1080px; height: 1920px; overflow: hidden;
  background: #0f2e1a;
  font-family: 'Inter', sans-serif;
  color: #fff8ec;
}

/* Persistent logo lockup, top-left. Always visible. */
.logo-lockup {
  position: absolute; top: 60px; left: 60px;
  display: flex; align-items: center; gap: 14px; z-index: 100;
}
.logo-img { width: 64px; height: 64px; display: block; }
.logo-text { font-weight: 800; font-size: 32px; color: #fff8ec; letter-spacing: 0.5px; }

/* Scene base — all scenes stack on top of each other; one is visible at a time. */
.scene {
  position: absolute; top: 0; left: 0;
  width: 1080px; height: 1920px;
  display: flex; flex-direction: column;
  justify-content: flex-end; align-items: flex-start;
  padding: 0 80px 220px;
}
.scene .photo {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  will-change: transform; /* Ken Burns target */
}
.scene .photo::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(15,46,26,0) 35%, rgba(15,46,26,0.55) 60%, rgba(15,46,26,0.95) 100%);
}
.scene > *:not(.photo) { position: relative; z-index: 1; }

/* Hook scene */
.hook-eyebrow {
  font-weight: 700; font-size: 32px; letter-spacing: 5px;
  text-transform: uppercase; color: #4ac850; margin-bottom: 28px;
}
.hook-destination {
  font-weight: 900; font-size: 140px; letter-spacing: -0.03em;
  line-height: 0.95; color: #fff8ec; margin-bottom: 24px;
}
.hook-pricerow { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.hook-price-pill {
  background: #f59e0b; color: #0f2e1a;
  font-weight: 900; font-size: 96px; letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  padding: 14px 44px; border-radius: 999px;
}
.hook-was { font-weight: 700; font-size: 44px; text-decoration: line-through; opacity: 0.75; }
.hook-off { font-weight: 800; font-size: 36px; color: #4ac850; text-transform: uppercase; letter-spacing: 1px; }

/* Beat scenes */
.beat-text {
  font-weight: 900; font-size: 96px; letter-spacing: -0.02em;
  line-height: 1.05; color: #fff8ec; max-width: 920px;
}

/* CTA scene (solid Hero Green) */
.cta-scene { background: #4ac850; padding: 0 80px 280px; }
.cta-eyebrow {
  font-weight: 700; font-size: 32px; letter-spacing: 5px;
  text-transform: uppercase; color: #0f2e1a; opacity: 0.85;
  margin-bottom: 28px;
}
.cta-headline {
  font-weight: 900; font-size: 140px; letter-spacing: -0.03em;
  line-height: 0.95; color: #fff8ec; margin-bottom: 36px;
}
.cta-sub { font-weight: 500; font-size: 42px; line-height: 1.35; color: #fff8ec; opacity: 0.95; max-width: 880px; }

/* Hook starts visible, all other scenes start hidden. */
.scene { opacity: 0; }
#scene-hook { opacity: 1; }
```

- [ ] **Step 3: Create `Brand/deal-posts/reels/template/index.html.j2`**

This template uses Jinja2 control flow + variable substitution. The composition follows Hyperframes' standalone-composition rules: a `data-composition-id` div directly in `<body>` (no `<template>` wrapper), root `data-width`/`data-height`/`data-duration`, GSAP timeline registered on `window.__timelines["main"]`. Variables passed in by `builder.py`: `deal` (dict), `keyword` (str), `beats` (list of `Beat`), `images` (dict role→relative path string), `music_path` (str).

```html+jinja
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, height=1920" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>{{ css|safe }}</style>
</head>
<body>
  <div
    id="root"
    data-composition-id="main"
    data-start="0"
    data-duration="15"
    data-width="1080"
    data-height="1920"
  >
    <!-- Persistent logo lockup -->
    <div class="logo-lockup">
      <img class="logo-img" src="assets/logo-white.svg" alt="VacationPro" />
      <div class="logo-text">VacationPro</div>
    </div>

    <!-- Hook scene (0 - 1.5s) -->
    <div id="scene-hook" class="scene">
      <div class="photo" style="background-image:url('assets/hook.jpg');"></div>
      <div class="hook-eyebrow">Deal Drop &middot; {{ deal.destination }}</div>
      <div class="hook-destination">{{ deal.destination }}</div>
      <div class="hook-pricerow">
        <span class="hook-price-pill">${{ deal.price }}</span>
        {% if deal.originalPrice and deal.originalPrice > deal.price %}<span class="hook-was">${{ deal.originalPrice }}</span>{% endif %}
        {% if deal.savingsPercent %}<span class="hook-off">{{ deal.savingsPercent }}% off</span>{% endif %}
      </div>
    </div>

    <!-- Beat scenes (1.5 - 12s) -->
    {% for b in beats %}
    <div id="scene-beat-{{ loop.index }}" class="scene">
      <div class="photo" style="background-image:url('assets/beat{{ loop.index }}.jpg');"></div>
      <div class="beat-text">{{ b.text }}</div>
    </div>
    {% endfor %}

    <!-- CTA scene (12 - 15s) -->
    <div id="scene-cta" class="scene cta-scene">
      <div class="cta-eyebrow">Your Move</div>
      <div class="cta-headline">Comment {{ keyword }}</div>
      <div class="cta-sub">and I'll send you the link to book this deal. Real pricing, limited rooms.</div>
    </div>

    <!-- Music track -->
    <audio
      src="assets/music.mp3"
      data-start="0"
      data-duration="15"
      data-track-index="2"
      data-volume="1"
    ></audio>
  </div>

  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });

    /* Hook frame is visible at frame 0 (no fade-in, per Milo rule).
       Cross-fade between scenes uses opacity ONLY (GSAP visual-only rule). */

    /* Ken Burns on hook image: slow zoom from 1.00 to 1.06 over the hook window. */
    tl.fromTo("#scene-hook .photo",
      { scale: 1.00, transformOrigin: "50% 50%" },
      { scale: 1.06, duration: 1.5, ease: "none" }, 0);

    /* Exit hook into first beat at 1.5s (0.25s crossfade). */
    tl.to("#scene-hook", { opacity: 0, duration: 0.25, ease: "power1.inOut" }, 1.25);
    tl.to("#scene-beat-1", { opacity: 1, duration: 0.25, ease: "power1.inOut" }, 1.25);

    /* Per-beat Ken Burns + crossfade to the next. */
    {% for b in beats %}
    tl.fromTo("#scene-beat-{{ loop.index }} .photo",
      { scale: 1.00, transformOrigin: "50% 50%" },
      { scale: 1.06, duration: {{ b.duration }}, ease: "none" }, {{ b.start }});
    {% if not loop.last %}
    tl.to("#scene-beat-{{ loop.index }}",  { opacity: 0, duration: 0.25, ease: "power1.inOut" }, {{ b.start + b.duration - 0.25 }});
    tl.to("#scene-beat-{{ loop.index + 1 }}", { opacity: 1, duration: 0.25, ease: "power1.inOut" }, {{ b.start + b.duration - 0.25 }});
    {% endif %}
    {% endfor %}

    /* Exit last beat into CTA at 12s. */
    tl.to("#scene-beat-{{ beats|length }}", { opacity: 0, duration: 0.3, ease: "power1.inOut" }, 11.7);
    tl.to("#scene-cta",                       { opacity: 1, duration: 0.3, ease: "power1.inOut" }, 11.7);

    /* CTA pulse (gentle attention nudge). */
    tl.fromTo("#scene-cta .cta-headline",
      { scale: 1.00 }, { scale: 1.04, duration: 0.6, yoyo: true, repeat: 1, ease: "power1.inOut" }, 12.2);

    window.__timelines["main"] = tl;
  </script>
</body>
</html>
```

Notes for the implementer:
- The template references `css` (the contents of `reel-styles.css`) inlined via `{{ css|safe }}`. `builder.py` will read the CSS file and pass it in.
- `assets/*` paths are relative to the scratch project root — `builder.py` writes the photos and `music.mp3` into a sibling `assets/` directory.
- The Jinja `loop.index` is 1-based; the beat scene IDs (`#scene-beat-1`, `#scene-beat-2`, ...) match that.
- The `{% if not loop.last %}` block skips the crossfade on the last beat (the last-beat-to-CTA crossfade is handled explicitly below the loop).

- [ ] **Step 4: Sanity-check the template renders with sample data**

Quick smoke (no Hyperframes yet, just verify Jinja produces valid HTML):

```bash
cd Brand/deal-posts && python3 -c "
from jinja2 import Environment, FileSystemLoader
from reels import beats
env = Environment(loader=FileSystemLoader('reels/template'))
deal = {'destination': 'Punta Cana', 'price': 799, 'originalPrice': 1499, 'savingsPercent': 47,
        'duration': '5 nights', 'travelDates': 'May - Sep 2026',
        'whatsIncluded': ['Round-trip airfare', 'Oceanview room'],
        'bookingWindow': 'Book by Jun 30'}
html = env.get_template('index.html.j2').render(
    deal=deal, keyword='PUNTACANA', beats=beats.plan_beats(deal),
    css='/* css */',
)
assert 'PUNTACANA' in html
assert 'Punta Cana' in html
assert 'scene-beat-1' in html
assert 'data-composition-id=\"main\"' in html
print('template renders OK; length=', len(html), 'chars')
"
```

Expected: `template renders OK; length= <n> chars`.

- [ ] **Step 5: Commit**

```bash
git add Brand/deal-posts/reels/template/
git -c user.name=bobrien5 commit -m "$(cat <<'EOF'
feat: add deal-reel Hyperframes template (CSS, project, Jinja HTML)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Builder (`builder.py`) — scratch project + lint + render

**Files:**
- Create: `Brand/deal-posts/reels/builder.py`

`builder.py` is integration glue — it does I/O, shells out, moves files. Unit-testing this would mostly mock subprocesses with no real coverage. The end-to-end test in Task 8 is the real verification.

- [ ] **Step 1: Implement `Brand/deal-posts/reels/builder.py`**

```python
"""Builds a 15s 9:16 deal reel using Hyperframes.

Pipeline per deal:
1. Resolve a temp scratch dir
2. Render index.html.j2 with deal/keyword/beats/css into <scratch>/index.html
3. Copy reel-styles.css, hyperframes.json into <scratch>/
4. Copy logo-white.svg, music.mp3, and the 5 deal photos into <scratch>/assets/
5. `npx hyperframes lint` — fail loud on errors
6. `npx hyperframes render` — wait, find the output MP4 under <scratch>/renders/
7. Move that MP4 to the requested out_path
"""
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional

from jinja2 import Environment, FileSystemLoader

# Plain `import` works because conftest.py at Brand/deal-posts/ adds that dir to sys.path
# and Brand/deal-posts/reels/conftest.py (created in tests) lifts reels/ similarly.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import imagery  # noqa: E402

from reels import beats as beats_mod  # type: ignore  # noqa: E402

TEMPLATE_DIR = Path(__file__).parent / "template"
ASSETS_DIR = Path(__file__).parent / "assets"
MUSIC_FILE = ASSETS_DIR / "music.mp3"
LOGO_FILE = ASSETS_DIR / "logo-white.svg"


def _check_prereqs() -> None:
    """Fail loud if Node 22+ or the music file is missing."""
    try:
        out = subprocess.run(["node", "--version"], capture_output=True, text=True, check=True).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        raise RuntimeError("node is not on PATH; install Node 22+ (nvm install 22)") from e
    # out looks like "v22.5.1"
    major = int(out.lstrip("v").split(".", 1)[0])
    if major < 22:
        raise RuntimeError(f"Hyperframes needs Node >=22, got {out}. Run: nvm install 22 && nvm use 22")
    if not MUSIC_FILE.exists():
        raise RuntimeError(f"music track not found at {MUSIC_FILE}. See reels/README.md for sourcing.")
    if not LOGO_FILE.exists():
        raise RuntimeError(f"logo not found at {LOGO_FILE}. Run: cp public/logo-white.svg {LOGO_FILE}")


def _render_template(deal: dict, keyword: str, beats_list: list) -> str:
    env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))
    css = (TEMPLATE_DIR / "reel-styles.css").read_text()
    return env.get_template("index.html.j2").render(
        deal=deal, keyword=keyword, beats=beats_list, css=css
    )


def _materialize_scratch(scratch: Path, html: str, image_paths: dict) -> None:
    """Lay out the scratch Hyperframes project."""
    (scratch / "assets").mkdir(parents=True, exist_ok=True)
    (scratch / "index.html").write_text(html)
    shutil.copy(TEMPLATE_DIR / "hyperframes.json", scratch / "hyperframes.json")
    shutil.copy(LOGO_FILE, scratch / "assets" / "logo-white.svg")
    shutil.copy(MUSIC_FILE, scratch / "assets" / "music.mp3")
    # Photos: hook + beat1..beatN — copy each to its expected filename
    for role, src in image_paths.items():
        shutil.copy(src, scratch / "assets" / f"{role}.jpg")


def _run(cmd: list, cwd: Path) -> None:
    """Run a subprocess; raise with stderr on non-zero exit."""
    proc = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            f"{' '.join(cmd)} failed (exit {proc.returncode})\n"
            f"stdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )


def build_reel(deal: dict, keyword: str, work_dir: Path, out_path: Path) -> Path:
    """Build a single 9:16 reel for a deal.

    work_dir: a directory (provided by the caller) where image downloads live.
              Reused for the Hyperframes scratch project (a subdir).
    out_path: final MP4 destination (e.g. Brand/deal-posts/{slug}/reel-9x16.mp4).
    Returns out_path on success."""
    _check_prereqs()
    work_dir = Path(work_dir)
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Download/Gemini photos for the 5 reel roles into work_dir/photos
    photos_dir = work_dir / "photos"
    photos_dir.mkdir(parents=True, exist_ok=True)
    image_paths = imagery.ensure_local_reel_images(deal, photos_dir)

    # 2. Plan beats and render the template
    beats_list = beats_mod.plan_beats(deal)
    html = _render_template(deal, keyword, beats_list)

    # 3. Materialize the scratch Hyperframes project
    scratch = work_dir / "scratch"
    scratch.mkdir(parents=True, exist_ok=True)
    _materialize_scratch(scratch, html, image_paths)

    # 4. Lint then render
    _run(["npx", "--yes", "hyperframes", "lint"], cwd=scratch)
    _run(["npx", "--yes", "hyperframes", "render"], cwd=scratch)

    # 5. Move the rendered MP4 to the requested out_path
    renders = scratch / "renders"
    mp4s = sorted(renders.glob("*.mp4")) if renders.exists() else []
    if not mp4s:
        raise RuntimeError(f"render produced no MP4 under {renders}")
    # Most-recent file wins (single render produces one).
    shutil.move(str(mp4s[-1]), str(out_path))
    return out_path
```

- [ ] **Step 2: Quick smoke that the module loads + prereq check fires cleanly**

Run: `cd Brand/deal-posts && python3 -c "from reels import builder; print('builder imports OK')"`
Expected: `builder imports OK`. (Does not invoke `_check_prereqs`; that fires when `build_reel` is called.)

- [ ] **Step 3: Commit**

```bash
git add Brand/deal-posts/reels/builder.py
git -c user.name=bobrien5 commit -m "$(cat <<'EOF'
feat: add Hyperframes builder for deal reels

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Generate orchestrator — wire in `reel`

**Files:**
- Modify: `Brand/deal-posts/generate.py`

The existing `generate_deal` already handles static + carousel. Add a `reel` branch that calls `reels.builder.build_reel`.

- [ ] **Step 1: Update `Brand/deal-posts/generate.py`**

Locate the `generate_deal` function. Inside the `with tempfile.TemporaryDirectory() as work:` block, **after** the carousel branch and **before** the `meta = captions.build_meta(...)` call, add:

```python
        if "reel" in formats:
            from reels import builder as reel_builder  # local import to keep optional
            reel_out = deal_dir / "reel-9x16.mp4"
            reel_builder.build_reel(deal, keyword, Path(work), reel_out)
            outputs["reel"] = str(reel_out.relative_to(OUTPUT_ROOT))
```

The local import is intentional — runs of `generate.py --formats static` should not import `reels.builder` (which transitively imports Jinja for the reel template), keeping the image-only path fast and free of Hyperframes prereq checks until you actually ask for a reel.

- [ ] **Step 2: Verify generate.py still imports + helps**

```bash
cd Brand/deal-posts && python3 generate.py --help
```
Expected: usage text including `--formats`, no traceback.

- [ ] **Step 3: Run the full test suite**

Run: `cd Brand/deal-posts && python3 -m pytest tests/ reels/tests/ -v`
Expected: all tests pass (33 from PR #3 + 7 new beats + 2 new captions + 3 new imagery = **45 total**, give or take depending on PR #3 exact count).

- [ ] **Step 4: Commit**

```bash
git add Brand/deal-posts/generate.py
git -c user.name=bobrien5 commit -m "$(cat <<'EOF'
feat: wire reel format into generate orchestrator

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: End-to-end verification

**Files:** none (verification only — requires `.env.local` Sanity creds, network, Node 22, ffmpeg, and the music file in place)

- [ ] **Step 1: Confirm prereqs are real**

```bash
node --version                                       # expect v22.x or higher
ffmpeg -version 2>&1 | head -1                       # expect a version line
ls -la Brand/deal-posts/reels/assets/music.mp3       # expect file present, non-zero size
ls -la Brand/deal-posts/reels/assets/logo-white.svg  # expect the brand SVG
```

If any of these fail, fix the prereq before continuing (see `Brand/deal-posts/reels/README.md`).

- [ ] **Step 2: Pick a real Sanity slug**

Use the same Python one-liner from PR #3 Task 9 to list deals with `heroImage` set, and pick the first. Record the slug.

- [ ] **Step 3: Generate just the reel**

```bash
cd Brand/deal-posts
python3 generate.py --slug <real-slug> --keyword TESTREEL --formats reel
```

Expected: `done: <slug> -> {'reel': '<slug>/reel-9x16.mp4'}` with no traceback. The render typically takes 20-60s.

- [ ] **Step 4: Verify the MP4**

```bash
cd Brand/deal-posts
ls -la <slug>/reel-9x16.mp4
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration <slug>/reel-9x16.mp4
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels <slug>/reel-9x16.mp4
cat <slug>/meta.json
```

Expected:
- File exists, > 500 KB
- Width = 1080, height = 1920
- `r_frame_rate=30/1` (or `30000/1001`)
- `duration` ≈ 15.0 s
- An audio stream is present (codec aac or similar)
- `meta.json` includes `outputs.reel` and `scheduling.platforms_by_format.reel == ["facebook", "instagram", "tiktok"]`

- [ ] **Step 5: Visual spot-check**

```bash
open <slug>/reel-9x16.mp4
```

Confirm by eye:
- Frame 0 shows the hook (destination + price) immediately, no fade-in, no black flash
- 4 beat scenes (or fewer if the deal has fewer sources) appear with Ken-Burns motion
- CTA at the end is solid Hero Green with `Comment TESTREEL`
- Music plays through, fades or stops cleanly at 15 s
- Logo lockup is visible top-left on every frame

- [ ] **Step 6: Confirm output stays gitignored**

```bash
cd /Users/brendanobrien/Documents/Claude/vacationpro
git status --short Brand/deal-posts/<slug>/
```

Expected: empty. If the MP4 shows up, the `.gitignore` update in Task 1 is wrong.

- [ ] **Step 7: Generate all three formats together**

```bash
cd Brand/deal-posts
python3 generate.py --slug <real-slug> --keyword TESTKEY --formats static,carousel,reel
cat <slug>/meta.json
ls -la <slug>/ <slug>/carousel/
```

Expected: `static-4x5.jpg` + 4-5 carousel slides + `reel-9x16.mp4` all present, `meta.json` has all three formats wired with their platform lists.

- [ ] **Step 8: Clean up**

```bash
rm -rf Brand/deal-posts/<slug>
```

(Generated, gitignored, recreated on demand.)

---

## Out of scope (do not build here)

- **Voiceover** (Hyperframes `tts` integration) — separate v2 spec.
- **AI-generated B-roll clips** replacing Ken Burns stills.
- **Multiple music tracks** selected by destination mood.
- **Per-platform variants** (TikTok-specific safe zones, etc.).
- **Refactoring the existing `render.py` to share a browser** with the image pipeline — image and reel rendering are still separate processes.
