#!/usr/bin/env python3
"""D296 — re-crop the splashback hero so the AUSTRALIAN sockets leave the frame.

The client, on the audit: "crop the splashback's image slightly so that the plugs are
out of the way." The photograph carried two non-UK sockets on OPPOSITE edges — left wall
at x 45-120, right of the orchid at x 1395-1540 — so no single-side crop reaches both.

⛔ THE CROP IS NOT "SLIGHT" AND COULD NOT BE. Clearing both edges means 130 off the left
and 290 off the right; the orchid, candles and tray go with the right edge, and the
bottom comes up 220 to drop the tray's corner, which was the one stray shape left in
frame. What remains is the subject the page actually sells: a vein-matched marble
splashback running behind a hob, uncluttered.

⭐ NEW PREFIX, NOT NEW BYTES UNDER THE OLD ONE (D241) — `service-splash-hob-*`. Slab
tiles rely on a hand-bumped stamp (D276); this one gets a clean URL instead, so no
browser and no host cache anywhere can serve the socketed picture back.
⚠️ The ladder tops out at 1200, the crop's own width. The pipeline never upscales.
⛔ `service-splash-marble.*` is KEPT ON DISK — it is the uncropped original.
"""
from PIL import Image

SRC = "assets/site/service-splash-marble.jpg"   # 1620x1080, the uncropped original
BOX = (130, 100, 1330, 860)                     # 1200x760, aspect 1.579
OUT = "assets/site/service-splash-hob"

im = Image.open(SRC).crop(BOX)
im.save(OUT + ".jpg", "JPEG", quality=92, optimize=True, progressive=True)
for w in (1200, 880):
    h = round(im.height * w / im.width)
    im.resize((w, h), Image.LANCZOS).save(
        f"{OUT}-{w}.webp", "WEBP", quality=85, method=6)
    print(f"{OUT}-{w}.webp  {w}x{h}")
