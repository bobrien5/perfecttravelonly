"""Loads .env.local into os.environ for the deal-posts generators.
Python (unlike Next.js) does not auto-load .env files."""
import os
from pathlib import Path
from typing import Optional


def load_env(env_path: Optional[Path] = None) -> None:
    """Parse KEY=VALUE lines from .env.local into os.environ.
    Does not overwrite variables already set in the environment.
    Missing file is a silent no-op."""
    if env_path is None:
        # Brand/deal-posts/config.py -> Brand/deal-posts -> Brand -> repo root
        env_path = Path(__file__).resolve().parents[2] / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip()
        if val and val[0] in ('"', "'"):
            # quoted value: strip the surrounding quotes, keep contents verbatim
            val = val.strip('"').strip("'")
        else:
            # unquoted value: strip any inline comment
            val = val.split(" #")[0].rstrip()
        os.environ.setdefault(key, val)
