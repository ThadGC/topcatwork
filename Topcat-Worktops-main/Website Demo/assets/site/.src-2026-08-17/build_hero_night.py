# Cuts the hero ladder for the night-kitchen photograph the client sent on 17 Aug 2026 (D283).
# ⛔ THE PIPELINE'S OWN RULES: LANCZOS, WebP q85, method 6, and NEVER upscaled — the top rung is
#    the file's own 2752px width, which is why the ladder is 1400/2000/2752 and not the old
#    1400/2000/2750. ⚠️ A NEW PREFIX, not new bytes under `hero-kitchen-*` (D241).
from PIL import Image
import os
SRC=os.path.join(os.path.dirname(__file__),'hero-night-source.png')
OUT=os.path.dirname(os.path.dirname(__file__))
im=Image.open(SRC).convert('RGB'); W,H=im.size
for w in (2752,2000,1400):
    h=round(w*H/W)
    r=im if w==W else im.resize((w,h),Image.LANCZOS)
    f=os.path.join(OUT,'hero-night-%d.webp'%w)
    r.save(f,'WEBP',quality=85,method=6)
    print('%-22s %dx%d  %.1f KB'%(os.path.basename(f),w,h,os.path.getsize(f)/1024))
