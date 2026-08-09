import json
from pathlib import Path
import pytest
import sanity_client

FIXTURE = Path(__file__).parent / "fixtures" / "sanity_deal.json"


def test_build_deal_query_targets_deal_type_and_slug():
    q = sanity_client.build_deal_query("punta-cana-3n")
    assert '_type=="deal"' in q
    assert 'slug.current=="punta-cana-3n"' in q
    assert "[0]" in q  # single document


def test_build_deal_query_rejects_malformed_slug():
    with pytest.raises(ValueError, match="invalid slug"):
        sanity_client.build_deal_query('foo" || "1"=="1')
    with pytest.raises(ValueError, match="invalid slug"):
        sanity_client.build_deal_query("Has Spaces")


def test_parse_deal_normalizes_fields():
    raw = json.loads(FIXTURE.read_text())
    deal = sanity_client.parse_deal(raw)
    assert deal["slug"] == "punta-cana-all-inclusive-escape"
    assert deal["destination"] == "Punta Cana"
    assert deal["price"] == 799
    assert deal["originalPrice"] == 1499
    assert deal["savingsPercent"] == 47
    assert deal["heroImage"] == "https://cdn.sanity.io/images/abc/production/hero.jpg"
    assert deal["galleryImages"] == [
        "https://cdn.sanity.io/images/abc/production/g1.jpg",
        "https://cdn.sanity.io/images/abc/production/g2.jpg",
    ]
    assert deal["whatsIncluded"][0] == "Round-trip airfare"
    assert deal["disclaimer"].startswith("Price is per person")


def test_parse_deal_raises_when_not_found():
    with pytest.raises(ValueError, match="not found"):
        sanity_client.parse_deal({"result": None})


def test_parse_deal_defaults_missing_optional_fields():
    raw = {"result": {"title": "X", "slug": "x", "destination": "X", "price": 100,
                       "originalPrice": 200, "savingsPercent": 50, "heroImage": "h"}}
    deal = sanity_client.parse_deal(raw)
    assert deal["galleryImages"] == []
    assert deal["whatsIncluded"] == []
    assert deal["disclaimer"] == ""
    assert deal["travelDates"] == ""
