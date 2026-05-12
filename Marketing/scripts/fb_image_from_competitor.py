#!/usr/bin/env python3
"""
Generate VacationPro Facebook images inspired by competitor top-performing posts.

Bakes a text-overlay hook directly into the image (GPT Image-2 renders legible text).
Generates both 1:1 square (feed) and 16:9 landscape (link share).

Outputs to: Marketing/_fb_images/{slug}/square.png + landscape.png + meta.txt

Usage:
  python3 fb_image_from_competitor.py \\
    --hook "$499 ALL-INCLUSIVE? 😳" \\
    --competitor "Carnival '5 nights Bahamas $399' cruise ship at sunset" \\
    --our-angle "Punta Cana all-inclusive, infinity pool, palm trees" \\
    --slug punta-cana-499

  # Skip text overlay (clean image only):
  python3 fb_image_from_competitor.py --hook "" ...

  # Single format:
  python3 fb_image_from_competitor.py --only square ...
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kie_gpt_image import generate

OUT_ROOT = Path(__file__).resolve().parent.parent / "_fb_images"

BRAND_VOICE = (
    "Aspirational but attainable, premium travel feel. "
    "Vibrant photorealism, cinematic golden hour or bright tropical daylight. "
    "Eye-catching and scroll-stopping. Real-looking destination, not generic stock. "
    "No watermarks, no logos."
)

OVERLAY_STYLE = (
    "Render the headline text as a clean bold sans-serif overlay (think Inter, Montserrat, "
    "or similar geometric sans). White text with a subtle dark drop shadow OR a translucent "
    "dark gradient bar behind the text for legibility. Large, easy to read on a phone screen. "
    "Place text in the lower third (or upper third if the visual subject is in the bottom). "
    "Spell the headline EXACTLY as written, including punctuation, casing, and emojis. "
    "Do not add any other text, sub-headlines, or logos."
)


def build_prompt(hook: str, competitor: str, our_angle: str, aspect: str) -> str:
    fmt = "square 1:1 social feed format" if aspect == "1:1" else "wide 16:9 link-share format"
    visual = (
        f"VacationPro Facebook {fmt} hero image. "
        f"PRIMARY SUBJECT (must be visually identifiable as this exact place, with real landmarks): {our_angle}. "
        f"The location must be recognizable, not a generic tropical beach. "
        f"Style reference (composition and energy only, do not copy content): {competitor}. "
        f"{BRAND_VOICE}"
    )
    if hook.strip():
        visual += f' Render the following headline as text overlay on the image: "{hook}". {OVERLAY_STYLE}'
    else:
        visual += " No text or logos in the image."
    return visual


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--hook", default="", help='Text overlay headline (e.g. "$499 ALL-INCLUSIVE 😳"). Empty = clean image.')
    ap.add_argument("--competitor", required=True, help="Competitor post concept/hook description")
    ap.add_argument("--our-angle", required=True, help="VacationPro angle (destination, price, vibe)")
    ap.add_argument("--slug", required=True, help="Output folder name under _fb_images/")
    ap.add_argument("--formats", default="square", help="Comma-separated: square,landscape (default: square only)")
    args = ap.parse_args()

    out_dir = OUT_ROOT / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)

    fmts = {f.strip() for f in args.formats.split(",")}
    targets = []
    if "square" in fmts:
        targets.append(("1:1", "square.png"))
    if "landscape" in fmts:
        targets.append(("16:9", "landscape.png"))

    for aspect, filename in targets:
        prompt = build_prompt(args.hook, args.competitor, args.our_angle, aspect)
        out_path = out_dir / filename
        print(f"Generating {filename} ({aspect})...")
        generate(prompt, out_path, aspect=aspect)
        print(f"  -> {out_path}")

    meta = out_dir / "meta.txt"
    meta.write_text(
        f"hook: {args.hook}\n"
        f"competitor: {args.competitor}\n"
        f"our_angle: {args.our_angle}\n"
    )
    print(f"  -> {meta}")


if __name__ == "__main__":
    main()
