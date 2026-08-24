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
