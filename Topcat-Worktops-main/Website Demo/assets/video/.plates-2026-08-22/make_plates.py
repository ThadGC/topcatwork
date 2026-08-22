#!/usr/bin/env python3
"""D330 — the opening overlay, from the client's two stills.

Rebuilds `plates/plate-f0.webp`, `plates/tablet/plate-f0.webp`, `plates/plate-f0-phone.webp`
and the three posters. ⚠️ Re-run this if the film is ever re-cut: f0 changes, and both the
grade match and the fade width in `index.html` are derived from it.

    cd "Website Demo/assets/video/.plates-2026-08-22" && python3 make_plates.py
"""
import io, math, os, subprocess
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
VID  = os.path.dirname(HERE)
os.chdir(VID)

def film_rgb(src, w, h):
    raw = subprocess.run(['ffmpeg','-v','error','-i',src,'-frames:v','1',
                          '-vf',f'scale={w}:{h}','-f','rawvideo','-pix_fmt','rgb24','-'],
                         capture_output=True).stdout
    return list(raw[:w*h*3])

def stats(px):
    out=[]
    for c in range(3):
        v=px[c::3]; m=sum(v)/len(v)
        out.append((m, math.sqrt(sum((x-m)**2 for x in v)/len(v))))
    return out

def to_aspect(im, target):
    """⛔ crop to the film's EXACT aspect before resizing, or `cover` scales the still a
       fraction differently from the film and the dissolve breathes (D323)."""
    w,h = im.size
    if w/h > target:
        nw = round(h*target); x = (w-nw)//2
        return im.crop((x,0,x+nw,h))
    nh = round(w/target); y = (h-nh)//2
    return im.crop((0,y,w,y+nh))

def grade_to(im, film_stats):
    """shift each channel's mean and std onto the film's — grade only, detail untouched"""
    s = stats(list(im.tobytes())); bands = list(im.split())
    for c in range(3):
        fm,fs = film_stats[c]; sm,ss = s[c]
        g = (fs/ss) if ss > 1e-6 else 1.0
        bands[c] = bands[c].point([max(0,min(255, round((v-sm)*g+fm))) for v in range(256)])
    return Image.merge('RGB', bands)

def to_budget(im, dst, w, budget_kb):
    """⭐ the poster carries first paint (§2s). Walk quality down until it fits."""
    h = round(im.size[1]*w/im.size[0])
    im = im.resize((w,h), Image.LANCZOS)
    for q in range(82, 39, -1):
        b = io.BytesIO(); im.save(b,'WEBP',quality=q,method=6)
        if b.tell()/1024 <= budget_kb:
            open(dst,'wb').write(b.getvalue())
            return q, b.tell()/1024
    raise SystemExit(f"{dst} will not fit {budget_kb} KB")

os.makedirs('plates/tablet', exist_ok=True)

# ── desktop: aspect, then graded onto the film's own f0 (his ran +3.3/+5.3/+6.4 bright) ────────
d = Image.open(f'{HERE}/src/F1 FIXED.png').convert('RGB')
d = to_aspect(d, 1920/1080).resize((1920,1080), Image.LANCZOS)
d = grade_to(d, stats(film_rgb('topcat-intro-1920.mp4',160,90)))
d.save('plates/plate-f0.webp','WEBP',quality=82,method=6)

# ── tablet: D312's window on the SAME still, matching the tablet's own cut of the film ─────────
d.crop((680,0,680+864,1080)).save('plates/tablet/plate-f0.webp','WEBP',quality=82,method=6)

# ── phone: his own vertical still. Already matched to the film within 1.4 — aspect only ────────
m = Image.open(f'{HERE}/src/Mobile f1.png').convert('RGB')
m = to_aspect(m, 608/1080).resize((608,1080), Image.LANCZOS)
m.save('plates/plate-f0-phone.webp','WEBP',quality=82,method=6)

# ── the posters ARE the overlay, so first paint is already his picture and nothing swaps ───────
for src,dst,w,kb in (('plates/plate-f0.webp','topcat-intro-poster.webp',1400,122),
                     ('plates/tablet/plate-f0.webp','topcat-intro-864-poster.webp',864,82),
                     ('plates/plate-f0-phone.webp','topcat-intro-608-poster.webp',608,55)):
    q,got = to_budget(Image.open(src).convert('RGB'), dst, w, kb)
    print(f"{dst:<28} q{q}  {got:.0f} KB / {kb} KB")
for f in ('plates/plate-f0.webp','plates/tablet/plate-f0.webp','plates/plate-f0-phone.webp'):
    print(f"{f:<32} {os.path.getsize(f)//1024} KB")
