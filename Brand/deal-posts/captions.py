"""Builds the social caption draft and the meta.json record for a deal post.

Caption rules (locked VacationPro voice): 45 words or fewer total, body 15 words
or fewer, hook in a '[Topic]... [reframe]' shape, CTA 'Comment {KEYWORD} and
I'll send you...'. No em dashes or en dashes anywhere."""
from datetime import datetime, timezone

MAX_CAPTION_WORDS = 45

# Carousels and statics go to FB + IG; reels (a separate sub-project) go to all
# three. Keyed by format so downstream schedulers never post a carousel to TikTok.
PLATFORMS_BY_FORMAT = {
    "static": ["facebook", "instagram"],
    "carousel": ["facebook", "instagram"],
    "reel": ["facebook", "instagram", "tiktok"],
}


def _strip_dashes(text: str) -> str:
    """Remove em/en dashes from CMS-sourced text (project-wide writing rule)."""
    return text.replace("—", "").replace("–", "")


def build_caption(deal: dict, keyword: str) -> str:
    """Return a caption draft for the deal post.
    Raises ValueError if the composed caption exceeds the 45-word voice limit."""
    dest = _strip_dashes(deal["destination"]).strip()
    price = deal["price"]
    duration = _strip_dashes(deal.get("duration") or "your trip").strip()
    hook = f"{dest} keeps selling out. This one hasn't yet."
    body = f"{duration}, ${price} per person, real dates."
    cta = (
        f"Comment {keyword} and I'll send you the link to book it. "
        f"Limited rooms, first come first served."
    )
    caption = f"{hook} {body} {cta}"
    word_count = len(caption.split())
    if word_count > MAX_CAPTION_WORDS:
        raise ValueError(
            f"caption is {word_count} words, over the {MAX_CAPTION_WORDS}-word limit: {caption!r}"
        )
    return caption


def build_meta(deal: dict, keyword: str, formats: list, outputs: dict) -> dict:
    """Assemble the meta.json record for a generated deal post."""
    return {
        "slug": deal["slug"],
        "title": deal["title"],
        "keyword": keyword,
        "destination": deal["destination"],
        "price": deal["price"],
        "travelDates": deal.get("travelDates", ""),
        "formats": formats,
        "outputs": outputs,
        "caption": build_caption(deal, keyword),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "scheduling": {
            "platforms_by_format": {f: PLATFORMS_BY_FORMAT.get(f, []) for f in formats},
        },
    }
