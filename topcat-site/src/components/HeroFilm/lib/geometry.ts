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
 * The film -> element coordinate frame used by the reveal.
 *
 * `sc` is box-px per film-px; `dx`/`dy` are the film origin in *viewport*
 * coordinates (they fold in the box's own viewport position), and
 * `left`/`top`/`w`/`h` are the target element's offset box.
 *
 * `pl`/`pt`/`cw`/`ch` are the element's own padding and CONTENT-box size, and
 * they are a separate set of numbers on purpose: `left`/`top`/`w`/`h` come off
 * `offsetLeft` and friends, which browsers round to whole pixels, while the
 * composited reveal's clip panes are placed off `getComputedStyle`, which is
 * exact. Half a pixel of error in a pane's edge is half a pixel of error in the
 * reveal, so the pane geometry never reads the rounded set. See ./reveal.ts.
 */
export interface RevealFrame {
  sc: number;
  dx: number;
  dy: number;
  left: number;
  top: number;
  w: number;
  h: number;
  /** the element's padding-left / padding-top, in px */
  pl: number;
  pt: number;
  /** the element's content-box width / height, in px */
  cw: number;
  ch: number;
  /** the film's nominal source width for this band: 1920 / 584 / 608 */
  fw: number;
  ok: boolean;
}

/**
 * `measureReveal()`'s frame computation, site.js 3078-3088.
 *
 * `bgRect` is `.hero-bg`'s viewport rect; `el` is the reveal line's offset box
 * within it, plus its exact padding and content box. `videoW`/`videoH` fall
 * back to `fw x 1080` before metadata lands.
 */
export function revealFrame(args: {
  bgRect: { left: number; top: number; width: number; height: number };
  el: {
    left: number;
    top: number;
    width: number;
    height: number;
    padLeft?: number;
    padTop?: number;
    contentW?: number;
    contentH?: number;
  };
  fw: number;
  videoW: number;
  videoH: number;
}): RevealFrame {
  const { bgRect, el, fw } = args;
  const pl = el.padLeft ?? 0;
  const pt = el.padTop ?? 0;
  const base: RevealFrame = {
    sc: 0.8333,
    dx: -80,
    dy: 0,
    left: el.left,
    top: el.top,
    w: el.width,
    h: el.height,
    pl,
    pt,
    cw: el.contentW ?? Math.max(0, el.width - 2 * pl),
    ch: el.contentH ?? Math.max(0, el.height - 2 * pt),
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

/**
 * An element's exact CONTENT box, and the padding that offsets it.
 *
 * `getComputedStyle().width` is NOT the content box. Blink resolves it against
 * the element's own `box-sizing`, so on a `border-box` element it comes back as
 * the BORDER box. The reveal line is `border-box`, and in the phone band it
 * carries 27.3px of horizontal padding: measured at 390x844, `cs.width` reads
 * 390px while the line's content box is 335.406px.
 *
 * That difference is not cosmetic. `wedgePane()` places the wedge's clip edge
 * by subtracting `cw + bleed.r` from the slant's intercept, so a `cw` that is
 * 54.6px too large parks the wedge's edge 54.6px BEHIND the slant — while
 * `cornerPane()`, which is placed off the bleed alone, keeps the strip's edge
 * on it. The two panes stop tiling: a 53.85px band between them is uncovered by
 * neither, for the whole sweep. That is the black bar down the middle of the
 * headline the client reported, and it is phone-only for two independent
 * reasons — the phone band is the only one whose reveal line has horizontal
 * padding (`cs.width` is exact where padding is 0), and the only one with a
 * second pane for a gap to open against.
 *
 * Returned unrounded: half a pixel of error in a pane's edge is half a pixel of
 * error in the reveal, which is why these four numbers come off the computed
 * style rather than off `offsetWidth`.
 */
export function contentBox(cs: {
  boxSizing: string;
  width: string;
  height: string;
  paddingLeft: string;
  paddingRight: string;
  paddingTop: string;
  paddingBottom: string;
  borderLeftWidth: string;
  borderRightWidth: string;
  borderTopWidth: string;
  borderBottomWidth: string;
}): { w: number; h: number; pl: number; pt: number } {
  const num = (v: string): number => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  const pl = num(cs.paddingLeft);
  const pt = num(cs.paddingTop);
  const w = num(cs.width);
  const h = num(cs.height);
  if (cs.boxSizing !== 'border-box') return { w, h, pl, pt };
  const insetX =
    pl + num(cs.paddingRight) + num(cs.borderLeftWidth) + num(cs.borderRightWidth);
  const insetY =
    pt + num(cs.paddingBottom) + num(cs.borderTopWidth) + num(cs.borderBottomWidth);
  return { w: Math.max(0, w - insetX), h: Math.max(0, h - insetY), pl, pt };
}
