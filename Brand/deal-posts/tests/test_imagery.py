import base64
from pathlib import Path
import imagery


def test_pick_image_urls_uses_hero_and_gallery():
    deal = {
        "destination": "Punta Cana",
        "heroImage": "https://cdn/h.jpg",
        "galleryImages": ["https://cdn/g1.jpg", "https://cdn/g2.jpg"],
    }
    picks = imagery.pick_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["included"] == "https://cdn/g1.jpg"
    assert picks["details"] == "https://cdn/g2.jpg"


def test_pick_image_urls_falls_back_to_hero_when_gallery_short():
    deal = {"destination": "Aruba", "heroImage": "https://cdn/h.jpg", "galleryImages": []}
    picks = imagery.pick_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["included"] == "https://cdn/h.jpg"
    assert picks["details"] == "https://cdn/h.jpg"


def test_pick_image_urls_flags_missing_when_no_hero():
    deal = {"destination": "Aruba", "heroImage": None, "galleryImages": []}
    picks = imagery.pick_image_urls(deal)
    assert picks["hook"] is None


def test_to_data_uri_encodes_file(tmp_path):
    f = tmp_path / "x.png"
    f.write_bytes(b"\x89PNG\r\n\x1a\nFAKE")
    uri = imagery.to_data_uri(f)
    assert uri.startswith("data:image/png;base64,")
    assert base64.b64decode(uri.split(",", 1)[1]) == b"\x89PNG\r\n\x1a\nFAKE"


def test_to_data_uri_jpeg_mime(tmp_path):
    f = tmp_path / "x.jpg"
    f.write_bytes(b"\xff\xd8\xff")
    assert imagery.to_data_uri(f).startswith("data:image/jpeg;base64,")


def test_pick_image_urls_gallery_of_one():
    deal = {"destination": "Aruba", "heroImage": "https://cdn/h.jpg",
            "galleryImages": ["https://cdn/g1.jpg"]}
    picks = imagery.pick_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["included"] == "https://cdn/g1.jpg"   # gallery hit
    assert picks["details"] == "https://cdn/h.jpg"     # gallery miss -> hero


def test_to_data_uri_webp_mime(tmp_path):
    f = tmp_path / "x.webp"
    f.write_bytes(b"RIFFxxxxWEBP")
    assert imagery.to_data_uri(f).startswith("data:image/webp;base64,")


def test_pick_reel_image_urls_uses_hero_and_gallery_in_order():
    deal = {
        "destination": "Punta Cana",
        "heroImage": "https://cdn/h.jpg",
        "galleryImages": ["https://cdn/g1.jpg", "https://cdn/g2.jpg", "https://cdn/g3.jpg", "https://cdn/g4.jpg"],
    }
    picks = imagery.pick_reel_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["beat1"] == "https://cdn/g1.jpg"
    assert picks["beat2"] == "https://cdn/g2.jpg"
    assert picks["beat3"] == "https://cdn/g3.jpg"
    assert picks["beat4"] == "https://cdn/g4.jpg"


def test_pick_reel_image_urls_falls_back_to_hero_when_gallery_short():
    deal = {"destination": "X", "heroImage": "https://cdn/h.jpg", "galleryImages": ["https://cdn/g1.jpg"]}
    picks = imagery.pick_reel_image_urls(deal)
    assert picks["hook"] == "https://cdn/h.jpg"
    assert picks["beat1"] == "https://cdn/g1.jpg"
    # No gallery[1..3]: fall back to hero
    assert picks["beat2"] == "https://cdn/h.jpg"
    assert picks["beat3"] == "https://cdn/h.jpg"
    assert picks["beat4"] == "https://cdn/h.jpg"


def test_pick_reel_image_urls_flags_missing_when_no_hero():
    deal = {"destination": "X", "heroImage": None, "galleryImages": []}
    picks = imagery.pick_reel_image_urls(deal)
    assert picks["hook"] is None
    assert picks["beat1"] is None
