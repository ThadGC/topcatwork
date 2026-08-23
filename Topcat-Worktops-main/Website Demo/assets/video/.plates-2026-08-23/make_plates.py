#!/usr/bin/env python3
"""The opening overlay, third build — D333 (23 Aug 2026). HIS STILLS ARE THE PLATES AT LAST.

⭐⭐⭐ THE SOURCE FLIPPED BACK: `F1 FIXED SLAB.png` and `F1 SLAB mobile.png` (in `.src-2026-08-23/`,
`.gitignore`d) are the SAME RENDER as the re-cut film's own first frame — measured **0.0147**
(desktop) and **0.0306** (phone) against the new masters' f0, where D330's stills sat at 0.301 and
0.143 and morphed. He re-rendered the film's opening (t=0..~10.25, gold-veined slabs) and the
stills with it, which is exactly the condition `.plates-2026-08-22/make_plates.py` documented for
going back to his artwork. The old folder stays as the D330–D332 record.

⛔ THE PLATES SHIP AT THE FILM'S OWN RESOLUTION (1920/864/608), NOT THE STILL'S 2688. The overlay
now CUTS to the film instead of fading (D333, his instruction), and a plate sharper than the film
would make that cut visible as a crisp→soft jump. Matching the film's resolution keeps the cut
silent; the still is still cleaner than the film's CRF-25 f0 at the same size, which is the point.

⭐ THE POSTERS COME FROM THE SAME IMAGES, walked down to the §2s budget — poster, plate and film
all open on one picture, so first paint has nothing to swap and the overlay attaches invisibly.

⚠️ Re-run this whenever the film is re-cut — and bump `?v=` on the three plates AND the three
   posters in `index.html` in the SAME edit (.htaccess holds them for a week).

    cd "Website Demo/assets/video/.plates-2026-08-23" && python3 make_plates.py
"""
import io, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
VID  = os.path.dirname(HERE)
SRC  = os.path.join(VID, '.src-2026-08-23')
os.chdir(VID)

os.makedirs('plates/tablet', exist_ok=True)

# desktop: his 2688x1513 still, cropped to exact 16:9 and set down to the film's 1920
d = Image.open(f'{SRC}/F1 FIXED SLAB.png').convert('RGB').crop((0,0,2688,1512)).resize((1920,1080), Image.LANCZOS)
# phone: his 1080x1920 still to the film's 608x1080 (aspect 0.5625 vs 0.5630 — crop 2px of height)
m = Image.open(f'{SRC}/F1 SLAB mobile.png').convert('RGB')
m = m.crop((0,0,m.size[0],round(m.size[0]*1080/608))).resize((608,1080), Image.LANCZOS)

d.save('plates/plate-f0.webp','WEBP',quality=86,method=6)
d.crop((680,0,680+864,1080)).save('plates/tablet/plate-f0.webp','WEBP',quality=86,method=6)   # D312's window
m.save('plates/plate-f0-phone.webp','WEBP',quality=86,method=6)

# the posters ARE the overlay (first paint), walked down to the §2s budget per file
for src,dst,w,kb in (('plates/plate-f0.webp','topcat-intro-poster.webp',1400,122),
                     ('plates/tablet/plate-f0.webp','topcat-intro-864-poster.webp',864,82),
                     ('plates/plate-f0-phone.webp','topcat-intro-608-poster.webp',608,55)):
    im = Image.open(src).convert('RGB')
    im = im.resize((w, round(im.size[1]*w/im.size[0])), Image.LANCZOS)
    for q in range(82,39,-1):
        b = io.BytesIO(); im.save(b,'WEBP',quality=q,method=6)
        if b.tell()/1024 <= kb:
            open(dst,'wb').write(b.getvalue()); print(f"{dst:<30} q{q} {b.tell()//1024} KB / {kb}"); break
    else:
        raise SystemExit(f"{dst} will not fit {kb} KB")
for f in ('plates/plate-f0.webp','plates/tablet/plate-f0.webp','plates/plate-f0-phone.webp'):
    print(f"{f:<30} {os.path.getsize(f)//1024} KB")
