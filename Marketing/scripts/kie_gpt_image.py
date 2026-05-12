#!/usr/bin/env python3
"""
Generate images via KIE.AI's GPT Image-2 (unified jobs/createTask endpoint).

Usage:
  python3 kie_gpt_image.py "a serene mountain at sunset" out.png
  python3 kie_gpt_image.py "prompt" out.png --aspect 1:1

Programmatic:
  from kie_gpt_image import generate
  generate("prompt", "out.png", aspect="auto")
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

import requests

KEYS_FILE = Path(__file__).resolve().parent.parent / ".keys"
CREATE_URL = "https://api.kie.ai/api/v1/jobs/createTask"
RECORD_URL = "https://api.kie.ai/api/v1/jobs/recordInfo"
MODEL = "gpt-image-2-text-to-image"


def load_key() -> str:
    env = os.environ.get("KIE_AI_KEY")
    if env:
        return env
    if KEYS_FILE.exists():
        for line in KEYS_FILE.read_text().splitlines():
            if line.startswith("KIE_AI_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit(f"KIE_AI_KEY not found (env or {KEYS_FILE})")


def create_task(key: str, prompt: str, aspect: str, model: str) -> str:
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    body = {"model": model, "input": {"prompt": prompt, "aspect_ratio": aspect}}
    r = requests.post(CREATE_URL, headers=headers, json=body, timeout=60)
    data = r.json()
    if data.get("code") != 200:
        raise RuntimeError(f"createTask failed: {data}")
    return data["data"]["taskId"]


def poll(key: str, task_id: str, timeout_s: int = 300) -> list[str]:
    headers = {"Authorization": f"Bearer {key}"}
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        r = requests.get(RECORD_URL, headers=headers, params={"taskId": task_id}, timeout=30)
        data = r.json()
        if data.get("code") != 200:
            raise RuntimeError(f"poll failed: {data}")
        d = data["data"]
        state = d.get("state")
        if state == "success":
            result = json.loads(d.get("resultJson") or "{}")
            urls = result.get("resultUrls") or result.get("result_urls") or []
            if not urls:
                raise RuntimeError(f"no result urls: {data}")
            return urls
        if state == "fail":
            raise RuntimeError(f"task failed: {d.get('failMsg') or data}")
        time.sleep(3)
    raise TimeoutError(f"task {task_id} did not finish within {timeout_s}s")


def download(url: str, out_path: Path) -> Path:
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(r.content)
    return out_path


def generate(
    prompt: str,
    out_path: str | Path,
    *,
    aspect: str = "auto",
    model: str = MODEL,
    key: str | None = None,
) -> list[Path]:
    """Returns list of saved file paths. aspect: auto | 1:1 | 3:2 | 2:3 | 16:9 | 9:16."""
    key = key or load_key()
    out = Path(out_path)
    task_id = create_task(key, prompt, aspect, model)
    urls = poll(key, task_id)
    saved = []
    for i, url in enumerate(urls):
        target = out if len(urls) == 1 else out.with_stem(f"{out.stem}_{i+1}")
        saved.append(download(url, target))
    return saved


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt")
    ap.add_argument("out", help="output file path (e.g. image.png)")
    ap.add_argument("--aspect", default="auto", help="auto | 1:1 | 3:2 | 2:3 | 16:9 | 9:16")
    ap.add_argument("--model", default=MODEL)
    args = ap.parse_args()

    paths = generate(args.prompt, args.out, aspect=args.aspect, model=args.model)
    for p in paths:
        print(p)


if __name__ == "__main__":
    main()
