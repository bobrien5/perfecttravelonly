import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import beats


FULL_DEAL = {
    "destination": "Punta Cana",
    "duration": "5 nights",
    "travelDates": "May - September 2026",
    "whatsIncluded": ["Round-trip airfare", "Oceanview room", "Unlimited meals"],
    "price": 799,
    "originalPrice": 1499,
    "savingsPercent": 47,
    "bookingWindow": "Book by Jun 30",
    "disclaimer": "Price is per person, based on double occupancy.",
}


def test_plan_beats_full_deal_has_four_beats():
    bs = beats.plan_beats(FULL_DEAL)
    assert len(bs) == 4
    # Beat texts are short, single-line, no em/en dashes
    for b in bs:
        assert len(b.text) <= 32
        assert "—" not in b.text and "–" not in b.text


def test_plan_beats_timings_cover_body_window_exactly():
    bs = beats.plan_beats(FULL_DEAL)
    assert bs[0].start == 1.5
    assert bs[-1].start + bs[-1].duration == 12.0
    # Beats are contiguous
    for prev, curr in zip(bs, bs[1:]):
        assert abs((prev.start + prev.duration) - curr.start) < 0.01


def test_plan_beats_assigns_image_indexes_in_order():
    bs = beats.plan_beats(FULL_DEAL)
    assert [b.image_index for b in bs] == [0, 1, 2, 3]


def test_plan_beats_skips_missing_sources_and_stretches():
    # Deal with no whatsIncluded and no bookingWindow -> only 2 beats
    deal = dict(FULL_DEAL, whatsIncluded=[], bookingWindow="")
    bs = beats.plan_beats(deal)
    assert len(bs) == 2
    # Body window still covered exactly
    assert bs[0].start == 1.5
    assert abs((bs[-1].start + bs[-1].duration) - 12.0) < 0.01
    # Each remaining beat got 5.25 s (10.5 / 2)
    for b in bs:
        assert abs(b.duration - 5.25) < 0.01


def test_plan_beats_at_least_one_beat_even_when_all_sources_missing():
    deal = {
        "destination": "X", "duration": "", "travelDates": "",
        "whatsIncluded": [], "price": 100, "originalPrice": 100,
        "savingsPercent": 0, "bookingWindow": "", "disclaimer": "",
    }
    bs = beats.plan_beats(deal)
    assert len(bs) == 1
    assert bs[0].start == 1.5
    assert abs(bs[0].duration - 10.5) < 0.01
    # The fallback beat uses the destination
    assert "X" in bs[0].text or len(bs[0].text) > 0


def test_plan_beats_savings_beat_uses_percent_when_present():
    deal = dict(FULL_DEAL, savingsPercent=47)
    bs = beats.plan_beats(deal)
    savings_beat = [b for b in bs if "47" in b.text or "%" in b.text]
    assert savings_beat, f"no savings beat among {[b.text for b in bs]}"


def test_beat_dataclass_shape():
    b = beats.Beat(text="x", start=1.5, duration=2.5, image_index=0)
    assert b.text == "x" and b.start == 1.5 and b.duration == 2.5 and b.image_index == 0
