"""CLI orchestrator for the deal-post generators.

Single deal:  python generate.py --slug punta-cana-3n --keyword PUNTACANA --formats static,carousel
Batch:        python generate.py --batch path/to/deal-sheet.csv

Batch CSV columns: slug,keyword,formats,flight_estimate
"""
import argparse
import csv
import json
import sys
import tempfile
from pathlib import Path
from typing import Optional

import sanity_client
import imagery
import templating
import render
import captions

OUTPUT_ROOT = Path(__file__).parent


def parse_cli_args(argv: list) -> dict:
    """Parse CLI args into a normalized dict. Exits (SystemExit) on bad input."""
    parser = argparse.ArgumentParser(description="Generate VacationPro deal posts.")
    parser.add_argument("--slug")
    parser.add_argument("--keyword")
    parser.add_argument("--formats", default="static,carousel")
    parser.add_argument("--flight-estimate", dest="flight_estimate", default="")
    parser.add_argument("--batch")
    ns = parser.parse_args(argv)

    if ns.batch:
        return {"mode": "batch", "batch_csv": ns.batch}
    if not ns.slug or not ns.keyword:
        parser.error("single mode requires both --slug and --keyword (or use --batch)")
    return {
        "mode": "single",
        "slug": ns.slug,
        "keyword": ns.keyword.strip().upper(),
        "formats": [f.strip() for f in ns.formats.split(",") if f.strip()],
        "flight_estimate": ns.flight_estimate,
    }


def read_deal_sheet(csv_path) -> list:
    """Read the weekly deal-sheet CSV into a list of normalized job dicts."""
    rows = []
    with open(csv_path, newline="") as f:
        for raw in csv.DictReader(f):
            rows.append({
                "slug": raw["slug"].strip(),
                "keyword": raw["keyword"].strip().upper(),
                "formats": [x.strip() for x in raw.get("formats", "static,carousel").split(",") if x.strip()],
                "flight_estimate": (raw.get("flight_estimate") or "").strip(),
            })
    return rows


def generate_deal(slug: str, keyword: str, formats: list, flight_estimate: str = "") -> dict:
    """Generate the requested formats for one deal. Returns the meta.json dict."""
    deal = sanity_client.fetch_deal(slug)
    deal_dir = OUTPUT_ROOT / slug
    deal_dir.mkdir(parents=True, exist_ok=True)
    outputs = {}

    with tempfile.TemporaryDirectory() as work:
        local = imagery.ensure_local_images(deal, Path(work))
        images = {role: imagery.to_data_uri(path) for role, path in local.items()}

        if "static" in formats:
            html = templating.render_static(deal, keyword, images)
            out = deal_dir / "static-4x5.jpg"
            render.render_html_to_jpg(html, out)
            outputs["static"] = str(out.relative_to(OUTPUT_ROOT))

        if "carousel" in formats:
            slides_html = templating.render_carousel(deal, keyword, images, flight_estimate)
            carousel_dir = deal_dir / "carousel"
            carousel_dir.mkdir(exist_ok=True)
            slide_paths = []
            for i, slide_html in enumerate(slides_html, start=1):
                out = carousel_dir / f"slide-{i:02d}.jpg"
                render.render_html_to_jpg(slide_html, out)
                slide_paths.append(str(out.relative_to(OUTPUT_ROOT)))
            outputs["carousel"] = slide_paths

        if "reel" in formats:
            from reels import builder as reel_builder  # local import to keep optional
            reel_out = deal_dir / "reel-9x16.mp4"
            reel_builder.build_reel(deal, keyword, Path(work), reel_out)
            outputs["reel"] = str(reel_out.relative_to(OUTPUT_ROOT))

    meta = captions.build_meta(deal, keyword, formats, outputs)
    (deal_dir / "meta.json").write_text(json.dumps(meta, indent=2))
    return meta


def run_single(args: dict) -> None:
    meta = generate_deal(args["slug"], args["keyword"], args["formats"], args["flight_estimate"])
    print(f"  done: {args['slug']} -> {meta['outputs']}")


def run_batch(args: dict) -> None:
    jobs = read_deal_sheet(args["batch_csv"])
    print(f"batch: {len(jobs)} deals")
    for job in jobs:
        try:
            generate_deal(job["slug"], job["keyword"], job["formats"], job["flight_estimate"])
            print(f"  done: {job['slug']}")
        except Exception as e:  # noqa: BLE001 - one bad deal must not abort the batch
            print(f"  FAILED: {job['slug']}: {e}", file=sys.stderr)


def main(argv: Optional[list] = None) -> None:
    args = parse_cli_args(sys.argv[1:] if argv is None else argv)
    if args["mode"] == "batch":
        run_batch(args)
    else:
        run_single(args)


if __name__ == "__main__":
    main()
