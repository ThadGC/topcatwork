#!/usr/bin/env bash
# ⭐⭐⭐ D328 — the three cuts the site serves, from the client's two NEW masters (22 Aug 2026).
#
#   TC FINAL FIX DESKTOP.mov   1920x1080 h264 24fps 44.250s, 24-bit PCM  -> desktop + tablet
#   TC MOBILE FINAL FIX.mov    1920x1080 h264 24fps 44.250s, 24-bit PCM  -> phone
#
# ⛔⛔⛔ THE MOBILE MASTER ARRIVED PILLARBOXED AGAIN, EXACTLY AS D319'S DID. Inside the 1920x1080
# container is a 9:16 film **608 wide, full height, centred at x=656**, with 656px of pure black
# either side. Measured two ways and they agree exactly:
#     - `cropdetect` across the film: x1=656 x2=1263 w=608 h=1080 x=656 y=0
#     - per-column luminance max over 10 frames: first lit column 656, last 1263, width 608
# ⭐ "Without cropping or editing" is about his FRAMING, which is his and is untouched. The PILLARS
#   still have to come off, or `cover` on a 0.462 phone box keeps the bars and throws away the
#   picture, and 68% of every frame ships as black (§2s, site speed).
#
# ⚠️ 12fps is a SCROLL rate, not a frame rate. All three cuts must match or the scroll maths stops
#   being identical across bands: 44.250s at 12fps = 531 frames everywhere.
# ⚠️ -an: the site never plays sound, and the PCM track is a large share of each master.
# ⚠️ -write_tmcd 0: the containers carry a timecode data stream; `-map 0:v:0` takes video only.
# ⚠️ CRFs are carried over from the D318/D319 size tables, which were measured on the same
#   material at the same rate. ⛔ Re-run those tables if the grade of a future master changes.
set -euo pipefail
DESK="TC FINAL FIX DESKTOP.mov"
MOBI="TC MOBILE FINAL FIX.mov"

# ── desktop: the master at full width ──────────────────────────────────────────────────────────
ffmpeg -y -v error -i "$DESK" -an -sn -dn -map 0:v:0 \
  -vf "fps=12,scale=1920:1080:flags=lanczos" \
  -c:v libx264 -crf 25 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-1920.mp4"

# ── tablet: D312's 4:5 window on the SAME master, x=680 ────────────────────────────────────────
# ⛔ NOT a third film. It is the desktop cut cropped, which is why the two share every beat.
ffmpeg -y -v error -i "$DESK" -an -sn -dn -map 0:v:0 \
  -vf "fps=12,crop=864:1080:680:0" \
  -c:v libx264 -crf 26 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-864.mp4"

# ── phone: HIS OWN vertical cut, pillars removed, nothing else touched ─────────────────────────
ffmpeg -y -v error -i "$MOBI" -an -sn -dn -map 0:v:0 \
  -vf "fps=12,crop=608:1080:656:0" \
  -c:v libx264 -crf 27 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-608.mp4"

# ── posters: each film's OWN first frame, so first paint has nothing to swap ────────────────────
# ⚠️ no libwebp in this machine's ffmpeg; PIL writes the WebP (the pipeline's standing rule).
ffmpeg -y -v error -i "../topcat-intro-1920.mp4" -frames:v 1 -vf "scale=1400:-2:flags=lanczos" /tmp/p1920.png
ffmpeg -y -v error -i "../topcat-intro-864.mp4"  -frames:v 1 /tmp/p864.png
ffmpeg -y -v error -i "../topcat-intro-608.mp4"  -frames:v 1 /tmp/p608.png
python3 - <<'PY'
from PIL import Image
for src,dst,q in (('/tmp/p1920.png','../topcat-intro-poster.webp',80),
                  ('/tmp/p864.png','../topcat-intro-864-poster.webp',80),
                  ('/tmp/p608.png','../topcat-intro-608-poster.webp',80)):
    Image.open(src).convert('RGB').save(dst,'WEBP',quality=q,method=6)
PY
