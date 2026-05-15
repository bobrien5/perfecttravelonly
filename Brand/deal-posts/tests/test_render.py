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
