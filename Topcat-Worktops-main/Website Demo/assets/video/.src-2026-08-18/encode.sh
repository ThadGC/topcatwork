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


# ── D312: the phone and tablet cut ──────────────────────────────────────────
# ⛔ NOT the same file scaled. A 390x660 hero is 0.59 and this film is 1.78, so
# `object-fit:cover` would throw away 67% of the width and then blow the rest up
# 2.7x. A 4:5 frame cut out of the master shows all 864px across the same 1170.
# ⭐ x=680, NOT the centre: the last frame becomes the phone's hero, and of the
# four offsets cut and looked at at the shipped size, 680 is the one that puts
# the island and its three pendants in the middle of the frame. crf 26 because
# the phone upscales it ~1.35x anyway (5.0 MB at SSIM 0.9893; crf 25 costs
# another 0.75 MB for 0.001).
NARROW="../topcat-intro-864.mp4"
ffmpeg -y -i "$SRC" -an -sn -dn -map 0:v:0 \
  -vf "fps=12,crop=864:1080:680:0" \
  -c:v libx264 -crf 26 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -write_tmcd 0 -movflags +faststart "$NARROW"
ffmpeg -y -v error -i "$NARROW" -frames:v 1 /tmp/introposter864.png
python3 -c "from PIL import Image; Image.open('/tmp/introposter864.png').convert('RGB').save('../topcat-intro-864-poster.webp','WEBP',quality=80,method=6)"

for f in "$OUT" "$NARROW"; do
  ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,nb_frames -of default=noprint_wrappers=1 "$f"
done

# ⚠️ A D317 block for the client's 9:16 vertical master lived here and was REVERTED at D318 —
#    it is kept, with its measured size table, in `../.reverted-2026-08-18-9x16/README.md`.
#    ⛔ Do not re-add it here unless the master comes back into `.src-*/`; the path would be wrong.
