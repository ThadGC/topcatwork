#!/usr/bin/env bash
# ⭐⭐⭐ D319 — the encode that made `assets/video/topcat-intro-608.mp4`, the PHONE's film.
#
# The client sent `TC MOBILE FIXED.mov` on 21 Aug 2026: *"this is the one you need to use...
# this is made perfectly for mobile, no cropping needed."*
#
# ⛔⛔⛔ IT ARRIVED PILLARBOXED AND THE BLACK IS NOT PART OF THE PICTURE.
# The container is 1920x1080 h264, 24fps, 44.250s, with 24-bit PCM stereo. Inside it is a
# 9:16 film **608 wide, full height, centred at x=656**, with 656px of pure black either side.
#
#   measured two ways, not sampled:
#     - max luminance per column across 10 frames spread over the film: content 656..1263
#     - `cropdetect` at 1fps across the WHOLE 44s: widest box x1=656 x2=1263 w=608 h=1080
#   (frames that report 658/604 are black SCENES, where the picture's own edge is dark. The
#    maximum extent across the film is the content box, and both methods agree on it exactly.)
#
# ⭐ "No cropping needed" is about the FRAMING — that is his and it is untouched. The PILLARS
#   had to come off. Two reasons, and either one is sufficient:
#     1. `object-fit:cover` on a 0.462 phone box would have kept the bars and thrown away his
#        composition — the opposite of what he asked for.
#     2. 68% of every frame would have been black. §2s: site speed is a standing rule.
#
# ⚠️ 12fps is a SCROLL rate, not a frame rate — it matches the other two cuts exactly, so all
#   three films are 44.250s / 531 frames and the scroll maths is identical at every band.
# ⚠️ -an: the site never plays sound and the PCM track is 12.7 MB of the 37.8.
# ⚠️ -write_tmcd 0: the container carries a timecode data stream; `-map 0:v:0` takes video only.
#
# ⭐⭐ THE MEASURED SIZE TABLE. Mean SSIM against the CROPPED master (608x1080 at 12fps, -qp 0),
# which is the honest reference — comparing against the pillarboxed original would score the
# black bars as a perfect match and flatter every candidate:
#
#     crf 24   5.02 MB   0.9912
#     crf 26   3.88 MB   0.9891
#     crf 27   3.43 MB   0.9878    <- what ships
#     crf 28   3.04 MB   0.9865
#     crf 30   2.41 MB   0.9834
#
# ⛔ CRF 27 IS THE KNEE AND SSIM CANNOT SEE IT. Judged by eye at 4x nearest-neighbour on the
# quarry rubble at t=1.5 (the detail this film actually has): 26 and 27 are indistinguishable,
# and at 28 the small stones lose their edges and the twigs soften. SSIM moves 0.0013 across
# that step. The black void at t=24 is clean at every setting — it is true black, so there is
# nothing there to band.
# ⚠️ Native 608x1080, NOT upscaled: the content is only 608 wide and encoding it larger buys
# bytes, not detail. The phone upscales it 2.26x on a DPR-3 screen either way.
#
# Usage:  bash encode.sh TC-MOBILE-FIXED-2026-08-21.mov
set -euo pipefail
SRC="${1:-TC-MOBILE-FIXED-2026-08-21.mov}"
OUT="../topcat-intro-608.mp4"

ffmpeg -y -i "$SRC" -an -sn -dn -map 0:v:0 \
  -vf "fps=12,crop=608:1080:656:0" \
  -c:v libx264 -crf 27 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -write_tmcd 0 -movflags +faststart "$OUT"

# the poster is the film's own first frame — the frame the page opens on, so nothing swaps.
# ⚠️ no libwebp in this machine's ffmpeg; PIL does the WebP (the pipeline's rule).
ffmpeg -y -v error -i "$OUT" -frames:v 1 /tmp/introposter608.png
python3 -c "from PIL import Image; Image.open('/tmp/introposter608.png').convert('RGB').save('../topcat-intro-608-poster.webp','WEBP',quality=80,method=6)"

ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,nb_frames \
  -of default=noprint_wrappers=1 "$OUT"
