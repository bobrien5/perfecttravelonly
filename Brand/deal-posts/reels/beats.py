"""Plans the on-screen text beats for a deal reel.

The reel body window is 1.5 - 12.0 s (10.5 s total). We plan up to 4 beats from
the deal's Sanity content. Beats with no source content are skipped; the
remaining beats stretch to fill the body window evenly. We always return at
least one beat (a destination fallback) so the body is never empty."""
from dataclasses import dataclass
from typing import List

BODY_START = 1.5
BODY_END = 12.0
BODY_WINDOW = BODY_END - BODY_START  # 10.5 s
MAX_BEATS = 4
TEXT_LIMIT = 32


@dataclass
class Beat:
    text: str
    start: float
    duration: float
    image_index: int


def _clip(text: str) -> str:
    """Trim a beat text to the on-screen length limit, single-line."""
    text = " ".join(text.split())
    if len(text) <= TEXT_LIMIT:
        return text
    return text[: TEXT_LIMIT - 1].rstrip() + "."


def _beat_candidates(deal: dict) -> List[str]:
    """Pick up to 4 candidate beat texts from the deal, in display order.
    Each candidate is None if the source content is missing or empty."""
    out = []

    # Beat 1: first whatsIncluded item
    included = deal.get("whatsIncluded") or []
    out.append(_clip(included[0]) if included else None)

    # Beat 2: duration + travelDates combined (or whichever is present)
    duration = (deal.get("duration") or "").strip()
    dates = (deal.get("travelDates") or "").strip()
    if duration and dates:
        out.append(_clip(f"{duration}, {dates}"))
    elif duration:
        out.append(_clip(duration))
    elif dates:
        out.append(_clip(dates))
    else:
        out.append(None)

    # Beat 3: savings (percent if available, else was/now if originalPrice differs)
    savings_pct = deal.get("savingsPercent") or 0
    price = deal.get("price") or 0
    orig = deal.get("originalPrice") or 0
    if savings_pct and savings_pct > 0:
        out.append(_clip(f"{int(savings_pct)}% off"))
    elif orig and price and orig > price:
        out.append(_clip(f"Was ${int(orig)}, now ${int(price)}"))
    else:
        out.append(None)

    # Beat 4: bookingWindow (else short disclaimer)
    window = (deal.get("bookingWindow") or "").strip()
    if window:
        out.append(_clip(window))
    else:
        out.append(None)

    return out


def plan_beats(deal: dict) -> List[Beat]:
    """Return the list of beats for this deal, sized to fill the body window.
    At least one beat is always returned (destination fallback)."""
    candidates = [t for t in _beat_candidates(deal) if t]
    if not candidates:
        # Fallback: a single destination beat fills the whole body window.
        dest = (deal.get("destination") or "Your trip").strip()
        candidates = [_clip(dest)]

    candidates = candidates[:MAX_BEATS]
    n = len(candidates)
    per_beat = BODY_WINDOW / n

    return [
        Beat(text=t, start=round(BODY_START + i * per_beat, 3),
             duration=round(per_beat, 3), image_index=i)
        for i, t in enumerate(candidates)
    ]
