#!/usr/bin/env python3
"""Generate photos for the remaining 4 articles in the Caribbean cluster."""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, "/Users/brendanobrien/Documents/Claude/vacationpro/Marketing/scripts")
from kie_gpt_image import generate

BASE = Path(__file__).resolve().parent


PHOTOS = {
    # ===== best-caribbean-islands =====
    "best/hero": "Aerial composite-feeling photo of a Caribbean island chain at golden hour, multiple islands visible in the distance, crystal turquoise water, sandbars, photorealistic travel photography, 16:9 cinematic, magazine cover quality",
    "best/beaches": "Pristine empty white sand beach in Turks and Caicos with brilliant turquoise water, soft natural lighting, professional travel photo, 16:9",
    "best/food": "Vibrant Caribbean food spread on a wooden beach table: jerk chicken, plantains, rice and beans, fresh fruit, a Red Stripe beer, sunset light, photorealistic food photography, 16:9",
    "best/underrated": "Colorful pastel waterfront buildings of Willemstad, Curaçao at golden hour, blue sea in foreground, vibrant tropical colors, professional travel photography, 16:9",
    "best/first-timers": "Welcoming entrance of a luxurious all-inclusive Caribbean resort in Punta Cana with palm-lined driveway, lush gardens, calm professional atmosphere, late afternoon light, 16:9",
    "best/relaxing": "The iconic Pitons of St. Lucia at golden hour, lush green jungle, calm Caribbean sea, a lone catamaran in the distance, hammock between palm trees in foreground, peaceful and serene, 16:9",
    "best/adventure": "Lush tropical waterfall in Dominica with crystal-clear pool below, jungle vegetation, mist in the air, adventurous photorealistic travel photo, 16:9",
    "best/couples": "A couple in white linen walking hand-in-hand along an empty Caribbean beach at golden hour from behind, romantic and cinematic, photorealistic, 16:9",

    # ===== cheapest-caribbean-island =====
    "cheap/hero": "A welcoming budget-friendly Caribbean beach scene with palm trees, casual lounge chairs, bright blue water, paper umbrella cocktails in the foreground, value vacation vibe, photorealistic, 16:9",
    "cheap/dr": "A bustling all-inclusive resort pool in Punta Cana Dominican Republic, swim-up bar with vibrant cocktails, palm trees, several lounge chairs, sunny day, value-tier resort feel, photorealistic, 16:9",
    "cheap/jamaica": "Negril Seven Mile Beach Jamaica at golden hour, palm trees, calm turquoise water, the cliffs of Rick's Cafe visible in the distance, casual beach loungers, photorealistic, 16:9",
    "cheap/pr": "Old San Juan Puerto Rico colorful colonial street with cobblestones, pastel buildings, hanging plants, ocean glimpse at the end of the street, warm afternoon light, photorealistic, 16:9",
    "cheap/shoulder": "An empty Caribbean beach during shoulder season, perfect weather, calm water, almost no people, a single beach umbrella and two empty loungers, peaceful and value-friendly atmosphere, photorealistic, 16:9",
    "cheap/budget-resort": "A clean modern budget-friendly Caribbean resort pool area with simple but well-maintained palm trees, blue tile pool, lounge chairs, casual atmosphere, no people, photorealistic, 16:9",

    # ===== best-caribbean-island-for-couples =====
    "couples/hero": "A romantic Caribbean overwater bungalow setup with two cocktail glasses, white linen drapery, sunset sky, calm crystal water below, deeply romantic and cinematic, photorealistic, 16:9",
    "couples/stlucia": "Sugar Beach St. Lucia between the two Pitons mountains, turquoise water, white sand, lush jungle, the iconic shot, photorealistic travel photography, 16:9",
    "couples/turks": "A luxury beachfront cabana with white drapes on Grace Bay Turks and Caicos, turquoise water, white sand, two lounge chairs, intimate romantic vibe, photorealistic, 16:9",
    "couples/antigua": "Half Moon Bay Antigua, perfect crescent beach, calm Caribbean water, palm trees, gentle waves, soft natural light, no crowds, photorealistic travel photography, 16:9",
    "couples/anguilla": "Shoal Bay Anguilla, powder white sand beach, almost no people, calm turquoise water, soft palm shadows, peaceful and exclusive feeling, photorealistic, 16:9",
    "couples/resort": "Two upscale beach loungers under a single white umbrella, a champagne bucket between them, perfect calm Caribbean water in front, sunset golden hour, no people, photorealistic, 16:9",

    # ===== hurricane-season-caribbean =====
    "hurricane/hero": "A serene calm Caribbean beach on a perfect sunny day, palm trees, turquoise water, scattered fluffy clouds, peaceful tranquil atmosphere, photorealistic, 16:9",
    "hurricane/abc": "A dry desert-meets-ocean landscape of Aruba showing the iconic Divi Divi trees bent by trade winds, blue sky, no storm visible, geographic and travel photography, 16:9",
    "hurricane/storm": "Dramatic tropical storm clouds gathering over a Caribbean ocean horizon, dark sky in the background but calm water in the foreground, atmospheric weather photography, photorealistic, 16:9",
    "hurricane/shoulder": "A perfect late-April or early-December Caribbean beach scene, soft golden light, gentle breeze, empty beach, perfect mild weather, peaceful, photorealistic, 16:9",
    "hurricane/insurance": "A close-up of a travel insurance document on a wooden table next to a passport, sunglasses, and a tropical beach hat, with a blurred Caribbean beach background, photorealistic, 16:9",
}


def run(item):
    rel_path, prompt = item
    out_path = BASE / "images" / f"{rel_path}.png"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"[start] {rel_path}")
    paths = generate(prompt, out_path, aspect="16:9")
    print(f"[done]  {rel_path}")
    return paths[0]


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=8) as ex:
        list(ex.map(run, PHOTOS.items()))
    print("All photos generated.")
