#!/usr/bin/env python3
"""Push the 5 Caribbean cluster articles to Sanity (production dataset, status=published).

Workflow:
1. Read .env.local for project ID + write token
2. Upload all images referenced in markdown to Sanity assets (idempotent: skip if already uploaded by path hash)
3. Convert markdown body to Portable Text blocks
4. Create blogPost documents with status='published', publishedAt from frontmatter
"""
from __future__ import annotations
import json
import os
import re
import sys
import time
import uuid
from pathlib import Path

import requests


# --- Load Sanity creds from .env.local ---
ENV_FILE = Path("/Users/brendanobrien/Documents/Claude/vacationpro/.env.local")

def load_env():
    cfg = {}
    for line in ENV_FILE.read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, _, v = line.partition("=")
            cfg[k.strip()] = v.strip().strip('"').strip("'")
    return cfg


CFG = load_env()
PROJECT_ID = CFG["NEXT_PUBLIC_SANITY_PROJECT_ID"]
DATASET = CFG["NEXT_PUBLIC_SANITY_DATASET"]
API_VERSION = CFG["NEXT_PUBLIC_SANITY_API_VERSION"]
TOKEN = CFG["SANITY_API_WRITE_TOKEN"]

BASE_URL = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

DRAFTS_DIR = Path(__file__).resolve().parent
ARTICLES = [
    "safest-caribbean-island.md",
    "best-caribbean-islands.md",
    "cheapest-caribbean-island.md",
    "best-caribbean-island-for-couples.md",
    "hurricane-season-caribbean.md",
]


def uid():
    return uuid.uuid4().hex[:12]


# --- Frontmatter parser ---
def parse_frontmatter(content):
    if not content.startswith("---"):
        return {}, content
    end = content.find("\n---", 4)
    fm_text = content[4:end].strip()
    body = content[end + 5 :].lstrip("\n")
    fm = {}
    current_key = None
    for raw in fm_text.split("\n"):
        if raw.startswith("  - ") or raw.startswith("    - "):
            if current_key and isinstance(fm.get(current_key), list):
                fm[current_key].append(raw.strip()[2:].strip())
        elif ":" in raw and not raw.startswith(" "):
            k, _, v = raw.partition(":")
            k = k.strip()
            v = v.strip()
            if not v:
                fm[k] = []
                current_key = k
            else:
                fm[k] = v.strip('"').strip("'")
                current_key = k
    return fm, body


# --- Inline marks parser (bold + links) ---
INLINE_RE = re.compile(r"\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)")


def parse_inline(text):
    children = []
    marks = []
    pos = 0
    for m in INLINE_RE.finditer(text):
        if m.start() > pos:
            children.append({"_type": "span", "_key": uid(), "text": text[pos : m.start()], "marks": []})
        if m.group(1):
            children.append({"_type": "span", "_key": uid(), "text": m.group(1), "marks": ["strong"]})
        else:
            link_text, url = m.group(2), m.group(3)
            mark_key = uid()
            marks.append({"_type": "link", "_key": mark_key, "href": url})
            children.append({"_type": "span", "_key": uid(), "text": link_text, "marks": [mark_key]})
        pos = m.end()
    if pos < len(text):
        children.append({"_type": "span", "_key": uid(), "text": text[pos:], "marks": []})
    if not children:
        children = [{"_type": "span", "_key": uid(), "text": "", "marks": []}]
    return children, marks


def make_block(text, style="normal", list_item=None):
    children, marks = parse_inline(text)
    b = {
        "_type": "block",
        "_key": uid(),
        "style": style,
        "children": children,
        "markDefs": marks,
    }
    if list_item:
        b["listItem"] = list_item
        b["level"] = 1
    return b


# --- Image upload (cached per run) ---
IMG_CACHE = {}


def upload_image(rel_path):
    if rel_path in IMG_CACHE:
        return IMG_CACHE[rel_path]
    full = (DRAFTS_DIR / rel_path).resolve()
    if not full.exists():
        raise FileNotFoundError(f"Image not found: {full}")
    print(f"    uploading {rel_path}...")
    with open(full, "rb") as f:
        data = f.read()
    r = requests.post(
        f"{BASE_URL}/assets/images/{DATASET}",
        headers={**HEADERS, "Content-Type": "image/jpeg"},
        data=data,
        timeout=180,
    )
    r.raise_for_status()
    asset_id = r.json()["document"]["_id"]
    IMG_CACHE[rel_path] = asset_id
    return asset_id


# --- Markdown -> Portable Text ---
IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
TABLE_SEP_RE = re.compile(r"^\|[\s\-:|]+\|$")


def md_to_portable_text(md):
    blocks = []
    lines = md.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        # Image
        m = IMG_RE.match(line)
        if m:
            alt, path = m.group(1), m.group(2)
            try:
                asset_id = upload_image(path)
                img_block = {
                    "_type": "image",
                    "_key": uid(),
                    "asset": {"_type": "reference", "_ref": asset_id},
                }
                if alt:
                    img_block["alt"] = alt
                blocks.append(img_block)
            except Exception as e:
                print(f"    !! image failed: {path}: {e}")
            i += 1
            continue
        # H1 -> skip (article title is in title field, not body)
        if line.startswith("# "):
            i += 1
            continue
        # H2
        if line.startswith("## "):
            blocks.append(make_block(line[3:], style="h2"))
            i += 1
            continue
        # H3
        if line.startswith("### "):
            blocks.append(make_block(line[4:], style="h3"))
            i += 1
            continue
        # Markdown table
        if line.startswith("|") and i + 1 < len(lines) and TABLE_SEP_RE.match(lines[i + 1]):
            headers = [c.strip() for c in line.strip("|").split("|")]
            i += 2
            # Emit a "Quick comparison:" lead-in
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip("|").split("|")]
                pairs = []
                for h, c in zip(headers, cells):
                    if c and h:
                        pairs.append(f"**{h}:** {c}")
                blocks.append(make_block(" / ".join(pairs), style="normal", list_item="bullet"))
                i += 1
            continue
        # Bullet list
        if line.startswith("- "):
            blocks.append(make_block(line[2:], style="normal", list_item="bullet"))
            i += 1
            continue
        # Numbered list
        nm = re.match(r"^\d+\.\s+(.+)$", line)
        if nm:
            blocks.append(make_block(nm.group(1), style="normal", list_item="number"))
            i += 1
            continue
        # Empty
        if not line.strip():
            i += 1
            continue
        # Paragraph
        blocks.append(make_block(line, style="normal"))
        i += 1
    return blocks


# --- Read time ---
def calc_read_time(md):
    words = len(re.findall(r"\b\w+\b", md))
    minutes = max(1, round(words / 220))
    return f"{minutes} min read"


# --- Build + push a document ---
def build_doc(md_path):
    content = md_path.read_text()
    fm, body = parse_frontmatter(content)
    print(f"\n=== {md_path.name} ===")
    print(f"    title: {fm.get('title')[:70]}")

    pt_body = md_to_portable_text(body)
    print(f"    body blocks: {len(pt_body)}")

    # Featured image = first image in body
    featured = None
    for b in pt_body:
        if b.get("_type") == "image":
            featured = {"_type": "image", "asset": b["asset"]}
            if "alt" in b:
                featured["alt"] = b["alt"]
            break

    pub_date = fm.get("publishDate", "2026-05-14")
    pub_iso = f"{pub_date}T16:00:00.000Z"

    doc = {
        "_id": f"blogPost-{fm.get('slug')}",
        "_type": "blogPost",
        "brand": "vacationpro",
        "title": fm.get("title"),
        "slug": {"_type": "slug", "current": fm.get("slug")},
        "status": "published",
        "excerpt": fm.get("excerpt"),
        "body": pt_body,
        "featuredImage": featured,
        "author": "VacationPro Editorial",
        "publishedAt": pub_iso,
        "readTime": calc_read_time(body),
        "seoTitle": fm.get("seoTitle"),
        "metaDescription": fm.get("metaDescription"),
        "focusKeyphrase": fm.get("primaryKeyword"),
    }
    return doc


def push_docs(docs):
    """Create all docs in a single transaction with createOrReplace (idempotent)."""
    mutations = [{"createOrReplace": d} for d in docs]
    r = requests.post(
        f"{BASE_URL}/data/mutate/{DATASET}",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"mutations": mutations},
        timeout=120,
    )
    r.raise_for_status()
    return r.json()


def main():
    print(f"Sanity project: {PROJECT_ID}, dataset: {DATASET}")
    print(f"Articles: {len(ARTICLES)}")
    docs = []
    for fname in ARTICLES:
        doc = build_doc(DRAFTS_DIR / fname)
        docs.append(doc)
    print(f"\nUploading {len(docs)} documents in one transaction...")
    result = push_docs(docs)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
