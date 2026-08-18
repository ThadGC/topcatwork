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

# ── D317: THE PHONE'S OWN FILM, FROM THE CLIENT'S 9:16 MASTER ────────────────
# ⭐⭐⭐ He sent `TC FINAL VIDEO 9x16.mp4` — 1080x1920, 24fps, no audio, and the SAME
# 44.250s as the landscape master, so the scroll maths and every story beat carry
# over untouched. This replaces D316's panned 556 crop; the tablet went back to the
# 864 crop above. ⛔ NOTHING IS RE-CROPPED HERE: the composition is his editor's.
#
# ⭐⭐ THE SIZE WAS MEASURED, NOT PICKED. Mean SSIM against the master (each candidate
# scaled back up to 1080x1920, which is the honest question — how much detail survives):
#
#   1080x1920 crf 28   6.71 MB   0.9907    upscale 1.27x on a DPR-3 phone
#    864x1536 crf 27   5.20 MB   0.9895    1.59x
#    864x1536 crf 28   4.59 MB   0.9886    1.59x   <- what ships
#    864x1536 crf 29   4.06 MB   0.9877    1.59x
#    864x1536 crf 30   3.61 MB   0.9867    1.59x
#     720x1280 crf 26  4.52 MB   0.9890    1.90x
#
# ⭐ 864/crf28 beats 720/crf26 on both counts at the same size — less upscale for the
# same bytes — so resolution was spent where it shows and compression where it does not.
# ⚠️ CRF 28 IS THE KNEE AND IT WAS FOUND BY EYE, not by the SSIM column: at 1125 device px
# the dark pine mass above the quarry holds its needles at 28 and smears at 29. SSIM moves
# 0.0009 across that step and cannot see it.
# ⭐ 4.59 MB against the 5.0 MB 864 crop it replaces on the phone: SMALLER, and 1.59x
# upscale instead of 2.11x. Site speed is not traded for the better picture here.
ffmpeg -y -i "TC-FINAL-VIDEO-9x16-master.mp4" -an -sn -dn -map 0:v:0 \
  -vf "fps=12,scale=864:1536:flags=lanczos" \
  -c:v libx264 -crf 28 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-9x16-864.mp4"
ffmpeg -y -v error -i "../topcat-intro-9x16-864.mp4" -frames:v 1 /tmp/vposter.png
python3 -c "from PIL import Image; Image.open('/tmp/vposter.png').convert('RGB').save('../topcat-intro-9x16-864-poster.webp','WEBP',quality=80,method=6)"
