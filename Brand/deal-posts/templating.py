"""Renders the deal-post Jinja2 templates to HTML strings.
- render_static: one HTML string (the hook frame).
- render_carousel: a list of HTML strings, one per slide.
- render_pdf: one HTML string (2-page US Letter PDF sell-sheet).
The static and carousel slide 1 both come from the hook_frame macro, so they
cannot drift."""
from functools import lru_cache
from pathlib import Path
from typing import Optional
from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATES_DIR = Path(__file__).parent / "templates"
_LOGO_PATH = Path(__file__).resolve().parents[2] / "public" / "logo-white.svg"
_PDF_LOGO_PATH = Path(__file__).parent / "reels" / "assets" / "logo-white.svg"

_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)

# ---------------------------------------------------------------
# Per-destination booking tips for PDF page 2.
# Keys are lowercase, stripped destination names.
# ---------------------------------------------------------------
BOOKING_TIPS_BY_DESTINATION = {
    "punta cana": {
        "best_travel_dates": [
            "Late April to Early June",
            "September to Early December",
            "Mid-January to Early March",
        ],
        "best_departure_airports": [
            "Miami (MIA)",
            "New York (JFK)",
            "Atlanta (ATL)",
            "Orlando (MCO)",
            "Charlotte (CLT)",
        ],
    },
    "cancun": {
        "best_travel_dates": [
            "Late April to Early June",
            "September to Early November",
            "Mid-January to Early March",
        ],
        "best_departure_airports": [
            "Dallas (DFW)",
            "Houston (IAH)",
            "Miami (MIA)",
            "Atlanta (ATL)",
            "Chicago (ORD)",
        ],
    },
    "aruba": {
        "best_travel_dates": [
            "Late April to Early June",
            "September to Early December",
            "Mid-January to Early March",
        ],
        "best_departure_airports": [
            "Miami (MIA)",
            "New York (JFK)",
            "Atlanta (ATL)",
            "Boston (BOS)",
            "Charlotte (CLT)",
        ],
    },
    "jamaica": {
        "best_travel_dates": [
            "Late April to Early June",
            "September to Early December",
            "Mid-January to Early March",
        ],
        "best_departure_airports": [
            "Miami (MIA)",
            "New York (JFK)",
            "Atlanta (ATL)",
            "Charlotte (CLT)",
            "Philadelphia (PHL)",
        ],
    },
    "hawaii": {
        "best_travel_dates": [
            "Late April to Early June",
            "September to Early December",
            "Mid-January to Early March (excluding President's Day week)",
        ],
        "best_departure_airports": [
            "Los Angeles (LAX)",
            "San Francisco (SFO)",
            "Seattle (SEA)",
            "Phoenix (PHX)",
            "Las Vegas (LAS)",
        ],
    },
}

DEFAULT_BOOKING_TIPS = {
    "best_travel_dates": [
        "Late April to Early June (shoulder season)",
        "September to Early December (post-summer dip)",
        "Mid-January to Early March (winter without holidays)",
    ],
    "best_departure_airports": [
        "Miami (MIA)",
        "New York (JFK)",
        "Atlanta (ATL)",
        "Dallas (DFW)",
        "Chicago (ORD)",
    ],
}

_CONCIERGE_LINK_DEFAULT = "https://vacationpro.co/concierge"


def _get_booking_tips(destination: str) -> dict:
    """Look up per-destination booking tips. Falls back to DEFAULT_BOOKING_TIPS."""
    key = destination.lower().strip().rstrip(".,!?")
    return BOOKING_TIPS_BY_DESTINATION.get(key, DEFAULT_BOOKING_TIPS)


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


def render_pdf(
    deal: dict,
    keyword: str,
    images: dict,
    booking_link: Optional[str] = None,
    concierge_link: Optional[str] = None,
) -> str:
    """Render the 2-page US Letter PDF sell-sheet to a single HTML string.

    Page 1: deal hero (price block, photos, amenities, booking link).
    Page 2: how to find similar pricing on other dates.

    Images must be base64 data URIs (hermetic, no network at render time).

    Args:
        deal: Sanity deal dict.
        keyword: uppercase deal keyword (e.g. 'PUNTACANA').
        images: dict with keys hook, included, details as data URIs.
        booking_link: optional affiliate URL for the accommodation button.
            When None the template shows a concierge contact fallback.
        concierge_link: optional override for the concierge upsell URL.
            Defaults to https://vacationpro.co/concierge.
    """
    if concierge_link is None:
        concierge_link = _CONCIERGE_LINK_DEFAULT
    booking_tips = _get_booking_tips(deal.get("destination", ""))
    return _env.get_template("deal-pdf.html").render(
        deal=deal,
        keyword=keyword,
        images=images,
        logo_svg=_pdf_logo_svg(),
        booking_link=booking_link,
        concierge_link=concierge_link,
        booking_tips=booking_tips,
    )
