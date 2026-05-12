#!/usr/bin/env python3
"""Test gpt-image-2 on a Mexico cheat sheet at full density to gauge text quality."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from kie_gpt_image import generate

PROMPT = """A vibrant Instagram travel infographic poster, vertical format, in the exact style of a "Save This Cheat Sheet" social media graphic.

TOP HALF (background photo): A stunning Mexico beach scene with crystal clear turquoise Caribbean water, white sand, palm trees on the left side, blue sky with light clouds, a small white airplane silhouette with dotted travel-line doodle in the sky on the upper right. Sailboats far in the distance.

OVERLAID HEADLINE TEXT (top):
- "SAVE THIS" in chunky white hand-painted brush font, slightly tilted
- "MEXICO" in massive bold white brush-stroke font with yellow highlight accents and small white sparkle marks beside it
- "ALL-INCLUSIVE CHEAT SHEET" in bold thick yellow sans-serif text
- A pink rounded badge below saying "PART 1" in white bold font with playful doodle accents (curved arrow, dashes)

BOTTOM TWO-THIRDS: Cream/off-white background with a grid of 8 rounded rectangle category cards (4 columns x 2 rows), each card has:
- A colored circle icon at the top (teal, orange, green, purple, pink, blue, red, teal-green)
- Bold all-caps category title in matching color
- A list of 5 Mexican destinations with small flag icons (all Mexican flag) on the left

The 8 categories with their destinations:
1. BEST BEACHES (teal palm icon): Tulum, Playa del Carmen, Cancun, Isla Mujeres, Cozumel
2. BEST FOOD (orange fork-knife icon): Oaxaca, Mexico City, Puebla, Merida, Guadalajara
3. MOST UNDERRATED (green star icon): Bacalar, Sayulita, Holbox, Huatulco, Mazatlan
4. BEST FOR FIRST-TIMERS (purple camera icon): Cancun, Cabo San Lucas, Playa del Carmen, Riviera Maya, Puerto Vallarta
5. BEST FOR RELAXING (pink beach-chair icon): Tulum, Holbox, Bacalar, Akumal, Costa Mujeres
6. BEST FOR ADVENTURE (blue mountain icon): Cabo San Lucas, Tulum, Cozumel, Sayulita, La Paz
7. BEST FOR COUPLES (red hearts icon): Tulum, Cabo San Lucas, Riviera Maya, Playa Mujeres, Cozumel
8. BEST VALUE RIGHT NOW (teal $ icon): Cancun, Playa del Carmen, Cozumel, Puerto Vallarta, Mazatlan

Style: bright, fun, playful, social-media-friendly, clean modern typography, high contrast, mobile-optimized, vertical 4:5 aspect ratio. Crisp readable text. No watermarks."""

if __name__ == "__main__":
    out = Path(__file__).parent / "test_mexico_part1.png"
    paths = generate(PROMPT, out, aspect="2:3")
    for p in paths:
        print(p)
