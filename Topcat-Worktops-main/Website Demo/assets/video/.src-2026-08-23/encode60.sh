#!/usr/bin/env bash
# ⭐⭐⭐ D425 (25 Aug 2026) — 60fps BY MOTION INTERPOLATION, because 24fps cannot be smooth
# under a slow scrub no matter how the engine is tuned.
#   Client: "make the video fucking smooth no matter how slow the user is scrolling. There must be
#   no jumping between frames." And earlier the same round: "if I scroll very slowly, it jumps in
#   pieces. It looks broken."
#
# ⭐⭐⭐ WHY THE ENGINE COULD NOT FIX THIS ALONE. On the desktop the film's travel is ~6790px of
# scroll for 1062 frames = 6.4px of scroll per frame. A slow trackpad scroll delivers 1-3px per
# animation frame, so the picture can only change every 2nd-6th frame — and each change is a whole
# 1/24s = 41ms of camera motion. That IS the step he sees, and no chase, ease or threshold can
# invent a picture between two frames that do not exist.
#   60fps: 2655 frames, 2.56px of scroll per frame, each step 16.7ms of motion — 2.5x the temporal
#   resolution and 2/5 of the step size.
#
# ⭐⭐ THE PRICE IS ALMOST NOTHING, AND THAT IS MEASURED, NOT ASSUMED. Interpolated frames are
# motion-compensated predictions of their neighbours, which is exactly what the codec would have
# coded anyway, so they cost very little bitrate; and -g 8 at 60fps is a keyframe every 133ms,
# DENSER IN TIME than -g 4 at 24fps (167ms), so seeks did not get more expensive either.
#   Measured on the same 4s window (t=12..16), crf 25 preset veryslow, projected to 44.25s:
#        24fps -g 4  (what shipped at D416)   13.58 MB
#        48fps -g 4  mci                      19.39 MB
#        60fps -g 8  mci  crf 26              13.71 MB
#        60fps -g 8  mci  crf 25              15.23 MB   <- SHIPPED: same quality, +12%
#   ⭐ And the eye check (D319's law — the SSIM column never shows the knee): an INTERPOLATED
#   frame (t=2.0083, one that exists in no master) cropped and viewed at 4x shows the vein
#   filigree and the slab's cut edge intact, no warping, no tearing.
#
# ⚠️ mi_mode=mci is motion-COMPENSATED, not a blend: a cross-fade would ghost the trees exactly
#   the way D333's overlay fade did. aobmc+vsbmc are the overlapped-block modes that keep block
#   edges out of the interpolation; me_mode=bidir uses both neighbours.
# ⚠️ scene-change detection is on by default (scd=fdiff), so a hard cut duplicates rather than
#   morphs. This film is a continuous move, so it rarely triggers.
# ⛔ THE CROP HAPPENS BEFORE THE INTERPOLATION on the phone and tablet cuts: interpolating pixels
#   that are about to be thrown away is pure cost, and the motion estimate is better without the
#   pillarbox in frame.
# ⚠️ 44.250s at 60fps = 2655 frames on all three cuts. They must match or the scroll maths stops
#   being identical across bands (FPS=60 is ONE constant in index.html).
set -euo pipefail
DESK="TC video desktop final fix.mov"
MOBI="TC video mobile final fix.mov"
MI="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"

ffmpeg -y -v error -i "$DESK" -an -sn -dn -map 0:v:0 \
  -vf "$MI,scale=1920:1080:flags=lanczos" \
  -c:v libx264 -crf 25 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.2 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-1920.mp4"
echo "desktop done"

ffmpeg -y -v error -i "$DESK" -an -sn -dn -map 0:v:0 \
  -vf "crop=864:1080:680:0,$MI" \
  -c:v libx264 -crf 26 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.2 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-864.mp4"
echo "tablet done"

ffmpeg -y -v error -i "$MOBI" -an -sn -dn -map 0:v:0 \
  -vf "crop=608:1080:656:0,$MI" \
  -c:v libx264 -crf 27 -preset veryslow -g 8 -bf 0 -refs 4 \
  -pix_fmt yuv420p -profile:v high -level 4.2 \
  -write_tmcd 0 -movflags +faststart "../topcat-intro-608.mp4"
echo "phone done"
