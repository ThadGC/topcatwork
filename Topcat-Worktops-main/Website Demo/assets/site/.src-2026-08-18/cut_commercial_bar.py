#!/usr/bin/env python3
"""D305 — the Commercial photograph becomes the marble bar the client sent.

He sent the frame and said: "This is the new image that we are going to use for commercial...
This is the image that we're going to use. Make sure you use this image in the best way."

⛔ WHAT IT REPLACES: a bright white salon interior with no stone in it — generic, and the
opposite of this site's palette. The new frame is a curved MARBLE bar counter under a gold-lit
back bar, which is a commercial stone installation photographed in the dark, warm register the
rest of the site is built in.

⭐⭐ "THE BEST WAY" IS A CROP DECISION, AND THE STONE LEADS IT. The source is 3024x4032, portrait,
and every surface that uses this picture is LANDSCAPE — the leaf page's hero band, the landing
helix card (300x197) and the phone/tablet grid tile. Three 16:9 crops were cut and looked at:
  y  950  the arch and the shelves, counter barely in frame  — atmosphere, no product
  y 1500  the lit back bar WITH the marble counter across the foreground  ← chosen
  y 2000  mostly counter and banquette, the room lost
⭐ The chosen band puts the worktop in the foreground and the gold light behind it, so the thing
being sold is the thing in front, and it survives a further centre-crop into a portrait tile.

⚠️ NEW PREFIX (D241): `service-commercial-bar-*`. The salon ladder `service-commercial-*` stays
on disk — a deleted photograph cannot be recovered from the browser.
"""
from PIL import Image
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'commercial-bar-source.jpg')
OUT = os.path.join(HERE, '..', 'service-commercial-bar')

im = Image.open(SRC)
W, H = im.size
band = round(W * 9 / 16)          # 16:9, the shape every surface wants
TOP = 1500                        # chosen by eye against two alternatives
crop = im.crop((0, TOP, W, TOP + band))
crop.save(OUT + '.jpg', 'JPEG', quality=92, optimize=True, progressive=True)
for w in (2400, 1600, 880):       # ⚠️ 2400 is inside the crop's own 3024, so nothing upscales
    h = round(crop.height * w / crop.width)
    # ⚠️ q80, not the pipeline's usual 85: this frame is unusually high-frequency (brick, a wall
    #    of bottles, marble grain) and q85 came out at 280 KB against the site's ~90-160 KB heroes.
    #    Cut at 85 / 80 / 76 and compared at full size — 76 already showed nothing, so 80 is the
    #    safe side of invisible and takes 20% off. Both surfaces also sit under a scrim.
    crop.resize((w, h), Image.LANCZOS).save(f'{OUT}-{w}.webp', 'WEBP', quality=80, method=6)
    print(f'service-commercial-bar-{w}.webp  {w}x{h}')
