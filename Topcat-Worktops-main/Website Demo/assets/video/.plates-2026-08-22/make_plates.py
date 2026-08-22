#!/usr/bin/env python3
"""The opening overlay — D330, rebuilt at D331.

⛔⛔⛔ THE OVERLAY IS THE MASTER'S OWN FIRST FRAME, NOT THE CLIENT'S GENERATION STILLS.
His `src/F1 FIXED.png` and `src/Mobile f1.png` are different RENDERS of the shot — measured
0.301 (desktop) and 0.143 (phone) from the frames they fade into, trees and veining in different
places — and cross-fading them was the morph he screenshotted at D331. Colour can be graded;
geometry cannot. The master's own f0 measures 0.043/0.036/0.037 against the three cuts, so the
dissolve has nothing to morph.

⭐ To go back to his artwork (only if he re-renders stills that MATCH the film): see USE_HIS_PNGS.
⚠️ Re-run this whenever the film is re-cut — f0 changes with it. Bump `?v=` on the three plates
   and the three posters in `index.html` in the SAME edit (.htaccess holds them for a week).

    cd "Website Demo/assets/video/.plates-2026-08-22" && python3 make_plates.py
"""
import io, os, subprocess
from PIL import Image

USE_HIS_PNGS = False          # ⛔ only if re-rendered to match — verify distance ≤ ~0.1 first

HERE = os.path.dirname(os.path.abspath(__file__))
VID  = os.path.dirname(HERE)
os.chdir(VID)

def master_f0(mov):
    out = f'/tmp/f0-{os.path.basename(mov)}.png'
    subprocess.run(['ffmpeg','-y','-v','error','-i',mov,'-frames:v','1',out], check=True)
    return Image.open(out).convert('RGB')

os.makedirs('plates/tablet', exist_ok=True)
if USE_HIS_PNGS:
    d = Image.open(f'{HERE}/src/F1 FIXED.png').convert('RGB').resize((1920,1080), Image.LANCZOS)
    m = Image.open(f'{HERE}/src/Mobile f1.png').convert('RGB')
    m = m.crop((0,0,m.size[0],round(m.size[0]*1080/608))).resize((608,1080), Image.LANCZOS)
else:
    d = master_f0('.src-2026-08-22/TC FINAL FIX DESKTOP.mov')                 # 1920x1080
    m = master_f0('.src-2026-08-22/TC MOBILE FINAL FIX.mov').crop((656,0,656+608,1080))

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
