#!/usr/bin/env bash
# ⭐⭐⭐ D333 — the three cuts the site serves, from the client's two NEW masters (23 Aug 2026).
#
#   TC video desktop final fix.mov   1920x1080 h264 24fps 44.250s, PCM  -> desktop + tablet
#   TC video mobile final fix.mov    1920x1080 h264 24fps 44.250s, PCM  -> phone
#
# ⛔⛔⛔ THE MOBILE MASTER ARRIVED PILLARBOXED FOR THE THIRD TIME (D319, D328, now D333). Inside
# the 1920x1080 container is a 9:16 film **608 wide, full height, centred at x=656**. Measured two
# ways and they agree exactly:
#     - `cropdetect` across the film: crop=608:1080:656:0, unanimous over 16 samples
#     - per-column luminance max over 11 frames: lit columns 656..1263, width 608; bar max luma 0/1
#
# ⭐⭐ THIS RE-CUT IS THE OPENING, NOT THE ENDING. Frame-difference against the D328 masters:
# t=0..8 differs (desktop rms up to 0.238), converging through t=9..10 and **byte-identical from
# t=10.25 onward** (rms 0.0000 at every probe 11..43.9, both masters). The opening shot was
# re-rendered with gold-veined slabs to match his two new stills — which measure **0.0147 (desktop)
# / 0.0306 (phone)** against these masters' own f0: the SAME RENDER at last, unlike D330's stills
# (0.301/0.143). The slab-beat windows live in the unchanged region and survive; the OPENING grade
# and first-screen contrast figures do not — re-measured in index.html's comments.
#
# ⛔⛔⛔ **D416 (25 Aug 2026) — 24fps AND -g 4, BECAUSE HE SCROLLED SLOWLY AND SAW THE 12fps.**
#   Client: "if I scroll slowly, the video is not scrolling smooth at all… jumping frame by frame."
#   He was right twice over: at 12fps each frame is 83ms of motion (a slideshow under a slow
#   scrub), and -g 8 made every seek's cost depend on where the nearest keyframe sat. The masters
#   are 24fps, so 24 is the film's own rate, not an invention; -g 4 keeps every seek within 3
#   P-frames of a keyframe (Chrome/Safari-class tolerance; Firefox prefers denser — the accepted
#   residual, ~2% of UK traffic; the fallback is all-intra at a visible quality cost, see table).
#   ⭐ THE D416 MATRIX (desktop, 24fps, preset veryslow, SSIM vs a crf8 24fps reference):
#        -g 1 -crf 26   38.11 MB              (all-intra reference point)
#        -g 1 -crf 28   31.10 MB
#        -g 1 -crf 30   25.56 MB   ← veins visibly thin at 4x — the EYE killed it (D319's law)
#        -g 4 -crf 25   22.31 MB   SSIM 0.9897 ← SHIPPED: matches the approved quality at 4x
#        -g 4 -crf 27   17.94 MB   SSIM 0.9875   (slightly soft on the hairline veins)
#        12fps -g 8 (old)          SSIM 0.9490 vs the same reference — the missing frames ARE the score
#   ⭐ Verified after shipping: a slow programmatic scroll sampled by requestVideoFrameCallback
#   painted 265 frames with EVERY step 0 or +1 frame — no jumps, no backwards skips.
#   Sizes shipped: 1920 → 22.31 MB · 864 → 9.69 MB · 608 → 6.91 MB (38.9 MB on disk, ONE fetched).
# ⚠️ 24fps is the film's rate everywhere. All three cuts must match or the scroll maths stops
#   being identical across bands: 44.250s at 24fps = 1062 frames everywhere.
# ⚠️ -an: the site never plays sound. ⚠️ -write_tmcd 0: containers carry a timecode stream.
# ⚠️ CRFs carried from the D318/D319 size tables — same material at the same rate from t=10.25,
#   and the new opening's sizes came out in family (checked at D333).
set -euo pipefail
DESK="TC video desktop final fix.mov"
MOBI="TC video mobile final fix.mov"

# ── desktop: the master at full width ──────────────────────────────────────────────────────────
ffmpeg -y -v error -i "$DESK" -an -sn -dn -map 0:v:0 \
  -vf "fps=24,scale=1920:1080:flags=lanczos" \
  -c:v libx264 -crf 25 -preset veryslow -g 4 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.2 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-1920.mp4"

# ── tablet: D312's 4:5 window on the SAME master, x=680 ────────────────────────────────────────
# ⛔ NOT a third film. It is the desktop cut cropped, which is why the two share every beat.
ffmpeg -y -v error -i "$DESK" -an -sn -dn -map 0:v:0 \
  -vf "fps=24,crop=864:1080:680:0" \
  -c:v libx264 -crf 26 -preset veryslow -g 4 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.2 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-864.mp4"

# ── phone: HIS OWN vertical cut, pillars removed, nothing else touched ─────────────────────────
ffmpeg -y -v error -i "$MOBI" -an -sn -dn -map 0:v:0 \
  -vf "fps=24,crop=608:1080:656:0" \
  -c:v libx264 -crf 27 -preset veryslow -g 4 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.2 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-608.mp4"
