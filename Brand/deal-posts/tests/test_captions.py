import pytest
import captions

DEAL = {
    "title": "Punta Cana All-Inclusive Escape",
    "slug": "punta-cana-all-inclusive-escape",
    "destination": "Punta Cana",
    "price": 799,
    "originalPrice": 1499,
    "savingsPercent": 47,
    "duration": "5 nights",
    "travelDates": "May - September 2026",
    "disclaimer": "Price is per person.",
}


def test_build_caption_includes_destination_price_and_keyword():
    cap = captions.build_caption(DEAL, "PUNTACANA")
    assert "Punta Cana" in cap
    assert "799" in cap
    assert "Comment PUNTACANA" in cap


def test_build_caption_respects_45_word_limit():
    cap = captions.build_caption(DEAL, "PUNTACANA")
    assert len(cap.split()) <= 45


def test_build_caption_has_no_em_or_en_dashes():
    cap = captions.build_caption(DEAL, "PUNTACANA")
    assert "—" not in cap  # em dash
    assert "–" not in cap  # en dash


def test_build_caption_strips_dashes_from_deal_fields():
    dashed = dict(DEAL, destination="Cancun — Riviera Maya", duration="7 nights – 8 days")
    cap = captions.build_caption(dashed, "CANCUN")
    assert "—" not in cap
    assert "–" not in cap
    assert "Cancun" in cap


def test_build_caption_raises_when_over_word_limit():
    long_deal = dict(DEAL, destination=" ".join(["LongName"] * 40))
    with pytest.raises(ValueError, match="word limit"):
        captions.build_caption(long_deal, "X")


def test_build_meta_assembles_record():
    meta = captions.build_meta(
        DEAL, "PUNTACANA", ["static", "carousel"],
        {"static": "punta-cana/static-4x5.jpg", "carousel": ["punta-cana/carousel/slide-01.jpg"]},
    )
    assert meta["slug"] == "punta-cana-all-inclusive-escape"
    assert meta["title"] == "Punta Cana All-Inclusive Escape"
    assert meta["keyword"] == "PUNTACANA"
    assert meta["formats"] == ["static", "carousel"]
    assert meta["outputs"]["static"] == "punta-cana/static-4x5.jpg"
    assert "caption" in meta and len(meta["caption"]) > 0
    assert "generated_at" in meta
    assert meta["scheduling"]["platforms_by_format"]["carousel"] == ["facebook", "instagram"]
    assert meta["scheduling"]["platforms_by_format"]["static"] == ["facebook", "instagram"]


def test_build_meta_reel_branch_includes_tiktok():
    meta = captions.build_meta(
        DEAL, "PUNTACANA", ["static", "carousel", "reel"],
        {
            "static": "punta-cana/static-4x5.jpg",
            "carousel": ["punta-cana/carousel/slide-01.jpg"],
            "reel": "punta-cana/reel-9x16.mp4",
        },
    )
    assert meta["outputs"]["reel"] == "punta-cana/reel-9x16.mp4"
    assert "tiktok" in meta["scheduling"]["platforms_by_format"]["reel"]
    assert meta["scheduling"]["platforms_by_format"]["reel"] == ["facebook", "instagram", "tiktok"]


def test_build_meta_reel_omitted_when_format_not_present():
    meta = captions.build_meta(DEAL, "PUNTACANA", ["static"], {"static": "x.jpg"})
    assert "reel" not in meta["outputs"]
    assert "reel" not in meta["scheduling"]["platforms_by_format"]
