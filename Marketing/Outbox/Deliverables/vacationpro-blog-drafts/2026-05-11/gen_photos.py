#!/usr/bin/env python3
"""Generate 6 landscape photos for the safest-caribbean-island article."""
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path("/Users/brendanobrien/Documents/Claude/vacationpro/Marketing/scripts")))
from kie_gpt_image import generate

OUT = Path(__file__).resolve().parent / "images"
OUT.mkdir(exist_ok=True)

PHOTOS = [
    ("hero", "A breathtaking aerial photograph of a serene Caribbean island at golden hour, showing crystal-clear turquoise water meeting a long crescent of white sand beach, a few palm trees lining the shore, calm low-wave water, soft cloud cover, no people, no boats, magazine-quality, cinematic, 16:9 landscape orientation, photorealistic, vibrant but natural colors"),
    ("aruba", "A photorealistic landscape photo of Eagle Beach in Aruba, iconic Divi Divi trees leaning over white sand, calm clear turquoise Caribbean water, soft late-afternoon light, no people in frame, vibrant blue sky with a few clouds, professional travel photography, 16:9"),
    ("cayman", "A photorealistic landscape photo of Seven Mile Beach in the Cayman Islands, pristine white sand, perfectly calm crystal-clear water in shades of turquoise and aqua, palm trees, a luxury resort building far in the distance, soft natural lighting, professional travel photography, 16:9"),
    ("turks", "A photorealistic landscape photo of Grace Bay Beach in Turks and Caicos, powder-white sand, brilliant turquoise water, a single luxury beach cabana with white curtains, no people, peaceful and upscale atmosphere, perfect sunny weather, professional travel photography, 16:9"),
    ("barbados", "A photorealistic landscape photo of a calm Caribbean beach on the west coast of Barbados, golden hour, gentle waves, soft pastel sky, palm trees framing the shot, traditional chattel house in the distance, warm friendly atmosphere, professional travel photography, 16:9"),
    ("resort", "A photorealistic landscape photo of an upscale all-inclusive Caribbean resort beach area, manicured palm trees, immaculate pool with infinity edge overlooking the ocean, beach loungers with white umbrellas in neat rows, security and serene atmosphere implied by clean wide-open space, no people in frame, late morning soft light, 16:9"),
]


def run(item):
    slug, prompt = item
    out_path = OUT / f"{slug}.png"
    print(f"[start] {slug}")
    paths = generate(prompt, out_path, aspect="16:9")
    print(f"[done]  {slug}")
    return paths[0]


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(run, PHOTOS))
    print("All photos generated.")
