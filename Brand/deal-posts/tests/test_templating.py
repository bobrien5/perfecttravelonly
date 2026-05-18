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


def test_render_pdf_contains_core_content():
    """PDF HTML must include destination, price, and 2-page section anchors."""
    html = templating.render_pdf(DEAL, "PUNTACANA", IMAGES)
    assert "Punta Cana" in html
    assert "799" in html
    assert "Total Cost" in html
    assert "Normally" in html
    assert "Best Travel Dates" in html
    assert "Best Departure Airports" in html
    assert 'id="page-deal"' in html
    assert 'id="page-booking-tips"' in html


def test_render_pdf_uses_destination_booking_tips():
    """PDF for a known destination uses destination-specific airports; unknown falls back."""
    # Known destination: Punta Cana
    html = templating.render_pdf(DEAL, "PUNTACANA", IMAGES)
    assert "Miami (MIA)" in html

    # Unknown destination: falls back to DEFAULT_BOOKING_TIPS
    deal_unknown = dict(DEAL, destination="Bora Bora")
    html_unknown = templating.render_pdf(deal_unknown, "BORABORA", IMAGES)
    # DEFAULT_BOOKING_TIPS airports include Miami and Dallas
    assert "Miami (MIA)" in html_unknown
    assert "Dallas (DFW)" in html_unknown


def test_render_pdf_with_booking_link_shows_button():
    """When booking_link is provided the HTML contains the URL; when None shows fallback."""
    link = "https://example.com/resort"
    html_with_link = templating.render_pdf(DEAL, "PUNTACANA", IMAGES, booking_link=link)
    assert link in html_with_link

    html_no_link = templating.render_pdf(DEAL, "PUNTACANA", IMAGES, booking_link=None)
    assert link not in html_no_link
    assert "concierge@vacationpro.co" in html_no_link
