#!/usr/bin/env python3
"""Regen 01_mexico_part1 and 08_foodie at full resolution."""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from batch_generate import SPECS, build_prompt, OUT_DIR, generate

# Mexico spec wasn't in SPECS — define here
MEXICO_SPEC = {
    "slug": "01_mexico_part1",
    "photo_scene": "A stunning Mexico beach scene with crystal clear turquoise Caribbean water, white sand, palm trees on the left side, blue sky with light clouds, sailboats far in the distance",
    "title_line": "MEXICO",
    "subtitle": "ALL-INCLUSIVE CHEAT SHEET",
    "part_badge": "PART 1",
    "cards": [
        {"title": "BEST BEACHES", "icon": "palm tree", "icon_color": "teal", "items": ["Tulum", "Playa del Carmen", "Cancun", "Isla Mujeres", "Cozumel"]},
        {"title": "BEST FOOD", "icon": "fork and knife", "icon_color": "orange", "items": ["Oaxaca", "Mexico City", "Puebla", "Merida", "Guadalajara"]},
        {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "green", "items": ["Bacalar", "Sayulita", "Holbox", "Huatulco", "Mazatlan"]},
        {"title": "BEST FOR FIRST-TIMERS", "icon": "camera", "icon_color": "purple", "items": ["Cancun", "Cabo San Lucas", "Playa del Carmen", "Riviera Maya", "Puerto Vallarta"]},
        {"title": "BEST FOR RELAXING", "icon": "beach chair", "icon_color": "pink", "items": ["Tulum", "Holbox", "Bacalar", "Akumal", "Costa Mujeres"]},
        {"title": "BEST FOR ADVENTURE", "icon": "mountain", "icon_color": "blue", "items": ["Cabo San Lucas", "Tulum", "Cozumel", "Sayulita", "La Paz"]},
        {"title": "BEST FOR COUPLES", "icon": "hearts", "icon_color": "red", "items": ["Tulum", "Cabo San Lucas", "Riviera Maya", "Playa Mujeres", "Cozumel"]},
        {"title": "BEST VALUE RIGHT NOW", "icon": "dollar sign", "icon_color": "teal-green", "items": ["Cancun", "Playa del Carmen", "Cozumel", "Puerto Vallarta", "Mazatlan"]},
    ],
}

FOODIE_SPEC = next(s for s in SPECS if s["slug"] == "08_foodie")

def run(spec):
    out = OUT_DIR / f"{spec['slug']}.png"
    print(f"[start] {spec['slug']}")
    paths = generate(build_prompt(spec), out, aspect="2:3")
    print(f"[done]  {spec['slug']} -> {paths[0]}")
    return paths[0]

if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=2) as ex:
        list(ex.map(run, [MEXICO_SPEC, FOODIE_SPEC]))
