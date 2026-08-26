/**
 * HERO FILM — film-space geometry.
 *
 * The film is `object-fit: cover` inside `.hero-bg`. Three separate parts of
 * the module need to map between film pixels and element pixels:
 *
 *   - `setFilmFrame()`  writes `--filmU/--filmX/--filmY`, off which the entire
 *                       wide-band `.cine-line` layout is computed in CSS.
 *   - `grade()`/`bandGrade()` map an element rect back into video source
 *                       coordinates to sample it.
 *   - `measureReveal()` builds the film -> element coordinate frame the
 *                       clip-path polygons are expressed in.
 *
 * All three use the same cover fit; it lives here once.
 */

/** The cover-fit placement of a `vw x vh` source inside a `boxW x boxH` box. */
export interface CoverFit {
  /** drawn width, in box pixels */
  dw: number;
  /** drawn height, in box pixels */
  dh: number;
  /** left offset of the drawn image relative to the box, in box pixels */
  dx: number;
  /** top offset of the drawn image relative to the box, in box pixels */
  dy: number;
}

/**
 * Cover fit, verbatim from `grade()` (site.js 3000-3003).
 *
 * Note the branch is on aspect ratio, not on scale: when the source is wider
 * than the box the height is pinned and the width overflows symmetrically,
 * otherwise the width is pinned and the height overflows.
 */
export function coverFit(
  boxW: number,
  boxH: number,
  vw: number,
  vh: number,
): CoverFit {
  const vr = vw / vh;
  const br = boxW / boxH;
  if (vr > br) {
    const dh = boxH;
    const dw = dh * vr;
    return { dw, dh, dx: (boxW - dw) / 2, dy: 0 };
  }
  const dw = boxW;
  const dh = dw / vr;
  return { dw, dh, dx: 0, dy: (boxH - dh) / 2 };
}

/** The three root custom properties the wide-band line layout is built on. */
export interface FilmFrame {
  /** px per film unit */
  filmU: number;
  /** px offset of film x=0 from the box's left edge */
  filmX: number;
  /** px offset of film y=0 from the box's top edge */
  filmY: number;
}

/**
 * `setFilmFrame()`, site.js 2888-2895.
 *
 * The rounding is load-bearing: `--filmU` at 5dp and the offsets at 2dp keep
 * the CSS `calc()` chain from producing a different sub-pixel result on every
 * animation frame, which would invalidate layout 60 times a second.
 */
export function filmFrame(
  boxW: number,
  boxH: number,
  fw: number,
  fh: number,
): FilmFrame {
  const sc = Math.max(boxW / fw, boxH / fh);
  return {
    filmU: Math.round(sc * 100000) / 100000,
    filmX: Math.round(((boxW - fw * sc) / 2) * 100) / 100,
    filmY: Math.round(((boxH - fh * sc) / 2) * 100) / 100,
  };
}

/**
 * The film -> element coordinate frame used by the reveal polygons.
 *
 * `sc` is box-px per film-px; `dx`/`dy` are the film origin in *viewport*
 * coordinates (they fold in the box's own viewport position), and
 * `left`/`top`/`w`/`h` are the target element's offset box.
 */
export interface RevealFrame {
  sc: number;
  dx: number;
  dy: number;
  left: number;
  top: number;
  w: number;
  h: number;
  /** the film's nominal source width for this band: 1920 / 864 / 608 */
  fw: number;
  ok: boolean;
}

/**
 * `measureReveal()`'s frame computation, site.js 3078-3088.
 *
 * `bgRect` is `.hero-bg`'s viewport rect; `el` is the reveal line's offset box
 * within it. `videoW`/`videoH` fall back to `fw x 1080` before metadata lands.
 */
export function revealFrame(args: {
  bgRect: { left: number; top: number; width: number; height: number };
  el: { left: number; top: number; width: number; height: number };
  fw: number;
  videoW: number;
  videoH: number;
}): RevealFrame {
  const { bgRect, el, fw } = args;
  const base: RevealFrame = {
    sc: 0.8333,
    dx: -80,
    dy: 0,
    left: el.left,
    top: el.top,
    w: el.width,
    h: el.height,
    fw,
    ok: false,
  };
  if (!bgRect.width || !bgRect.height) return base;

  const vr =
    args.videoW && args.videoH ? args.videoW / args.videoH : fw / 1080;
  // coverFit() takes (w, h) of the source; feed it the aspect ratio directly.
  const fit = coverFit(bgRect.width, bgRect.height, vr, 1);
  return {
    ...base,
    sc: fit.dw / fw,
    dx: bgRect.left + fit.dx,
    dy: bgRect.top + fit.dy,
    ok: true,
  };
}

/**
 * Source-space sampling rectangle for a viewport rect drawn over the film.
 *
 * Returns the `sx, sy, sw, sh` arguments for `drawImage`. Used by both the nav
 * grade (which passes the top `header.bar` band) and the per-line band grade.
 */
export function sampleRect(args: {
  bgRect: { left: number; top: number; width: number; height: number };
  rect: { left: number; top: number; width: number; height: number };
  videoW: number;
  videoH: number;
}): { sx: number; sy: number; sw: number; sh: number } {
  const { bgRect, rect, videoW, videoH } = args;
  const fit = coverFit(bgRect.width, bgRect.height, videoW, videoH);
  const sc = videoW / fit.dw;
  return {
    sx: (rect.left - bgRect.left - fit.dx) * sc,
    sy: (rect.top - bgRect.top - fit.dy) * sc,
    sw: Math.max(1, rect.width * sc),
    sh: Math.max(1, rect.height * sc),
  };
}
