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
    """PDF HTML must include destination, price, keyword, and all 5 page anchor IDs."""
    html = templating.render_pdf(DEAL, "PUNTACANA", IMAGES)
    assert "Punta Cana" in html
    assert "799" in html
    assert "PUNTACANA" in html
    assert 'id="page-cover"' in html
    assert 'id="page-deal"' in html
    assert 'id="page-how-to-book"' in html
    assert 'id="page-honest-details"' in html
    assert 'id="page-about"' in html


def test_render_pdf_skips_faq_section_when_absent():
    """A deal with no faq key still renders; no empty FAQ list should appear."""
    deal_no_faq = {k: v for k, v in DEAL.items() if k != "faq"}
    html = templating.render_pdf(deal_no_faq, "PUNTACANA", IMAGES)
    # Template renders the generic fallback FAQ items, not an empty list
    assert "Is the price per person or per room?" in html
    # No Jinja loop over deal.faq items means we hit the else branch -- no empty <li>
    assert '<ul class="faq-list">' in html
