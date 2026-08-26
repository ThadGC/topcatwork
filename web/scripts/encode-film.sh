#!/usr/bin/env bash
#
# HERO FILM — the encode recipe.  Reproducible; do not hand-tune a one-off.
#
# The film is never played. It is SCRUBBED: every frame is addressed as a
# still, forwards and backwards, at the speed of the visitor's scroll. That
# single fact is what every flag below exists for.
#
#   -g / -keyint_min   The GOP length is the ONLY number that decides how
#                      expensive a seek is. To present frame N the decoder must
#                      decode from the keyframe at or before N. A GOP of 12
#                      means up to 11 wasted decodes per seek; a GOP of 4 means
#                      up to 3. That is the whole judder fix — the mobile clips
#                      grew from 6.3 MB to 11.8 MB buying exactly this.
#   -sc_threshold 0    Scene-cut keyframes make the GOP irregular, so seek cost
#                      becomes a lottery. Irregular frame delivery is what the
#                      eye reads as judder; a uniformly slower film does not.
#   -preset slow       Encode time is free here; decode time is not.
#   -pix_fmt yuv420p   The only chroma format every hardware decoder accepts.
#   +faststart         moov atom first, so the element can seek before the file
#                      has finished arriving. Without it the direct-URL path in
#                      lib/filmSource.ts cannot range-request anything.
#   -an                No audio. The page scrubs frames; there is no sound.
#
# Desktop keeps GOP 8 because it already ships that way and its decoder budget
# is larger. Mobile gets GOP 4 and a 720px height cap.
#
# POSTERS ARE EXTRACTED FROM THE ENCODED CLIP, NEVER FROM THE SOURCE. The
# poster is held on screen until the decoder paints a real frame, and it is
# swapped for that frame — if it came from the source it is a different image
# and the swap is a visible pop. See useHeroFilm.ts, the `painted` gate.
#
# WHICH CLIPS THIS TOUCHES. The shipped desktop clip already IS this recipe —
# it was encoded at GOP 8 before the mobile judder work started and was not
# re-encoded with the mobile pair, so re-running the desktop leg would replace
# a byte-exact-shipping file with a fresh encode for no reason. The default is
# therefore MOBILE ONLY. Pass --desktop (or --all) to include it deliberately,
# e.g. when the source cut itself changes.
#
# Usage:
#   bash scripts/encode-film.sh [--mobile|--desktop|--all] <source.mp4> [outdir]
#
#   (no flag)   the two mobile encodes + their posters + their plates
#   --desktop   only the 1920 encode + its poster + its plate
#   --all       everything
#
# outdir defaults to public/assets/video, which is where the component looks.

set -euo pipefail

DO_DESKTOP=0
DO_MOBILE=1
case ${1:-} in
  --mobile)  DO_DESKTOP=0; DO_MOBILE=1; shift ;;
  --desktop) DO_DESKTOP=1; DO_MOBILE=0; shift ;;
  --all)     DO_DESKTOP=1; DO_MOBILE=1; shift ;;
esac

SRC=${1:-}
OUT=${2:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/assets/video"}

if [ -z "$SRC" ]; then
  echo "Usage: bash scripts/encode-film.sh [--mobile|--desktop|--all] <source.mp4> [outdir]" >&2
  exit 2
fi
[ -f "$SRC" ] || { echo "No such source: $SRC" >&2; exit 2; }
command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not on PATH" >&2; exit 127; }

mkdir -p "$OUT/plates/tablet"

# ── desktop — 1920x1080, GOP 8 ────────────────────────────────────────────────
# Native resolution preserved. This clip is the wide band's, and the wide band
# positions its story lines in FILM units off --filmU/--filmX/--filmY, so its
# resolution is part of the layout contract: do not rescale it.
encode_desktop() {
  ffmpeg -v error -y -i "$SRC" -an \
    -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p \
    -g 8 -keyint_min 8 -sc_threshold 0 \
    -movflags +faststart "$OUT/topcat-intro-1920.mp4"
}

# ── mobile — height capped at 720, GOP 4 ──────────────────────────────────────
# `scale=-2:'min(720,ih)'` caps the height and lets the width fall out of the
# source aspect, rounded to an even number. Preserving the aspect ratio is not
# cosmetic: lib/geometry.ts maps the clip-path reveal tables through a cover
# fit computed from the aspect alone, so a squeezed encode moves the reveal
# edge off the edge in the footage it was traced against.
#
# $1 = target width label used in the filenames (608 phone / 864 tablet)
# $2 = the source cut for that band
encode_mobile() {
  local label=$1 src=$2
  ffmpeg -v error -y -i "$src" -an \
    -vf "scale=-2:'min(720,ih)'" \
    -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
    -g 4 -keyint_min 4 -sc_threshold 0 \
    -movflags +faststart "$OUT/topcat-intro-$label.mp4"
}

# ── posters — frame 0 of the ENCODED clip, never of the source ────────────────
poster() {
  ffmpeg -v error -y -ss 0 -i "$1" -frames:v 1 -c:v libwebp -quality 82 "$2"
}

if [ "$DO_DESKTOP" = 1 ]; then
  encode_desktop
  poster "$OUT/topcat-intro-1920.mp4" "$OUT/topcat-intro-poster.webp"
  # The frame-0 plate is that same first frame; it is what covers the decoder
  # before it paints, so it must match the poster exactly.
  poster "$OUT/topcat-intro-1920.mp4" "$OUT/plates/plate-f0.webp"
else
  echo "skipping desktop — the shipped 1920 clip is already this recipe (--desktop to force)"
fi

if [ "$DO_MOBILE" = 1 ]; then
  # The two mobile cuts are different edits, not crops of the desktop one; pass
  # each band's own source if you have it, otherwise both fall back to $SRC.
  encode_mobile 864 "${TOPCAT_SRC_864:-$SRC}"
  poster "$OUT/topcat-intro-864.mp4" "$OUT/topcat-intro-864-poster.webp"
  poster "$OUT/topcat-intro-864.mp4" "$OUT/plates/tablet/plate-f0.webp"

  encode_mobile 608 "${TOPCAT_SRC_608:-$SRC}"
  poster "$OUT/topcat-intro-608.mp4" "$OUT/topcat-intro-608-poster.webp"
  poster "$OUT/topcat-intro-608.mp4" "$OUT/plates/plate-f0-phone.webp"
fi

echo "Encoded into $OUT:"
ls -l "$OUT"
echo
echo "Now bump the ?v= stamps in src/components/HeroFilm/lib/constants.ts —"
echo "a stale cached clip will otherwise outlive this encode."
