#!/usr/bin/env bash
#
# HERO FILM — the encode recipe.  Reproducible; do not hand-tune a one-off.
#
# This reproduces exactly what ships. Run it with the two masters and you get
# the six files in public/assets/video byte-for-byte from the same inputs.
#
# ── THERE ARE TWO MASTERS, AND THEY ARE DIFFERENT CUTS ────────────────────────
#
#   TC video desktop final fix.mov   1920x1080  24fps  1062 frames  44.25s
#   TC video mobile final fix.mov    1920x1080  24fps  1062 frames  44.25s
#
# Same length, same rate, same frame count — and NOT the same footage. Mean
# luma differs by 112/255 at t=0. The mobile master is framed and graded for
# the portrait crop. Verified against what was already shipped: the 1920 cut
# comes from the desktop master (mean abs difference 2.8), and the 608 and 864
# cuts come from the mobile one (3.3 and 2.1). Encode the mobile bands from the
# desktop master and you get a plausible-looking film with the wrong grade and
# the subject out of frame.
#
# ── THE SOURCE IS 24fps AND THE ENCODE MUST BE TOO ────────────────────────────
#
# Every mp4 shipped before this script was 60fps: 2651 frames carrying 1062
# frames of information, upsampled by whoever last touched them. `-r 24` is
# therefore not a downgrade, it is the removal of 1589 duplicate frames.
#
# What that buys is the whole point. Seek cost is bounded by the GOP — to
# present frame N the decoder decodes from the keyframe at or before N — so the
# budget is "<= GOP decodes per seek". At 60fps those decodes were spent on
# frames that carry nothing. At 24 the same budget covers 2.5x more film, so
# the seek gets cheaper and the file gets smaller at the same time:
#
#     1920   1920x1080   24.47 -> 23.08 MB   332 -> 133 keyframes   GOP 8
#      864    576x720     6.78 ->  5.97 MB   221 -> 266 keyframes   GOP 12 -> 4
#      608    406x720      6.28 ->  6.22 MB  221 -> 266 keyframes   GOP 12 -> 4
#
# Read the GOP column, not the keyframe count: mobile went from a keyframe
# every 12 frames to one every 4 — three times the keyframe density per frame
# of film — while the raw count only rose from 221 to 266 because there are
# 2.5x fewer frames to cover. Verify after encoding with:
#
#     ffprobe -v error -select_streams v:0 -show_entries frame=key_frame \
#       -of csv=p=0 <clip>.mp4 | awk -F, '{n++; if($1==1)k++} \
#       END {printf "frames=%d keyframes=%d gop=%.2f\n", n, k, n/k}'
#
# It also makes the engine's seek lattice meaningful: lib/constants.ts FPS is
# 24, and lib/transport.ts addresses `(frame + 0.5) / FPS`, the MIDPOINT of a
# real frame. Encode at any other rate and that midpoint is the midpoint of
# nothing.
#
# ── THE CROPS, AND WHY THE TABLET ONE IS NOT CENTRED ──────────────────────────
#
# Both mobile bands are crops of the 1920-wide mobile master, recovered by
# sliding each shipped frame against the master and scoring mean absolute
# difference:
#
#     phone    crop=608:1080:656:0     centred:  (1920 - 608) / 2 = 656
#     tablet   crop=864:1080:680:0     NOT centred: centre is 528
#
# The tablet crop is deliberately biased 152px to the RIGHT of centre. That is
# a framing decision in the original cut, not a rounding artefact, and it is
# what the tablet reveal table in lib/reveal.ts (TREV_X / TREV_S) was traced
# against. Re-centre it and the clip-path edge uncovers the line against
# footage 152px away from the edge it was measured on. PRESERVE THE OFFSET.
#
# ── THE FLAGS ─────────────────────────────────────────────────────────────────
#
# The film is never played. It is SCRUBBED: every frame is addressed as a
# still, forwards and backwards, at the speed of the visitor's scroll.
#
#   -r 24              The source rate. See above.
#   -g / -keyint_min   The GOP length is the ONLY number that decides how
#                      expensive a seek is. Desktop 8, mobile 4 — a mobile
#                      decoder chews at most 3 frames to answer a seek.
#   -sc_threshold 0    Scene-cut keyframes make the GOP irregular, so seek cost
#                      becomes a lottery. Irregular frame delivery is what the
#                      eye reads as judder; a uniformly slower film does not.
#   -crf 22 / 23       22 desktop, 23 mobile. Mobile is already scaled down.
#   -preset slow       Encode time is free here; decode time is not.
#   -pix_fmt yuv420p   The only chroma format every hardware decoder accepts.
#   +faststart         moov atom first, so the element can seek before the file
#                      has finished arriving. Without it the direct-URL path in
#                      lib/filmSource.ts cannot range-request anything.
#   -an                No audio. The page scrubs frames; there is no sound.
#
# `scale=-2:'min(720,ih)'` caps the mobile height and lets the width fall out
# of the cropped aspect, rounded to an even number. Preserving the aspect is
# not cosmetic: lib/geometry.ts maps the reveal tables through a cover fit
# computed from the aspect alone. 864:1080 -> 576:720 is exact; 608:1080 ->
# 406:720 is 0.16% wide, which lib/constants.ts FILM_W records and tolerates.
#
# POSTERS AND PLATES ARE CUT FROM THE ENCODED CLIP, NEVER FROM THE MASTER. Each
# is held on screen until the decoder paints a real frame and is then swapped
# for that frame — if it came from the master it is a different image and the
# swap is a visible pop. The plate is the same frame by the same command as the
# poster, so it is copied rather than re-encoded and the two are byte-identical.
#
# Usage:
#   bash scripts/encode-film.sh [--mobile|--desktop|--all] <desktop-master> [outdir]
#
#   (no flag / --all)   all three encodes + posters + plates
#   --mobile            only 608 + 864
#   --desktop           only 1920
#
# The mobile master defaults to "TC video mobile final fix.mov" beside the
# desktop one; override with TOPCAT_SRC_MOBILE. outdir defaults to
# public/assets/video, which is where the component looks.

set -euo pipefail

DO_DESKTOP=1
DO_MOBILE=1
case ${1:-} in
  --mobile)  DO_DESKTOP=0; DO_MOBILE=1; shift ;;
  --desktop) DO_DESKTOP=1; DO_MOBILE=0; shift ;;
  --all)     DO_DESKTOP=1; DO_MOBILE=1; shift ;;
esac

SRC=${1:-}
OUT=${2:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/assets/video"}

if [ -z "$SRC" ]; then
  echo "Usage: bash scripts/encode-film.sh [--mobile|--desktop|--all] <desktop-master> [outdir]" >&2
  exit 2
fi
[ -f "$SRC" ] || { echo "No such source: $SRC" >&2; exit 2; }

# The mobile master is a SEPARATE CUT, not a flag on the desktop one.
SRC_MOBILE=${TOPCAT_SRC_MOBILE:-"$(dirname "$SRC")/TC video mobile final fix.mov"}
if [ "$DO_MOBILE" = 1 ] && [ ! -f "$SRC_MOBILE" ]; then
  echo "No mobile master at: $SRC_MOBILE" >&2
  echo "Set TOPCAT_SRC_MOBILE. It is a different cut — the desktop master is NOT a substitute." >&2
  exit 2
fi

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not on PATH" >&2; exit 127; }

mkdir -p "$OUT/plates/tablet"

SRC_FPS=24

# ── desktop — 1920x1080, no crop, GOP 8 ───────────────────────────────────────
# Native resolution preserved. This clip is the wide band's, and the wide band
# positions its story lines in FILM units off --filmU/--filmX/--filmY, so its
# resolution is part of the layout contract: do not rescale it.
encode_desktop() {
  ffmpeg -v error -y -i "$SRC" -an \
    -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p \
    -r "$SRC_FPS" -g 8 -keyint_min 8 -sc_threshold 0 \
    -movflags +faststart "$OUT/topcat-intro-1920.mp4"
}

# ── mobile — crop the mobile master, cap height at 720, GOP 4 ─────────────────
# $1 = filename label (608 phone / 864 tablet)
# $2 = crop filter, offsets included — see the header, the tablet one is
#      deliberately off-centre and must not be "fixed"
encode_mobile() {
  local label=$1 crop=$2
  ffmpeg -v error -y -i "$SRC_MOBILE" -an \
    -vf "$crop,scale=-2:'min(720,ih)'" \
    -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
    -r "$SRC_FPS" -g 4 -keyint_min 4 -sc_threshold 0 \
    -movflags +faststart "$OUT/topcat-intro-$label.mp4"
}

# ── posters — frame 0 of the ENCODED clip, never of the master ────────────────
poster() {
  ffmpeg -v error -y -ss 0 -i "$1" -frames:v 1 -c:v libwebp -quality 82 "$2"
}

if [ "$DO_DESKTOP" = 1 ]; then
  encode_desktop
  poster "$OUT/topcat-intro-1920.mp4" "$OUT/topcat-intro-1920-poster.webp"
  cp -f "$OUT/topcat-intro-1920-poster.webp" "$OUT/plates/plate-f0.webp"
fi

if [ "$DO_MOBILE" = 1 ]; then
  # tablet — 864 wide, biased 152px right of centre. See the header.
  encode_mobile 864 "crop=864:1080:680:0"
  poster "$OUT/topcat-intro-864.mp4" "$OUT/topcat-intro-864-poster.webp"
  cp -f "$OUT/topcat-intro-864-poster.webp" "$OUT/plates/tablet/plate-f0.webp"

  # phone — 608 wide, centred: (1920 - 608) / 2 = 656.
  encode_mobile 608 "crop=608:1080:656:0"
  poster "$OUT/topcat-intro-608.mp4" "$OUT/topcat-intro-608-poster.webp"
  cp -f "$OUT/topcat-intro-608-poster.webp" "$OUT/plates/plate-f0-phone.webp"
fi

echo "Encoded into $OUT:"
ls -l "$OUT"

echo
echo "Expect 24fps / 1062 frames / 44.25s on all three. Check it:"
echo "  ffprobe -v error -select_streams v:0 \\"
echo "    -show_entries stream=width,height,r_frame_rate,nb_frames,duration \\"
echo "    -of default=noprint_wrappers=1 $OUT/topcat-intro-1920.mp4"
echo
echo "THEN, IN THE SAME EDIT:"
echo "  1. bump the ?v= stamps in src/components/HeroFilm/lib/constants.ts"
echo "     (DEFAULT_SOURCES and DEFAULT_PLATES) — .htaccess holds .mp4 for a"
echo "     week, so a stale stamp means the host serves the old cut;"
echo "  2. bump the same stamps in the legacy ../index.html, which is still the"
echo "     deployed site;"
echo "  3. copy all six files into ../assets/video/ as well, plates included."
