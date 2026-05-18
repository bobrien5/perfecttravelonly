from pathlib import Path
import render

# A minimal self-contained 1080x1350 HTML frame (solid color, no external assets,
# so it renders identically in any environment including sandboxes).
SAMPLE_HTML = """<!DOCTYPE html><html><head><style>
* { margin:0; padding:0; }
.frame { width:1080px; height:1350px; background:#4ac850; }
</style></head><body><div class="frame"></div></body></html>"""


def test_render_html_to_jpg_produces_correct_size(tmp_path):
    out = tmp_path / "frame.jpg"
    render.render_html_to_jpg(SAMPLE_HTML, out)
    assert out.exists()
    from PIL import Image
    with Image.open(out) as im:
        assert im.size == (1080, 1350)
        assert im.format == "JPEG"
        # the frame is solid hero-green: a center pixel must not be white
        px = im.getpixel((540, 675))
        assert px != (255, 255, 255)


# A minimal self-contained single-page HTML for the PDF test (solid color, no
# external assets, so it renders identically in any environment).
SAMPLE_PDF_HTML = """<!DOCTYPE html><html><head><style>
* { margin:0; padding:0; }
@page { size: Letter portrait; margin: 0; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pdf-page { width:816px; height:1056px; background:#4ac850; break-after:page; }
</style></head><body><div class="pdf-page"></div></body></html>"""


def test_render_html_to_pdf_produces_pdf_file(tmp_path):
    """render_html_to_pdf must produce a non-empty file whose magic bytes are %PDF-."""
    out = tmp_path / "test.pdf"
    render.render_html_to_pdf(SAMPLE_PDF_HTML, out)
    assert out.exists()
    assert out.stat().st_size > 0
    magic = out.read_bytes()[:5]
    assert magic == b"%PDF-", f"expected PDF magic bytes, got {magic!r}"
