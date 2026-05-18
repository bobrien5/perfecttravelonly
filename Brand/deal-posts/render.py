"""Rasterizes a single-frame HTML string to a 1080x1350 JPEG via Playwright,
and renders multi-page HTML to a US Letter PDF via Playwright's page.pdf()."""
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


def render_html_to_pdf(html: str, out_path: Path) -> Path:
    """Render multi-page HTML to a US Letter (8.5x11) PDF at out_path.

    Uses Playwright's page.pdf() with format='Letter'. The HTML template is
    responsible for page breaks via CSS break-after/page-break-after rules.
    Photos are expected to be embedded as base64 data URIs so no network
    access is needed at render time."""
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as tf:
        tf.write(html)
        tmp_html = Path(tf.name)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            ctx = browser.new_context(
                viewport={"width": 816, "height": 1056}
            )
            page = ctx.new_page()
            page.goto(f"file://{tmp_html.resolve()}", wait_until="networkidle")
            page.wait_for_timeout(600)  # let webfonts and layout settle
            page.pdf(
                path=str(out_path),
                format="Letter",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            )
            browser.close()
    finally:
        tmp_html.unlink(missing_ok=True)
    return out_path
