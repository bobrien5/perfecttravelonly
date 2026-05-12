#!/usr/bin/env python3
"""
Batch-generate VacationPro FB images from a JSON brief file.

Brief format: list of {hook, competitor, our_angle, slug, only?} entries.

Usage:
  python3 fb_batch.py briefs/2026-04-28.json
  python3 fb_batch.py briefs/2026-04-28.json --skip-existing
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fb_image_from_competitor import OUT_ROOT, build_prompt
from kie_gpt_image import generate


def run(brief_path: Path, skip_existing: bool):
    briefs = json.loads(brief_path.read_text())
    for i, b in enumerate(briefs, 1):
        slug = b["slug"]
        out_dir = OUT_ROOT / slug
        out_dir.mkdir(parents=True, exist_ok=True)

        fmts = set(b.get("formats", ["square"]))
        targets = []
        if "square" in fmts:
            targets.append(("1:1", "square.png"))
        if "landscape" in fmts:
            targets.append(("16:9", "landscape.png"))

        print(f"\n[{i}/{len(briefs)}] {slug} - \"{b['hook']}\"")
        for aspect, filename in targets:
            out_path = out_dir / filename
            if skip_existing and out_path.exists():
                print(f"  skip {filename} (exists)")
                continue
            prompt = build_prompt(b["hook"], b["competitor"], b["our_angle"], aspect)
            print(f"  {filename} ({aspect})...")
            generate(prompt, out_path, aspect=aspect)
            print(f"  -> {out_path}")

        (out_dir / "meta.txt").write_text(
            f"hook: {b['hook']}\ncompetitor: {b['competitor']}\nour_angle: {b['our_angle']}\n"
        )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("brief")
    ap.add_argument("--skip-existing", action="store_true")
    args = ap.parse_args()
    run(Path(args.brief), args.skip_existing)


if __name__ == "__main__":
    main()
