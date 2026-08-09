import csv
import pytest
import generate


def test_parse_cli_args_single_mode():
    args = generate.parse_cli_args(
        ["--slug", "punta-cana-3n", "--keyword", "puntacana", "--formats", "static,carousel"]
    )
    assert args["mode"] == "single"
    assert args["slug"] == "punta-cana-3n"
    assert args["keyword"] == "PUNTACANA"          # normalized to uppercase
    assert args["formats"] == ["static", "carousel"]
    assert args["flight_estimate"] == ""


def test_parse_cli_args_defaults_formats_to_both():
    args = generate.parse_cli_args(["--slug", "x", "--keyword", "X"])
    assert args["formats"] == ["static", "carousel"]


def test_parse_cli_args_single_mode_requires_slug_and_keyword():
    with pytest.raises(SystemExit):
        generate.parse_cli_args(["--keyword", "X"])
    with pytest.raises(SystemExit):
        generate.parse_cli_args(["--slug", "x"])


def test_parse_cli_args_batch_mode():
    args = generate.parse_cli_args(["--batch", "deal-sheet.csv"])
    assert args["mode"] == "batch"
    assert args["batch_csv"] == "deal-sheet.csv"


def test_read_deal_sheet_parses_rows(tmp_path):
    csv_path = tmp_path / "sheet.csv"
    with open(csv_path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["slug", "keyword", "formats", "flight_estimate"])
        w.writerow(["punta-cana-3n", "puntacana", "static,carousel", "from $180pp"])
        w.writerow(["aruba-5n", "aruba", "carousel", ""])
    rows = generate.read_deal_sheet(csv_path)
    assert rows[0] == {"slug": "punta-cana-3n", "keyword": "PUNTACANA",
                       "formats": ["static", "carousel"], "flight_estimate": "from $180pp"}
    assert rows[1] == {"slug": "aruba-5n", "keyword": "ARUBA",
                       "formats": ["carousel"], "flight_estimate": ""}
