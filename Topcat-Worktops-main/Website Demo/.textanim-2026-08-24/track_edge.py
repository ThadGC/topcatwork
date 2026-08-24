#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""THE SLAB EDGE TRACK — D354 (24 Aug 2026). Rebuilds REV_X / REV_S in index.html.

Run it again ONLY if the film is re-cut. PIL only, no numpy (the environment has none).

  1. ffmpeg -v error -i assets/video/topcat-intro-1920.mp4 -ss 8 -to 22 \
         -start_number 96 frames/f%03d.png          # frame number = film time * 12
  2. python3 track_edge.py frames/

For every frame it scans 32 rows (film y 180..800 step 20) for the LEFTMOST pixel with
luminance > 40 — the first hint of the slab's lit fringe on the void side — then fits a
least-squares line x = X0 + S*(y-490). The edge is physically straight, so the max residual
is the health check: it measured <= 2.2 film px over the whole D354 domain. If a re-cut
pushes it past ~4, the edge is no longer a line and two numbers a frame stop being enough.

Domain choice (D354): start where X0 first leaves ~0 (f124), stop at the sweep's peak
BEFORE the backswing (f205 — X0 reverses at f206). The table must stay strictly monotone:
a boundary that retreats by a pixel mid-reveal re-hides a letter edge at 12Hz (D351's rule,
restated for a mask). REV_PAD in index.html keeps type 3 film px shy of the lit fringe.
"""
import sys, json
from PIL import Image

YREF, ROWS, THR = 490, range(180, 801, 20), 40
frames = sys.argv[1] if len(sys.argv) > 1 else 'frames'
# ─────────────────────────────────────────────────────────────────────────────────────────
# THE PHONE VARIANT — D360 (24 Aug 2026). Rebuilds PREV_X / PREV_SX / PREV_Y / PREV_SY.
#
# On the 608 vertical cut the slab TILTS BACK off the frame instead of sweeping aside, so
# TWO edges cross the caption's rows and both are tracked:
#   1. ffmpeg -v error -i assets/video/topcat-intro-608.mp4 -ss 8 -to 27 \
#          -start_number 96 frames/f%03d.png
#   2. python3 track_edge.py frames/ --phone
#
# LEFT edge: rows 120..360 step 8, leftmost pixel > 40, fit x = X0 + Sx*(y-240).
#   Domain f170 (X0 first leaves ~25) .. f201 (last frame with >=3 lit rows). res <= 0.9.
# TOP edge: columns 60..580 step 10, topmost pixel > 40 (y>0 so a frame-clipped edge is
#   skipped), fit y = Y0 + Sy*(x-304) — but ONLY over columns the top edge governs:
#   keep a column when its first lit y sits >=15px BELOW the left-edge line's crossing
#   (boundary per column = max of the two lines; nearer the corner the left edge wins).
#   Domain f178 (Y0 enters at -8) .. f201. res <= 0.8. Before f178: sentinel -9999.
# The runtime clip is the frame notched by the corner where the lines meet (six points).
# Past f201 the clip comes OFF — verified: topmost lit pixel stays >=341 film px to f288,
# below the caption's ink at every phone viewport, so nothing pops.
def phone(frames):
    XT={}
    for f in range(168, 212):
        im = Image.open('%s/f%03d.png' % (frames, f)).convert('L'); W,_ = im.size
        pts=[]
        for y in range(120, 361, 8):
            line = im.crop((0,y,W,y+1)).tobytes()
            x = next((i for i,v in enumerate(line) if v>40), -1)
            if x>=0: pts.append((y,x))
        if len(pts)<3: continue
        n=len(pts); sy=sum(p[0]-240 for p in pts); sx=sum(p[1] for p in pts)
        syy=sum((p[0]-240)**2 for p in pts); sxy=sum((p[0]-240)*p[1] for p in pts)
        d=n*syy-sy*sy
        if not d: continue
        S=(n*sxy-sy*sx)/d; X0=(sx-S*sy)/n
        XT[f]=(round(X0,1),round(S,4))
        print('X', f, 't=%.2f'%(f/12), XT[f])
    for f in range(176, 212):
        im = Image.open('%s/f%03d.png' % (frames, f)).convert('L'); W,_ = im.size
        pts=[]
        for x in range(60, 581, 10):
            col = im.crop((x,0,x+1,520)).tobytes()
            y = next((i for i,v in enumerate(col) if v>40), -1)
            if y>0: pts.append((x,y))
        if f in XT:
            X0,Sx=XT[f]
            pts=[p for p in pts if Sx and p[1] > 240+(p[0]-X0)/Sx+15]
        if len(pts)<5:
            print('Y', f, 'NONE'); continue
        n=len(pts); s1=sum(p[0]-304 for p in pts); s2=sum(p[1] for p in pts)
        s11=sum((p[0]-304)**2 for p in pts); s12=sum((p[0]-304)*p[1] for p in pts)
        Sy=(n*s12-s1*s2)/(n*s11-s1*s1); Y0=(s2-Sy*s1)/n
        r=max(abs(p[1]-(Y0+Sy*(p[0]-304))) for p in pts)
        print('Y', f, 't=%.2f'%(f/12), 'Y0=%6.1f Sy=%7.4f res=%4.1f'%(Y0,Sy,r))

if '--phone' in sys.argv:
    phone(frames)
    sys.exit(0)

out = []
for f in range(118, 209):
    im = Image.open('%s/f%03d.png' % (frames, f)).convert('L')
    W, _ = im.size
    pts = []
    for y in ROWS:
        line = im.crop((0, y, W, y + 1)).tobytes()
        x = next((i for i, v in enumerate(line) if v > THR), -1)
        if x >= 0: pts.append((y, x))
    if len(pts) < 8:
        print(f, 'NONE'); continue
    n = len(pts); sy = sum(p[0] - YREF for p in pts); sx = sum(p[1] for p in pts)
    syy = sum((p[0] - YREF) ** 2 for p in pts); sxy = sum((p[0] - YREF) * p[1] for p in pts)
    S = (n * sxy - sy * sx) / (n * syy - sy * sy); X0 = (sx - S * sy) / n
    r = max(abs(p[1] - (X0 + S * (p[0] - YREF))) for p in pts)
    out.append((f, round(X0, 1), round(S, 4), round(r, 1)))
    print(f, 't=%.2f' % (f / 12), 'X0=%7.1f S=%7.4f maxres=%4.1f' % (X0, S, r))
json.dump(out, open('edge_track.json', 'w'))
print('domain for the table: first f with X0>2 .. the frame BEFORE X0 first falls')
