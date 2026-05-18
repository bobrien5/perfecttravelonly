"""Renders the deal-post Jinja2 templates to HTML strings.
- render_static: one HTML string (the hook frame).
- render_carousel: a list of HTML strings, one per slide.
- render_pdf: one HTML string (5-page US Letter PDF layout).
The static and carousel slide 1 both come from the hook_frame macro, so they
cannot drift."""
from functools import lru_cache
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATES_DIR = Path(__file__).parent / "templates"
_LOGO_PATH = Path(__file__).resolve().parents[2] / "public" / "logo-white.svg"
_PDF_LOGO_PATH = Path(__file__).parent / "reels" / "assets" / "logo-white.svg"

_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


@lru_cache(maxsize=None)
def _css() -> str:
    return (_TEMPLATES_DIR / "deal-styles.css").read_text()


@lru_cache(maxsize=None)
def _logo_svg() -> str:
    return _LOGO_PATH.read_text()


@lru_cache(maxsize=None)
def _pdf_logo_svg() -> str:
    """Load the VacationPro logo SVG for PDF output. Falls back to the public
    path if the reels assets copy is unavailable."""
    if _PDF_LOGO_PATH.exists():
        return _PDF_LOGO_PATH.read_text()
    return _logo_svg()


def carousel_slide_count(deal: dict) -> int:
    """Number of carousel slides for this deal (catch slide is skipped when the
    deal has no disclaimer)."""
    return len(_carousel_slide_names(deal))


def _carousel_slide_names(deal: dict) -> list:
    names = ["hook", "included", "details"]
    if deal.get("disclaimer"):
        names.append("catch")
    names.append("cta")
    return names


def render_static(deal: dict, keyword: str, images: dict) -> str:
    """Render the standalone deal-static HTML (the hook frame)."""
    return _env.get_template("deal-static.html").render(
        deal=deal, keyword=keyword, images=images, css=_css(), logo_svg=_logo_svg()
    )


def render_carousel(deal: dict, keyword: str, images: dict, flight_estimate: str = "") -> list:
    """Render the deal carousel as a list of single-slide HTML strings."""
    template = _env.get_template("deal-carousel.html")
    out = []
    for slide in _carousel_slide_names(deal):
        out.append(template.render(
            deal=deal, keyword=keyword, images=images, css=_css(),
            logo_svg=_logo_svg(), slide=slide, flight_estimate=flight_estimate,
        ))
    return out


def render_pdf(deal: dict, keyword: str, images: dict) -> str:
    """Render the 5-page US Letter PDF layout to a single HTML string.

    The HTML uses CSS break-after:page on each .pdf-page section so
    Playwright's page.pdf() produces exactly 5 pages. Images must be
    base64 data URIs (hermetic, no network at render time).

    Pages: cover, deal, how-to-book, honest-details, about."""
    return _env.get_template("deal-pdf.html").render(
        deal=deal, keyword=keyword, images=images, logo_svg=_pdf_logo_svg()
    )
