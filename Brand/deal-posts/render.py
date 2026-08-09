"""Rasterizes a single-frame HTML string to a 1080x1350 JPEG via Playwright.
Mirrors the approach in Brand/carousels/_render_png.py."""
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

WIDTH, HEIGHT = 1080, 1350
JPEG_QUALITY = 85  # Publer-ready; PNGs over 5MB cause Publer SSL upload errors


def render_html_to_jpg(html: str, out_path: Path) -> Path:
    """Render one frame of HTML to a 1080x1350 JPEG at out_path."""
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as tf:
        tf.write(html)
        tmp_html = Path(tf.name)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            ctx = browser.new_context(
                viewport={"width": WIDTH, "height": HEIGHT}
            )
            page = ctx.new_page()
            page.goto(f"file://{tmp_html.resolve()}", wait_until="networkidle")
            page.wait_for_timeout(400)  # let webfonts settle
            page.screenshot(
                path=str(out_path), type="jpeg", quality=JPEG_QUALITY,
                clip={"x": 0, "y": 0, "width": WIDTH, "height": HEIGHT},
            )
            browser.close()
    finally:
        tmp_html.unlink(missing_ok=True)
    return out_path
