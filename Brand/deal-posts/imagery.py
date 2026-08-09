"""Resolves imagery for a deal post: prefers the deal's real photos, falls back
to a Gemini-generated background. Images are downloaded/generated to local files
and embedded as base64 data URIs so rendering needs no network access."""
import base64
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

import requests
import config

# Slide roles that need a background image.
ROLES = ("hook", "included", "details")


def pick_image_urls(deal: dict) -> dict:
    """Choose a source URL per slide role from the deal's real photos.
    hook -> heroImage; included -> galleryImages[0] or hero; details -> galleryImages[1] or hero.
    Any role with no usable image is None (caller must Gemini-generate a fallback)."""
    hero = deal.get("heroImage")
    gallery = deal.get("galleryImages") or []
    return {
        "hook": hero,
        "included": (gallery[0] if len(gallery) >= 1 else hero),
        "details": (gallery[1] if len(gallery) >= 2 else hero),
    }


_MIME_BY_EXT = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def to_data_uri(path: Path) -> str:
    """Base64-encode a local image file as a data: URI.
    MIME is keyed off the file extension; unknown extensions default to PNG."""
    path = Path(path)
    mime = _MIME_BY_EXT.get(path.suffix.lower(), "image/png")
    b = base64.b64encode(path.read_bytes()).decode()
    return f"data:{mime};base64,{b}"


def generate_fallback(prompt: str, out_path: Path, retries: int = 2) -> bool:
    """Generate a background image with Gemini 2.5 Flash Image. Mirrors the
    gen_image() request/response pattern in Brand/ads/_static_ads_gen.py,
    including a retry loop for transient failures (Gemini image-gen is flaky).
    Returns True on success, False (with a stderr note) after all attempts fail --
    callers treat False as 'no fallback available'."""
    config.load_env()
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("  GEMINI_API_KEY not set; cannot generate fallback image", file=sys.stderr)
        return False
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash-image:generateContent?key={key}"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}
    )
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                resp = json.load(r)
            for part in resp.get("candidates", [{}])[0].get("content", {}).get("parts", []):
                if "inlineData" in part:
                    Path(out_path).write_bytes(base64.b64decode(part["inlineData"]["data"]))
                    return True
            print("  gemini: no image in response", file=sys.stderr)
        except Exception as e:  # noqa: BLE001 - surface the error, keep going
            print(f"  gemini fallback failed (attempt {attempt + 1}): {e}", file=sys.stderr)
        if attempt < retries:
            time.sleep(2 * (attempt + 1))
    return False


def ensure_local_images(deal: dict, work_dir: Path) -> dict:
    """For each slide role, download the real photo (or Gemini-generate a fallback)
    into work_dir and return {role: Path}. work_dir must already exist."""
    work_dir = Path(work_dir)
    picks = pick_image_urls(deal)
    out = {}
    for role in ROLES:
        url = picks[role]
        dest = work_dir / f"{role}.jpg"
        if url:
            resp = requests.get(url, timeout=60)
            resp.raise_for_status()
            # Name the file by actual content type, not a hardcoded extension,
            # so to_data_uri emits the correct MIME downstream.
            ct = resp.headers.get("Content-Type", "image/jpeg").split(";")[0].strip().lower()
            ext = ".png" if "png" in ct else ".webp" if "webp" in ct else ".jpg"
            dest = work_dir / f"{role}{ext}"
            dest.write_bytes(resp.content)
        else:
            prompt = (
                f"A stunning, photorealistic travel photo of {deal['destination']}: "
                f"tropical beach resort, golden hour, no text, no people in foreground."
            )
            png = work_dir / f"{role}.png"
            if not generate_fallback(prompt, png):
                raise RuntimeError(f"no image available for role '{role}' and Gemini fallback failed")
            dest = png
        out[role] = dest
    return out
