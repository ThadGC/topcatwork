#!/usr/bin/env bash
# ⭐ D310 — the encode that made `assets/video/topcat-intro-1920.mp4`.
#
# ⛔⛔ THE SETTINGS WERE MEASURED, NOT COPIED FROM THE USUAL SCROLL-SCRUB ADVICE.
# That advice is "every frame a keyframe" (-g 1), and on this film it is simply
# worse: at 1920x1080 / 12fps, mean SSIM against the master came out
#
#     -g 1  crf 34   10.51 MB   0.9717     <- all-intra, the standard advice
#     -g 1  crf 31   14.19 MB   0.9791
#     -g 8  crf 25   11.74 MB   0.9911     <- what ships
#     -g 4  crf 27   11.46 MB   0.9896
#
# so a keyframe every 8 frames is both smaller AND visibly better, because an
# intra-only file spends its whole budget re-describing a slow dolly. A seek then
# costs at most seven extra frame decodes, which is nothing at 1080p, and
# `-refs 4` (veryslow would otherwise use 16) keeps the decoder's work short.
#
# ⚠️ 12fps is a SCROLL rate here, not a frame rate: over the 900vh of travel the
# film's 531 frames land one every ~15px of scroll, so the wheel is the limit,
# not the file. Halving the frame count is what paid for crf 25.
# ⚠️ -an: the master carries 24-bit PCM (12.7 MB of it) and the site never plays sound.
#
# Usage:  bash encode.sh TC-FINAL-VIDEO-master.mov
set -euo pipefail
SRC="${1:-TC-FINAL-VIDEO-master.mov}"
OUT="../topcat-intro-1920.mp4"

ffmpeg -y -i "$SRC" -an -sn -dn -map 0:v:0 \
  -vf "fps=12,scale=1920:1080:flags=lanczos" \
  -c:v libx264 -crf 25 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -write_tmcd 0 -movflags +faststart "$OUT"

# the poster is the film's own first frame — the frame the page opens on.
# ⚠️ no libwebp in this machine's ffmpeg; PIL does the WebP (the pipeline's rule).
ffmpeg -y -v error -i "$OUT" -frames:v 1 -vf "scale=1400:-2:flags=lanczos" /tmp/introposter.png
python3 -c "from PIL import Image; Image.open('/tmp/introposter.png').convert('RGB').save('../topcat-intro-poster.webp','WEBP',quality=80,method=6)"

ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,nb_frames -of default=noprint_wrappers=1 "$OUT"
