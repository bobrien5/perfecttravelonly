# Deal Reels (9:16) — Operator Notes

Extension of [`Brand/deal-posts/`](../README.md) that adds a 15-second 9:16 MP4 reel format. Reuses the same Sanity data and lives at the same per-deal output folder.

## Run

```bash
cd Brand/deal-posts
python3 generate.py --slug <slug> --keyword KEY --formats reel
```

`--formats static,carousel,reel` produces all three in one command.

## Prerequisites

1. **Node >= 22**: `node --version`. If lower: `nvm install 22 && nvm use 22`.
2. **ffmpeg** on PATH: `ffmpeg -version`.
3. **Music track** at `Brand/deal-posts/reels/assets/music.mp3`: royalty-free, cleared for commercial use, roughly 15 s (longer is fine; the composition trims). Sources: Epidemic Sound, Artlist, Uppbeat, etc. **Do not commit copyrighted tracks.**

## What it produces

`Brand/deal-posts/{slug}/reel-9x16.mp4` — 1080x1920, 15.0 s, 30 fps, with audio.

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
