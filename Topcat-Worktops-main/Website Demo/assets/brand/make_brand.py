#!/usr/bin/env python3
"""Produce tight-cropped web assets from the supplied brand SVGs.

The supplied files carry uneven padding baked into the viewBox (the horizontal
lockup has 36 units of air on the left against 21 on the right, and 80 units of
vertical air out of 403). That padding would fight every attempt to align the
lockup against the nav's other items, so the viewBox is retightened to the true
ink bounds and the spacing is left to CSS.

Bounds were measured with getBBox() in a real renderer, not estimated from the
path data, because the wordmark is all curves.
"""
import re
import pathlib

BRAND = pathlib.Path(__file__).resolve()
SRC = pathlib.Path(
    "/Users/thadeusgous/Documents/TOPCAT WORKTOPS/Topcat-Worktops-main/Website Demo/assets/brand"
)

# name -> (source file, measured ink bounds x/y/w/h)
JOBS = {
    "topcat-horizontal": ("TOPCAT_Horizontal_Gradient_Light.svg", (36.173, 41.0, 1455.287, 323.016)),
    "topcat-vertical":   ("TOPCAT_Vertical_Gradient_Light.svg",   (47.039, 61.578, 528.0, 495.122)),
    "topcat-icon":       ("TOPCAT_Icon_Gradient.svg",             (31.025, 30.702, 309.436, 311.444)),
}

SVG_OPEN = re.compile(r"<svg\b[^>]*>")


def retighten(text, box, square=False):
    x, y, w, h = box
    if square:
        side = max(w, h)
        x -= (side - w) / 2
        y -= (side - h) / 2
        w = h = side
    vb = f"{x:.3f} {y:.3f} {w:.3f} {h:.3f}"

    def rewrite(m):
        tag = m.group(0)
        tag = re.sub(r'\swidth="[^"]*"', "", tag)
        tag = re.sub(r'\sheight="[^"]*"', "", tag)
        tag = re.sub(r'\sviewBox="[^"]*"', "", tag)
        # width/height restated as the ink box so the intrinsic aspect ratio is
        # exact and the browser reserves the right space before the file lands
        return tag[:4] + f' width="{w:.3f}" height="{h:.3f}" viewBox="{vb}"' + tag[4:]

    return SVG_OPEN.sub(rewrite, text, count=1)


for name, (src, box) in JOBS.items():
    text = (SRC / src).read_text()
    out = retighten(text, box)
    (SRC / f"{name}.svg").write_text(out)
    print(f"{name}.svg  viewBox -> {box[0]:.3f} {box[1]:.3f} {box[2]:.3f} {box[3]:.3f}"
          f"  aspect {box[2]/box[3]:.4f}  {len(out):,} bytes")

# The favicon is the icon squared off, so it fills a 16px box instead of sitting
# in it with air on two sides.
icon_src, icon_box = JOBS["topcat-icon"]
fav = retighten((SRC / icon_src).read_text(), icon_box, square=True)
(SRC / "favicon.svg").write_text(fav)
print(f"favicon.svg  squared  {len(fav):,} bytes")
