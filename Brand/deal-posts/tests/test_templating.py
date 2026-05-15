import templating

DEAL = {
    "title": "Punta Cana Escape", "slug": "punta-cana-escape", "destination": "Punta Cana",
    "price": 799, "originalPrice": 1499, "savingsPercent": 47, "duration": "5 nights",
    "travelDates": "May - September 2026", "bookingWindow": "Book by June 30",
    "whatsIncluded": ["Round-trip airfare", "Oceanview room"], "disclaimer": "Per person.",
}
IMAGES = {"hook": "data:image/jpeg;base64,AAA", "included": "data:image/jpeg;base64,BBB",
          "details": "data:image/jpeg;base64,CCC"}


def test_render_static_contains_core_content():
    html = templating.render_static(DEAL, "PUNTACANA", IMAGES)
    assert "Punta Cana" in html
    assert "$799" in html
    assert "Comment PUNTACANA" in html
    assert "data:image/jpeg;base64,AAA" in html
    assert "<style>" in html  # css inlined


def test_render_carousel_returns_one_html_per_slide():
    slides = templating.render_carousel(DEAL, "PUNTACANA", IMAGES, flight_estimate="from $180pp")
    # hook, included, details, catch, cta = 5 (deal has a disclaimer)
    assert len(slides) == 5
    assert "Comment PUNTACANA" in slides[0]      # hook slide
    assert "Round-trip airfare" in slides[1]     # included slide
    assert "from $180pp" in slides[2]            # details slide
    assert "Per person." in slides[3]            # catch slide
    assert "Your Move" in slides[4]              # cta slide


def test_render_carousel_skips_catch_slide_when_no_disclaimer():
    deal = dict(DEAL, disclaimer="")
    slides = templating.render_carousel(deal, "PUNTACANA", IMAGES, flight_estimate="")
    assert len(slides) == 4  # catch slide skipped


def test_carousel_slide_count():
    assert templating.carousel_slide_count(DEAL) == 5
    assert templating.carousel_slide_count(dict(DEAL, disclaimer="")) == 4


def test_render_static_equals_carousel_slide_one():
    """The static and carousel slide 1 both come from the hook_frame macro:
    their hook content must match."""
    html_static = templating.render_static(DEAL, "PUNTACANA", IMAGES)
    slides = templating.render_carousel(DEAL, "PUNTACANA", IMAGES, flight_estimate="")
    for marker in ("Deal Drop", "Punta Cana", "$799", "Comment PUNTACANA", IMAGES["hook"]):
        assert marker in html_static
        assert marker in slides[0]
