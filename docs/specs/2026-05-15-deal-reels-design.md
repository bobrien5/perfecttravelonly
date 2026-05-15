# Deal Reels (9:16) — Design Spec

*Created 2026-05-15. The video-format sibling of the Track 1 deal-post image generators (spec: `docs/specs/2026-05-14-deal-post-templates-design.md`). Builds the 9:16 vertical "deal reel" format for FB Reels, Instagram Reels, and TikTok.*

---

## 1. Purpose

The Track 1 image generators (deal static + deal carousel) ship now in PR #3. They cover the IG/FB feed surfaces. They do not cover the **reel surfaces** (FB Reels, IG Reels, TikTok), which are 9:16 short-form video and where most of Jane & Gigi's organic reach actually comes from.

This sub-project adds a `reel` format to the existing deal-post generators: one Sanity deal slug + one comment keyword → one 15-second 9:16 MP4 ready for Publer.

---

## 2. Scope — v1 calls

Decisions made up front to keep this one shippable iteration:

| Question | v1 choice | Rationale |
|---|---|---|
| Voiceover? | **No.** Music + on-screen text only. | Skips an entire TTS pipeline, no audio-length lock, no Milo-style word-collision pitfalls. Many J&G reels are music+text. Voiceover is a clean v2. |
| Footage source? | **Stills + Ken Burns** through `heroImage` + `galleryImages` from Sanity. | Reuses the existing `imagery.py`. Zero new generative-AI surface. AI/stock B-roll is a clean v2. |
| Duration? | **15 seconds**, 9:16, 30 fps. | J&G deal reels skew short. 15s keeps the music loop + render budget tight. |
| Music? | **One curated royalty-free track** committed to `reels/assets/`, used for every reel in v1. | Track variety can come later. The track must be cleared for commercial use. |
| Captions / on-screen text? | **Built into the composition** (deal-derived: destination, price, savings %, included list, keyword). | No transcription, no TTS, fully driven by Sanity content. |
| Logo / brand? | **Real `public/logo-white.svg`** as a corner watermark throughout. | Matches the image format treatment. |
| Tooling? | **Hyperframes** (HeyGen, HTML-native, the sandbox at `~/Documents/Claude/hyperframes-sandbox/test-video/` proves the toolchain is installed and working). | Locked in the deal-engine strategy doc. Node 22 + ffmpeg already on the machine. |

---

## 3. Reel anatomy (15 s, 30 fps = 450 frames)

| Time | Section | Content | Visual |
|---|---|---|---|
| 0.0 – 1.5 s | **Hook** | `{Destination},` line 1; `${price}` huge tabular numeric, line 2 | Full-bleed `heroImage`, forest scrim, Inter 900 over it. No motion on the text — instant pop, no fade-in (per Milo rule). |
| 1.5 – 4.0 s | Beat 1 | Single line: e.g. `Flights included` | Ken Burns slow zoom on `galleryImages[0]` (or hero if absent), text lower-third |
| 4.0 – 6.5 s | Beat 2 | Single line: e.g. `5 nights, all-inclusive` | Ken Burns on `galleryImages[1]`, text lower-third |
| 6.5 – 9.0 s | Beat 3 | Single line: e.g. `Was $1,499` (strikethrough) → `Now $799` | Ken Burns on `galleryImages[2]`, amber price pill |
| 9.0 – 12.0 s | Beat 4 | Single line: e.g. `Book by Jun 30` (`bookingWindow`) or the catch | Ken Burns on `galleryImages[3]` or hero |
| 12.0 – 15.0 s | **CTA** | `Comment {KEYWORD}` huge, sub-line: `and I'll send you the link to book` | Solid Hero Green (`#4ac850`) frame, white text |

Beat-text content draws from the same Sanity fields the carousel uses (`whatsIncluded`, `travelDates`, `duration`, `bookingWindow`, `originalPrice`, `savingsPercent`). Beats with no source content are skipped, and the remaining beats stretch to fill the body window (so a deal with sparse content still gets a coherent reel).

**Brand lockup:** the `logo-white.svg` mark + "VacationPro" wordmark sits in a corner (top-left, scaled small) on every frame. Same lockup as the static/carousel.

**Music:** the curated track loops/trims to exactly 15 s, fades out in the last 0.3 s.

**Transitions:** hard cuts between beats. **No fades, no zoom-ins on entry** (per the project's Milo rule — videos must start instantly from frame 1).

---

## 3a. Prerequisites (not in this implementation plan)

- **A royalty-free music track**, cleared for commercial use, dropped at `Brand/deal-posts/reels/assets/music.mp3`. This is a one-time sourcing task (Epidemic Sound, Artlist, or similar). The implementation plan will assume the file is present; the build fails fast and loud if it's missing.
- **Hyperframes CLI working on the build machine** (`npx hyperframes doctor` reports clean). The sandbox at `~/Documents/Claude/hyperframes-sandbox/test-video/` already proves Node 22 + ffmpeg are in place.

---

## 4. Pipeline

```
              ┌─────────────────────────────────────┐
              │  Inputs (same as image generators)  │
              │   • deal slug                       │
              │   • keyword                         │
              │   • formats (now incl. 'reel')      │
              │   • flight_estimate (optional)      │
              └────────────────┬────────────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │   generate.py           │  (existing CLI, extended)
                  └─────┬───────────────┬───┘
                        │               │
        sanity_client   │               │   imagery
        ─────────────   ▼               ▼   ────────────────────────
        fetch_deal()                        download real photos →
                                            local files (NO base64,
                                            Hyperframes reads files)
                        │               │
                        ▼               ▼
                  ┌──────────────────────────┐
                  │   reels/builder.py       │  ← NEW
                  │   • plans beats from deal│
                  │   • renders composition  │
                  │     HTML from a template │
                  │   • writes hyperframes   │
                  │     scratch project      │
                  └────────────┬─────────────┘
                               │
                               ▼
                  ┌──────────────────────────┐
                  │   npx hyperframes render │  ← shells out
                  │   → mp4                  │
                  └────────────┬─────────────┘
                               │
                               ▼
                  ┌──────────────────────────┐
                  │   captions.py            │  (existing)
                  │   • build_meta updates   │
                  │     outputs to include   │
                  │     reel path            │
                  └────────────┬─────────────┘
                               │
                               ▼
                  Brand/deal-posts/{slug}/
                    static-4x5.jpg          (existing)
                    carousel/slide-*.jpg    (existing)
                    reel-9x16.mp4           ← NEW
                    meta.json               (updated)
                               │
                               ▼
                       Publer scheduling
                       (FB + IG Reels + TikTok)
```

The reel path **reuses** `sanity_client.fetch_deal`, `imagery.pick_image_urls`/`ensure_local_images`, and `captions.build_meta`. The new work is `reels/builder.py` (the orchestration), a Jinja2 Hyperframes-composition template, and an assets directory with the music track and any shared video bits.

---

## 5. Modules and file structure

New work (under `Brand/deal-posts/reels/`):

| File | Responsibility |
|---|---|
| `Brand/deal-posts/reels/builder.py` | `build_reel(deal, keyword, work_dir, out_path) -> Path`. Plans beats from Sanity data, materializes a Hyperframes scratch project in a temp dir, shells out to `npx hyperframes render`, returns the MP4 path. |
| `Brand/deal-posts/reels/beats.py` | `plan_beats(deal, keyword) -> list[Beat]` — pure logic that picks 4 beat texts from the deal's content (with sensible fallbacks when fields are missing) and returns them with timecodes. Unit-tested. |
| `Brand/deal-posts/reels/template/index.html.j2` | Jinja2 template for the Hyperframes composition. Renders to a real `index.html` Hyperframes can render. |
| `Brand/deal-posts/reels/template/hyperframes.json` | Hyperframes project config (registry + paths). Copied verbatim into each scratch project. |
| `Brand/deal-posts/reels/template/reel-styles.css` | All brand tokens for the reel (analogous to `templates/deal-styles.css`). |
| `Brand/deal-posts/reels/assets/music.mp3` | The curated royalty-free music track. Licensed for commercial use. **Tracked in git** (small enough; LICENSE source noted in `reels/README.md`). |
| `Brand/deal-posts/reels/README.md` | Reel-specific operator notes (music swap, beat layout tuning) — extends the existing `Brand/deal-posts/README.md`. |
| `Brand/deal-posts/reels/tests/test_beats.py` | Beat-planning unit tests. |

Existing files modified (small touches):

| File | Change |
|---|---|
| `Brand/deal-posts/generate.py` | Accept `reel` in `--formats`. When present, call `reels.builder.build_reel` after the image work and add the output path to `meta.json`. |
| `Brand/deal-posts/captions.py` | `build_meta`: when `reel` is in `formats`, add the reel path to `outputs` and add `tiktok` to the platforms list for the reel format. |
| `Brand/deal-posts/imagery.py` | Add `ensure_local_images_for_reel(deal, work_dir)` — variant that downloads up to 4 gallery images locally for the Ken Burns beats. Keeps the existing 3-role version for the image generators. |
| `.gitignore` | `!Brand/deal-posts/reels/`, `!Brand/deal-posts/reels/template/`, `!Brand/deal-posts/reels/assets/`, `!Brand/deal-posts/reels/tests/` and matching whitelists for `.py`, `.html`, `.j2`, `.css`, `.json`, `.mp3`, `.md`. Per-deal `*.mp4` output stays ignored. |

**Generated output** (stays gitignored): `Brand/deal-posts/{slug}/reel-9x16.mp4`.

---

## 6. Hyperframes integration

The Hyperframes CLI runs in any directory with a valid project. `builder.py`:

1. Creates a temp dir (e.g. `tempfile.TemporaryDirectory()`).
2. Copies `reels/template/hyperframes.json` and `reels/template/reel-styles.css` in verbatim.
3. Renders `reels/template/index.html.j2` with the deal context (destination, price, beats, keyword, image paths, music path, brand colors) into `index.html`.
4. Copies the deal's downloaded photos + the music track into the scratch project's `assets/`.
5. Shells out: `npx hyperframes render --output <our_out_path>`.
6. Cleans up the temp dir on success.

The HTML composition uses Hyperframes' timeline syntax (`data-composition-id`, tracks). The template encodes the 6-section structure as Hyperframes tracks with explicit timecodes. Beat text is injected by Jinja.

**Lint step**: before render, `builder.py` runs `npx hyperframes lint` and fails loud if it reports errors (per the Hyperframes CLI workflow: "Lint before preview — catches missing `data-composition-id`, overlapping tracks, unregistered timelines").

---

## 7. CLI surface

The existing `generate.py` extends, no new entrypoint:

```bash
# Single deal, all three formats
python3 generate.py --slug punta-cana-3n --keyword PUNTACANA --formats static,carousel,reel

# Just the reel
python3 generate.py --slug punta-cana-3n --keyword PUNTACANA --formats reel

# Batch (CSV gains 'reel' in its formats column)
python3 generate.py --batch deal-sheet.csv
```

`meta.json` for a deal that includes the reel:

```json
{
  ...
  "formats": ["static", "carousel", "reel"],
  "outputs": {
    "static": ".../static-4x5.jpg",
    "carousel": [".../carousel/slide-01.jpg", ...],
    "reel": ".../reel-9x16.mp4"
  },
  "scheduling": {
    "platforms_by_format": {
      "static": ["facebook", "instagram"],
      "carousel": ["facebook", "instagram"],
      "reel": ["facebook", "instagram", "tiktok"]
    }
  }
}
```

---

## 8. Out of scope (named v2+)

- **Voiceover.** Hyperframes has a `tts` command; we wire it up in a v2 spec, with the Milo word-collision rules baked in.
- **AI-generated B-roll clips** (Nano Banana / Veo) replacing or supplementing Ken Burns stills.
- **Music variety** — multiple tracks selected by destination mood (Caribbean vs Mexico vs Hawaii).
- **Caption-burning from a transcript** — irrelevant until v2 adds voiceover.
- **Per-platform variants** (e.g. TikTok-specific safe zones, FB Reels overlay margins).

---

## 9. Success criteria

1. `python3 generate.py --slug <real-slug> --keyword TESTKEY --formats reel` produces a `reel-9x16.mp4` in `Brand/deal-posts/<slug>/`, exit code 0, no traceback.
2. The MP4 is exactly 1080×1920, 15.0 s, 30 fps, has audio (the music track).
3. The hook frame (frame 0) is visible immediately — no fade-in, no zoom-in start.
4. The brand lockup (logo + wordmark) appears in a corner on every frame.
5. The CTA frame at the end is solid Hero Green with `Comment {KEYWORD}` legible.
6. `meta.json` `outputs.reel` is set; `scheduling.platforms_by_format.reel` includes `tiktok`.
7. `npx hyperframes lint` passes on every generated composition.
8. The unit tests for `plan_beats` cover: full content (4 beats), missing fields (gracefully reduced beats), beat-text length limits.
9. Output stays gitignored.
