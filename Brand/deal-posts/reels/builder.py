"""Builds a 15s 9:16 deal reel using Hyperframes.

Pipeline per deal:
1. Resolve a temp scratch dir
2. Render index.html.j2 with deal/keyword/beats/css into <scratch>/index.html
3. Copy reel-styles.css, hyperframes.json into <scratch>/
4. Copy logo-white.svg, music.mp3, and the 5 deal photos into <scratch>/assets/
5. `npx hyperframes lint` -- fail loud on errors
6. `npx hyperframes render` -- wait, find the output MP4 under <scratch>/renders/
7. Move that MP4 to the requested out_path
"""
import shutil
import subprocess
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

# Plain `import` works because conftest.py at Brand/deal-posts/ adds that dir to sys.path
# (PR #3 setup). For when this module is imported in a context where conftest hasn't
# fired (e.g. by generate.py via `from reels import builder`), we add the parent dir
# defensively so `import imagery` resolves.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import imagery  # noqa: E402

from reels import beats as beats_mod  # type: ignore  # noqa: E402

TEMPLATE_DIR = Path(__file__).parent / "template"
ASSETS_DIR = Path(__file__).parent / "assets"
MUSIC_FILE = ASSETS_DIR / "music.mp3"
LOGO_FILE = ASSETS_DIR / "logo-white.svg"


def _check_prereqs() -> None:
    """Fail loud if Node 22+ or the music file is missing."""
    try:
        out = subprocess.run(
            ["node", "--version"], capture_output=True, text=True, check=True
        ).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        raise RuntimeError(
            "node is not on PATH; install Node 22+ (nvm install 22)"
        ) from e
    # out looks like "v22.5.1"
    major = int(out.lstrip("v").split(".", 1)[0])
    if major < 22:
        raise RuntimeError(
            f"Hyperframes needs Node >=22, got {out}. Run: nvm install 22 && nvm use 22"
        )
    if not MUSIC_FILE.exists():
        raise RuntimeError(
            f"music track not found at {MUSIC_FILE}. See reels/README.md for sourcing."
        )
    if not LOGO_FILE.exists():
        raise RuntimeError(
            f"logo not found at {LOGO_FILE}. Run: cp public/logo-white.svg {LOGO_FILE}"
        )


def _render_template(deal: dict, keyword: str, beats_list: list) -> str:
    env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))
    css = (TEMPLATE_DIR / "reel-styles.css").read_text()
    return env.get_template("index.html.j2").render(
        deal=deal, keyword=keyword, beats=beats_list, css=css
    )


def _materialize_scratch(scratch: Path, html: str, image_paths: dict) -> None:
    """Lay out the scratch Hyperframes project."""
    (scratch / "assets").mkdir(parents=True, exist_ok=True)
    (scratch / "index.html").write_text(html)
    shutil.copy(TEMPLATE_DIR / "hyperframes.json", scratch / "hyperframes.json")
    shutil.copy(LOGO_FILE, scratch / "assets" / "logo-white.svg")
    shutil.copy(MUSIC_FILE, scratch / "assets" / "music.mp3")
    # Photos: hook + beat1..beatN -- copy each to its expected filename
    for role, src in image_paths.items():
        shutil.copy(src, scratch / "assets" / f"{role}.jpg")


def _run(cmd: list, cwd: Path) -> None:
    """Run a subprocess; raise with stderr on non-zero exit."""
    proc = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            f"{' '.join(cmd)} failed (exit {proc.returncode})\n"
            f"stdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
        )


def build_reel(deal: dict, keyword: str, work_dir: Path, out_path: Path) -> Path:
    """Build a single 9:16 reel for a deal.

    work_dir: a directory (provided by the caller) where image downloads live.
              Reused for the Hyperframes scratch project (a subdir).
    out_path: final MP4 destination (e.g. Brand/deal-posts/{slug}/reel-9x16.mp4).
    Returns out_path on success."""
    _check_prereqs()
    work_dir = Path(work_dir)
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Download/Gemini photos for the 5 reel roles into work_dir/photos
    photos_dir = work_dir / "photos"
    photos_dir.mkdir(parents=True, exist_ok=True)
    image_paths = imagery.ensure_local_reel_images(deal, photos_dir)

    # 2. Plan beats and render the template
    beats_list = beats_mod.plan_beats(deal)
    html = _render_template(deal, keyword, beats_list)

    # 3. Materialize the scratch Hyperframes project
    scratch = work_dir / "scratch"
    scratch.mkdir(parents=True, exist_ok=True)
    _materialize_scratch(scratch, html, image_paths)

    # 4. Lint then render
    _run(["npx", "--yes", "hyperframes", "lint"], cwd=scratch)
    _run(["npx", "--yes", "hyperframes", "render"], cwd=scratch)

    # 5. Move the rendered MP4 to the requested out_path
    renders = scratch / "renders"
    mp4s = sorted(renders.glob("*.mp4")) if renders.exists() else []
    if not mp4s:
        raise RuntimeError(f"render produced no MP4 under {renders}")
    # Most-recent file wins (single render produces one).
    shutil.move(str(mp4s[-1]), str(out_path))
    return out_path
