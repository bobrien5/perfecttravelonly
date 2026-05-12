#!/usr/bin/env python3
"""
Push a newsletter HTML file to Beehiiv as a draft (or scheduled) post.

Beehiiv API v2:
  POST https://api.beehiiv.com/v2/publications/{publication_id}/posts
  - Bearer <BEEHIIV_API_KEY>
  - Body: {title, body_content (HTML), status, scheduled_at?}
  - <style> and <link> tags are stripped; inline styles survive.
  - base64 data: URIs in <img src> are usually stripped - upload images in Beehiiv UI on draft review.

Usage:
  python3 beehiiv_post.py path/to/newsletter.html \\
    --title "The Caribbean is calling..." \\
    --status draft

  # Schedule directly:
  python3 beehiiv_post.py newsletter.html --title "..." \\
    --status confirmed --scheduled-at 2026-05-01T13:00:00Z

Required env or .keys entries:
  BEEHIIV_API_KEY=<your key>
  BEEHIIV_PUBLICATION_ID=pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

import requests

KEYS_FILE = Path(__file__).resolve().parent.parent / ".keys"
API_BASE = "https://api.beehiiv.com/v2"


def load_secret(name: str) -> str:
    val = os.environ.get(name)
    if val:
        return val
    if KEYS_FILE.exists():
        for line in KEYS_FILE.read_text().splitlines():
            if line.startswith(f"{name}="):
                return line.split("=", 1)[1].strip()
    sys.exit(f"{name} not found (env or {KEYS_FILE})")


def extract_body(html: str) -> str:
    m = re.search(r"<body[^>]*>(.*?)</body>", html, flags=re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else html


def warn_about_data_uris(body: str) -> None:
    count = body.count("data:image/")
    if count:
        print(
            f"WARNING: found {count} base64 data: URI(s) in <img src>. "
            "Beehiiv likely strips these. Upload images via Beehiiv UI on draft review.",
            file=sys.stderr,
        )


def create_post(
    api_key: str,
    publication_id: str,
    title: str,
    body_content: str,
    status: str,
    scheduled_at: str | None = None,
    subtitle: str | None = None,
) -> dict:
    url = f"{API_BASE}/publications/{publication_id}/posts"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload: dict = {
        "title": title,
        "body_content": body_content,
        "status": status,
    }
    if subtitle:
        payload["subtitle"] = subtitle
    if scheduled_at:
        payload["scheduled_at"] = scheduled_at
    r = requests.post(url, headers=headers, json=payload, timeout=60)
    if r.status_code not in (200, 201):
        sys.exit(f"Beehiiv API {r.status_code}: {r.text}")
    return r.json()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html_file", help="Path to the newsletter HTML file")
    ap.add_argument("--title", required=True)
    ap.add_argument("--subtitle", help="Optional preview/subtitle text")
    ap.add_argument("--status", default="draft", choices=["draft", "confirmed"])
    ap.add_argument("--scheduled-at", help="ISO 8601 UTC, e.g. 2026-05-01T13:00:00Z")
    ap.add_argument("--full-html", action="store_true",
                    help="Send the entire HTML file (default extracts <body>)")
    args = ap.parse_args()

    if args.scheduled_at and args.status == "draft":
        sys.exit("Cannot schedule a draft. Use --status confirmed with --scheduled-at.")

    api_key = load_secret("BEEHIIV_API_KEY")
    publication_id = load_secret("BEEHIIV_PUBLICATION_ID")

    raw = Path(args.html_file).read_text()
    body = raw if args.full_html else extract_body(raw)
    warn_about_data_uris(body)

    result = create_post(
        api_key,
        publication_id,
        title=args.title,
        body_content=body,
        status=args.status,
        scheduled_at=args.scheduled_at,
        subtitle=args.subtitle,
    )
    post_id = result.get("data", {}).get("id", "?")
    print(f"OK status={args.status} post_id={post_id}")
    if args.status == "draft":
        print("Open the draft in Beehiiv to upload images and review before scheduling.")


if __name__ == "__main__":
    main()
