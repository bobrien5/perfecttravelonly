"""Fetches a VacationPro deal from Sanity over the HTTP/GROQ API."""
import os
import re
import urllib.parse
import requests
import config

_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")

_FIELDS = (
    'title, "slug": slug.current, destination, price, originalPrice, savingsPercent, '
    "heroImage, galleryImages, whatsIncluded, travelDates, duration, bookingWindow, disclaimer"
)


def build_deal_query(slug: str) -> str:
    """Return the GROQ query for a single deal document by slug.
    Rejects any slug that is not lowercase kebab-case, to prevent GROQ injection."""
    if not _SLUG_RE.fullmatch(slug):
        raise ValueError(f"invalid slug: {slug!r}")
    return f'*[_type=="deal" && slug.current=="{slug}"][0]{{{_FIELDS}}}'


def parse_deal(raw: dict) -> dict:
    """Normalize a Sanity query response into a deal dict.
    Raises ValueError if the deal was not found."""
    result = raw.get("result")
    # `not result` intentionally covers both null (deal not found) and {} (empty
    # result object) — both mean "no usable deal" and get the same clear error.
    if not result:
        raise ValueError(f"deal not found in Sanity response: {raw!r}")
    return {
        "title": result["title"],
        "slug": result["slug"],
        "destination": result["destination"],
        "price": result["price"],
        "originalPrice": result["originalPrice"],
        "savingsPercent": result["savingsPercent"],
        "heroImage": result["heroImage"],
        "galleryImages": result.get("galleryImages") or [],
        "whatsIncluded": result.get("whatsIncluded") or [],
        "travelDates": result.get("travelDates") or "",
        "duration": result.get("duration") or "",
        "bookingWindow": result.get("bookingWindow") or "",
        "disclaimer": result.get("disclaimer") or "",
    }


def fetch_deal(slug: str) -> dict:
    """Fetch and normalize a deal from Sanity by slug."""
    config.load_env()
    project = os.environ["NEXT_PUBLIC_SANITY_PROJECT_ID"]
    dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
    api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION", "2026-03-09")
    token = os.environ["SANITY_API_WRITE_TOKEN"]  # write token also grants read
    query = build_deal_query(slug)
    url = (
        f"https://{project}.api.sanity.io/v{api_version}/data/query/{dataset}"
        f"?query={urllib.parse.quote(query)}"
    )
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=30)
    resp.raise_for_status()
    return parse_deal(resp.json())
