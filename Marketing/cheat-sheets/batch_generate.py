#!/usr/bin/env python3
"""Batch-generate 10 'Save This Cheat Sheet' style infographics via KIE.AI gpt-image-2.

Style template matches the top-performing vacationpro.co Caribbean Cheat Sheet Part 2:
- Top half: photo background with brushy white "SAVE THIS" + topic in big white brush + yellow subtitle + pink "PART X" badge
- Bottom: cream background, 4x2 grid of 8 rounded category cards, colored circle icons, 5-item lists with flag-style markers per row
- Aspect 2:3 vertical
"""
from __future__ import annotations
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from kie_gpt_image import generate

OUT_DIR = Path(__file__).resolve().parent


STYLE_HEADER = """A vibrant Instagram travel infographic poster, vertical 2:3 format, in the exact style of a "Save This Cheat Sheet" social media graphic.

TOP THIRD (photo background with overlaid text): {photo_scene}
Add a small white airplane silhouette with dotted travel-line doodle in the upper-right sky.

OVERLAID HEADLINE on the photo:
- "SAVE THIS" in chunky white hand-painted brush font, slightly tilted
- "{title_line}" in massive bold white brush-stroke font with bright yellow highlight accents and small white sparkle/star marks
- "{subtitle}" in bold thick yellow sans-serif text
- A pink rounded badge below the subtitle saying "{part_badge}" in white bold playful font with curved-arrow and dash doodle accents

BOTTOM TWO-THIRDS: warm cream/off-white textured paper background with a clean 4-columns x 2-rows grid of 8 rounded-rectangle category cards. Each card has a colored circle icon on top, an all-caps bold category title in matching color underneath, and a 5-item destination list with a small flag-style colored bar next to each name."""

STYLE_FOOTER = """Style: bright, fun, playful, social-media-friendly, modern clean typography, high contrast, mobile-optimized for Instagram. Crisp readable text. Cream textured background bottom. No watermarks, no logos, no extra Instagram UI."""


def build_prompt(spec: dict) -> str:
    cards = "\n".join(
        f"{i+1}. {c['title']} ({c['icon_color']} {c['icon']} icon): {', '.join(c['items'])}"
        for i, c in enumerate(spec["cards"])
    )
    return f"""{STYLE_HEADER.format(**spec)}

The 8 categories (left-to-right, top-to-bottom) and their lists:
{cards}

{STYLE_FOOTER}"""


SPECS = [
    {
        "slug": "02_caribbean_part3",
        "photo_scene": "A breathtaking Caribbean beach with turquoise water, white sand, palm trees, sailboats in the distance, bright blue sky",
        "title_line": "CARIBBEAN",
        "subtitle": "TRAVEL CHEAT SHEET",
        "part_badge": "PART 3",
        "cards": [
            {"title": "BEST FOR FAMILIES", "icon": "family", "icon_color": "teal", "items": ["Bahamas", "Dominican Republic", "Aruba", "Turks & Caicos", "Jamaica"]},
            {"title": "BEST NIGHTLIFE", "icon": "music note", "icon_color": "orange", "items": ["Puerto Rico", "Jamaica", "Bahamas", "Dominican Republic", "Aruba"]},
            {"title": "BEST DIVING", "icon": "scuba mask", "icon_color": "green", "items": ["Cayman Islands", "Bonaire", "Belize", "Curacao", "Turks & Caicos"]},
            {"title": "BEST WEATHER", "icon": "sun", "icon_color": "purple", "items": ["Aruba", "Curacao", "Bonaire", "Barbados", "Antigua"]},
            {"title": "MOST ROMANTIC", "icon": "hearts", "icon_color": "pink", "items": ["St. Lucia", "Antigua", "Turks & Caicos", "Anguilla", "Grenada"]},
            {"title": "BEST RUM", "icon": "cocktail glass", "icon_color": "blue", "items": ["Jamaica", "Barbados", "Puerto Rico", "Dominican Republic", "Martinique"]},
            {"title": "BEST FOR HIKING", "icon": "mountain", "icon_color": "red", "items": ["Dominica", "St. Kitts & Nevis", "Grenada", "St. Lucia", "Puerto Rico"]},
            {"title": "MOST AFFORDABLE", "icon": "dollar sign", "icon_color": "teal-green", "items": ["Dominican Republic", "Jamaica", "Puerto Rico", "Curacao", "Belize"]},
        ],
    },
    {
        "slug": "03_dominican_republic",
        "photo_scene": "A stunning Punta Cana beach with palm trees, white sand, clear blue water, beach umbrellas in the distance",
        "title_line": "DOMINICAN REPUBLIC",
        "subtitle": "ALL-INCLUSIVE CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "BEST BEACHES", "icon": "palm tree", "icon_color": "teal", "items": ["Punta Cana", "Bavaro", "Cap Cana", "Playa Rincon", "Las Terrenas"]},
            {"title": "BEST RESORTS", "icon": "hotel", "icon_color": "orange", "items": ["Hard Rock PC", "Excellence PC", "Secrets Cap Cana", "Sanctuary Cap Cana", "Iberostar Grand"]},
            {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "green", "items": ["Samana", "Las Terrenas", "Puerto Plata", "Bayahibe", "Cabarete"]},
            {"title": "BEST FOR FIRST-TIMERS", "icon": "camera", "icon_color": "purple", "items": ["Punta Cana", "Bavaro", "Cap Cana", "La Romana", "Puerto Plata"]},
            {"title": "ADULTS-ONLY", "icon": "cocktail glass", "icon_color": "pink", "items": ["Excellence PC", "Secrets Cap Cana", "Hideaway Royalton", "Breathless PC", "Sanctuary Cap Cana"]},
            {"title": "BEST FOR FAMILIES", "icon": "family", "icon_color": "blue", "items": ["Hard Rock PC", "Nickelodeon PC", "Hyatt Ziva", "Dreams Royal Beach", "Memories Splash"]},
            {"title": "BEST FOR COUPLES", "icon": "hearts", "icon_color": "red", "items": ["Sanctuary Cap Cana", "Excellence El Carmen", "Secrets Royal Beach", "Zoetry Agua", "Tortuga Bay"]},
            {"title": "BEST VALUE", "icon": "dollar sign", "icon_color": "teal-green", "items": ["Riu Republica", "Iberostar Selection", "Royalton Splash", "Bahia Principe", "Be Live Collection"]},
        ],
    },
    {
        "slug": "04_jamaica",
        "photo_scene": "A scenic Jamaica beach in Negril with palm trees, turquoise water, the famous cliffs in the distance, lush green hills",
        "title_line": "JAMAICA",
        "subtitle": "ALL-INCLUSIVE CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "BEST BEACHES", "icon": "palm tree", "icon_color": "teal", "items": ["Seven Mile Beach", "Doctor's Cave", "Frenchman's Cove", "Treasure Beach", "Bloody Bay"]},
            {"title": "BEST RESORTS", "icon": "hotel", "icon_color": "orange", "items": ["Sandals Royal", "Half Moon", "Round Hill", "Couples Tower Isle", "Excellence Oyster Bay"]},
            {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "green", "items": ["Port Antonio", "Treasure Beach", "Falmouth", "Runaway Bay", "Oracabessa"]},
            {"title": "BEST FOR FIRST-TIMERS", "icon": "camera", "icon_color": "purple", "items": ["Montego Bay", "Negril", "Ocho Rios", "Runaway Bay", "Falmouth"]},
            {"title": "ADULTS-ONLY", "icon": "cocktail glass", "icon_color": "pink", "items": ["Sandals Royal", "Couples Negril", "Hideaway Royalton", "Secrets Wild Orchid", "Breathless MBJ"]},
            {"title": "BEST FOR ADVENTURE", "icon": "mountain", "icon_color": "blue", "items": ["Blue Mountains", "YS Falls", "Dunn's River", "Rick's Cafe", "Black River"]},
            {"title": "BEST FOR COUPLES", "icon": "hearts", "icon_color": "red", "items": ["Couples Swept Away", "Sandals South Coast", "Round Hill", "Jamaica Inn", "GoldenEye"]},
            {"title": "BEST VALUE", "icon": "dollar sign", "icon_color": "teal-green", "items": ["Riu Negril", "Royalton Negril", "Bahia Principe", "Iberostar Rose Hall", "Holiday Inn MBJ"]},
        ],
    },
    {
        "slug": "05_adults_only",
        "photo_scene": "A luxurious adults-only resort beach scene with infinity pool overlooking turquoise ocean, palm trees, sun loungers, two cocktails on a poolside table",
        "title_line": "ADULTS-ONLY",
        "subtitle": "RESORTS CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "BEST OVERALL", "icon": "crown", "icon_color": "teal", "items": ["Excellence Punta Cana", "Sandals Royal", "Secrets Cap Cana", "Le Blanc Cancun", "Hideaway Royalton"]},
            {"title": "BEST IN MEXICO", "icon": "palm tree", "icon_color": "orange", "items": ["Le Blanc Cancun", "Secrets Moxche", "TRS Yucatan", "Excellence Playa", "Breathless Cancun"]},
            {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "green", "items": ["Zoetry Agua", "Excellence Oyster Bay", "Secrets Tulum", "Sanctuary Cap Cana", "Le Blanc Los Cabos"]},
            {"title": "BEST FOOD", "icon": "fork and knife", "icon_color": "purple", "items": ["Excellence Playa Mujeres", "Le Blanc Los Cabos", "Sandals Royal", "TRS Coral", "Secrets Moxche"]},
            {"title": "MOST ROMANTIC", "icon": "hearts", "icon_color": "pink", "items": ["Sandals Royal Caribbean", "Excellence Riviera", "Zoetry Paraiso", "Secrets Maroma", "Sanctuary Cap Cana"]},
            {"title": "BEST POOL SCENE", "icon": "cocktail glass", "icon_color": "blue", "items": ["Hideaway Royalton", "Temptation Cancun", "Breathless PC", "Live Aqua Cancun", "Riu Palace Aruba"]},
            {"title": "SWIM-UP SUITES", "icon": "swimmer", "icon_color": "red", "items": ["Secrets Cap Cana", "Excellence El Carmen", "TRS Yucatan", "Hideaway Royalton", "Breathless Riviera"]},
            {"title": "BEST VALUE", "icon": "dollar sign", "icon_color": "teal-green", "items": ["Riu Palace Aruba", "Royalton CHIC", "Hideaway Royalton", "Breathless PC", "Secrets St. James"]},
        ],
    },
    {
        "slug": "06_family",
        "photo_scene": "A family-friendly resort beach with a lazy river, water slides, palm trees, blue ocean, kids splashing in the kiddie pool in the foreground",
        "title_line": "FAMILY RESORTS",
        "subtitle": "ALL-INCLUSIVE CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "BIGGEST WATERPARK", "icon": "water slide", "icon_color": "teal", "items": ["Beaches Turks & Caicos", "Nickelodeon Punta Cana", "Hard Rock PC", "Moon Palace Cancun", "Iberostar Bavaro"]},
            {"title": "BEST KIDS CLUB", "icon": "smiley face", "icon_color": "orange", "items": ["Beaches T&C", "Club Med Punta Cana", "Hyatt Ziva Cancun", "Nickelodeon PC", "Dreams Riviera"]},
            {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "green", "items": ["Hyatt Ziva Cap Cana", "Finest Punta Cana", "Dreams Macao", "Azul Beach Riviera", "Generations Maroma"]},
            {"title": "BEST FOR TEENS", "icon": "camera", "icon_color": "purple", "items": ["Beaches T&C", "Hard Rock PC", "Moon Palace Cancun", "Nickelodeon PC", "Hyatt Ziva Rose Hall"]},
            {"title": "BEST FOR TODDLERS", "icon": "teddy bear", "icon_color": "pink", "items": ["Beaches T&C", "Azul Beach Riviera", "Generations Maroma", "Dreams Punta Cana", "Club Med PC"]},
            {"title": "BEST BEACH", "icon": "palm tree", "icon_color": "blue", "items": ["Beaches T&C", "Generations Riviera", "Hyatt Ziva Cap Cana", "Dreams Macao", "Iberostar Grand"]},
            {"title": "BEST FOR ALL AGES", "icon": "family", "icon_color": "red", "items": ["Beaches Negril", "Hard Rock PC", "Moon Palace Jamaica", "Hyatt Ziva Rose Hall", "Dreams Las Mareas"]},
            {"title": "BEST VALUE", "icon": "dollar sign", "icon_color": "teal-green", "items": ["Riu Republica", "Iberostar Bavaro", "Bahia Principe", "Holiday Inn MBJ", "Memories Splash"]},
        ],
    },
    {
        "slug": "07_honeymoon",
        "photo_scene": "A romantic overwater bungalow at sunset, golden hour, crystal clear water, two lounge chairs, champagne bucket, rose petals, dreamy pastel sky",
        "title_line": "HONEYMOON",
        "subtitle": "DESTINATIONS CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "BEST OVERALL", "icon": "hearts", "icon_color": "teal", "items": ["Maldives", "Bora Bora", "St. Lucia", "Santorini", "Bali"]},
            {"title": "OVERWATER BUNGALOWS", "icon": "bungalow", "icon_color": "orange", "items": ["Maldives", "Bora Bora", "Fiji", "Tahiti", "Sandals Jamaica"]},
            {"title": "MOST AFFORDABLE", "icon": "dollar sign", "icon_color": "green", "items": ["Dominican Republic", "Jamaica", "Mexico", "Costa Rica", "Curacao"]},
            {"title": "BEST IN CARIBBEAN", "icon": "palm tree", "icon_color": "purple", "items": ["St. Lucia", "Turks & Caicos", "Antigua", "Anguilla", "Grenada"]},
            {"title": "BEST IN EUROPE", "icon": "castle", "icon_color": "pink", "items": ["Santorini", "Amalfi Coast", "Paris", "Mykonos", "Lake Como"]},
            {"title": "MOST ADVENTUROUS", "icon": "mountain", "icon_color": "blue", "items": ["Costa Rica", "New Zealand", "Iceland", "Patagonia", "Tanzania"]},
            {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "red", "items": ["Seychelles", "Mauritius", "Croatia", "Belize", "Galapagos"]},
            {"title": "BEST LUXURY", "icon": "crown", "icon_color": "teal-green", "items": ["Maldives", "Bora Bora", "St. Barts", "Amalfi Coast", "Seychelles"]},
        ],
    },
    {
        "slug": "08_foodie",
        "photo_scene": "An elegant beachfront fine-dining table at sunset with multiple plated dishes, wine glasses, candles, palm trees, ocean view",
        "title_line": "FOODIE RESORTS",
        "subtitle": "ALL-INCLUSIVE CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "BEST OVERALL", "icon": "fork and knife", "icon_color": "teal", "items": ["Sandals Royal", "Excellence Playa", "Le Blanc Cancun", "Grand Velas Riviera", "TRS Yucatan"]},
            {"title": "BEST IN MEXICO", "icon": "taco", "icon_color": "orange", "items": ["Grand Velas Riviera", "Le Blanc Cancun", "Secrets Maroma", "TRS Yucatan", "UNICO 2087"]},
            {"title": "MOST DINING OPTIONS", "icon": "plate", "icon_color": "green", "items": ["Beaches T&C", "Hard Rock PC", "Moon Palace Cancun", "Sandals Royal", "Hyatt Ziva Cap Cana"]},
            {"title": "BEST STEAKHOUSE", "icon": "steak", "icon_color": "purple", "items": ["Grand Velas RM", "Excellence Playa", "Sandals Royal", "Le Blanc Los Cabos", "Excellence El Carmen"]},
            {"title": "BEST SUSHI", "icon": "sushi", "icon_color": "pink", "items": ["UNICO 2087", "Grand Velas RM", "Le Blanc Cancun", "TRS Coral", "Hard Rock PC"]},
            {"title": "BEST WINE LIST", "icon": "wine glass", "icon_color": "blue", "items": ["Grand Velas", "Excellence Riviera", "Sanctuary Cap Cana", "Zoetry Paraiso", "Rosewood Mayakoba"]},
            {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "red", "items": ["Finest Playa Mujeres", "Generations Maroma", "Zoetry Agua", "Excellence Oyster Bay", "Dreams Natura"]},
            {"title": "BEST VALUE FOODIE", "icon": "dollar sign", "icon_color": "teal-green", "items": ["Iberostar Grand", "Royalton CHIC", "Hideaway Royalton", "Riu Palace", "Bahia Principe Luxury"]},
        ],
    },
    {
        "slug": "09_budget",
        "photo_scene": "A bright sunny beach resort pool with palm trees, blue water, sun loungers, beach umbrellas, casual vacation vibes",
        "title_line": "BUDGET",
        "subtitle": "ALL-INCLUSIVE CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "UNDER $150/NIGHT", "icon": "dollar sign", "icon_color": "teal", "items": ["Riu Republica", "Bahia Principe", "Iberostar Selection", "Royalton Splash", "Memories Splash"]},
            {"title": "BEST IN MEXICO", "icon": "palm tree", "icon_color": "orange", "items": ["Riu Cancun", "Bahia Principe Tulum", "Iberostar Selection", "Allegro Cozumel", "Royal Solaris"]},
            {"title": "BEST IN DR", "icon": "star", "icon_color": "green", "items": ["Riu Republica", "Iberostar Selection", "Royalton Splash", "Bahia Principe Grand", "Be Live Collection"]},
            {"title": "BEST IN JAMAICA", "icon": "camera", "icon_color": "purple", "items": ["Riu Negril", "Royalton Negril", "Bahia Principe Jamaica", "Iberostar Rose Hall", "Holiday Inn MBJ"]},
            {"title": "BEST FOR FAMILIES", "icon": "family", "icon_color": "pink", "items": ["Iberostar Selection", "Bahia Principe", "Holiday Inn MBJ", "Memories Splash", "Allegro Cozumel"]},
            {"title": "ADULTS-ONLY BUDGET", "icon": "cocktail glass", "icon_color": "blue", "items": ["Hideaway Royalton", "Riu Palace Aruba", "Royalton CHIC", "Secrets St. James", "Breathless PC"]},
            {"title": "BEST BEACH", "icon": "umbrella", "icon_color": "red", "items": ["Riu Palace Aruba", "Iberostar Bavaro", "Bahia Principe Tulum", "Riu Negril", "Royalton Negril"]},
            {"title": "MOST UNDERRATED", "icon": "treasure", "icon_color": "teal-green", "items": ["Memories Caribe", "Be Live Collection", "Catalonia", "Sirenis", "Princess Resorts"]},
        ],
    },
    {
        "slug": "10_luxury",
        "photo_scene": "A pristine luxury private beach with white sand, perfect turquoise water, a beach cabana, butler service, palm trees, yacht in the distance",
        "title_line": "LUXURY",
        "subtitle": "ALL-INCLUSIVE CHEAT SHEET",
        "part_badge": "PART 1",
        "cards": [
            {"title": "BEST OVERALL", "icon": "crown", "icon_color": "teal", "items": ["Grand Velas RM", "Rosewood Mayakoba", "Sanctuary Cap Cana", "Le Blanc Cancun", "Excellence Playa"]},
            {"title": "BEST IN MEXICO", "icon": "palm tree", "icon_color": "orange", "items": ["Grand Velas RM", "Rosewood Mayakoba", "Le Blanc Cancun", "UNICO 2087", "Secrets Maroma"]},
            {"title": "BEST PRIVATE POOL", "icon": "diamond", "icon_color": "green", "items": ["Grand Velas", "UNICO 2087", "Rosewood Mayakoba", "Sanctuary Cap Cana", "Zoetry Paraiso"]},
            {"title": "BEST SUITES", "icon": "key", "icon_color": "purple", "items": ["Rosewood Mayakoba", "Grand Velas", "Sanctuary Cap Cana", "Tortuga Bay", "Le Blanc Los Cabos"]},
            {"title": "BUTLER SERVICE", "icon": "bell", "icon_color": "pink", "items": ["Sandals Royal", "Excellence Playa", "Sanctuary Cap Cana", "TRS Yucatan", "Grand Velas RM"]},
            {"title": "BEST FOR COUPLES", "icon": "hearts", "icon_color": "blue", "items": ["Sanctuary Cap Cana", "Rosewood Mayakoba", "Zoetry Agua", "Excellence Playa Mujeres", "Tortuga Bay"]},
            {"title": "MOST UNDERRATED", "icon": "star", "icon_color": "red", "items": ["Zoetry Agua Punta Cana", "Excellence Oyster Bay", "Tortuga Bay", "Casa Velas", "Esperanza Cabo"]},
            {"title": "OVERWATER VIBES", "icon": "bungalow", "icon_color": "teal-green", "items": ["Sandals South Coast", "El Dorado Maroma", "Palafitos Riviera Maya", "Sandals MBJ", "Sandals Royal Caribbean"]},
        ],
    },
]


def run_one(spec: dict):
    out_path = OUT_DIR / f"{spec['slug']}.png"
    print(f"[start] {spec['slug']}")
    try:
        prompt = build_prompt(spec)
        paths = generate(prompt, out_path, aspect="2:3")
        print(f"[done]  {spec['slug']} -> {paths[0]}")
        return (spec["slug"], "ok", paths[0])
    except Exception as e:
        print(f"[fail]  {spec['slug']}: {e}")
        return (spec["slug"], "fail", str(e))


def main():
    with ThreadPoolExecutor(max_workers=5) as ex:
        futures = [ex.submit(run_one, s) for s in SPECS]
        results = [f.result() for f in as_completed(futures)]
    print("\n=== SUMMARY ===")
    for slug, status, info in results:
        print(f"{status:5} {slug}: {info}")


if __name__ == "__main__":
    main()
