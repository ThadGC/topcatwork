/**
 * HERO FILM — the reveal.
 *
 * Beat 2, "The slab you choose is unique.", is not faded in. It is UNCOVERED
 * by a slanted edge tracked against a real moving edge in the footage.
 *
 * ⛔ THE TABLES BELOW WERE MEASURED BY HAND, FRAME BY FRAME, AGAINST THE FILM.
 * There is no closed form and they cannot be re-derived from anything except
 * the footage itself. If they are lost the reveal can only be rebuilt by
 * re-measuring every frame by eye. They are also in
 * ~/Documents/TOPCAT-FILM-SPEC/FILM-SPEC.md §5.
 *
 * ── the grid now matches the film ───────────────────────────────────────────
 * They were measured on every SECOND frame of a 24fps master, i.e. a 12fps
 * grid, and the old build had to divide to get from one to the other. The
 * shipping cuts are now encoded AT 12fps, so a table index IS a film frame:
 * `frameIndex = filmSeconds * 12`. The checks still hold — 124/12 = 10.33s
 * against a wide beat at 10.3, 170/12 = 14.17s against a phone beat at 14.5.
 *
 * ── driven by the SCROLL, not by the decoder ────────────────────────────────
 * The old build drove this off `requestVideoFrameCallback`, on the reasoning
 * that the edge must track frames actually on screen. On a real network that
 * was a mistake: while scrubbing, rVFC fires when a SEEK COMPLETES, which is
 * the network's clock — a few times a second on cellular. So the reveal edge
 * stepped at network rate while everything else ran at display rate, and when
 * a seek stalled the edge froze and then leapt. It is now driven from the same
 * scroll-derived film time as every other output, so the whole frame is
 * internally consistent and nothing on screen is ever waiting on a socket.
 *
 * ── why the picture is a BOX and not a clip-path ─────────────────────────────
 * The original wrote a fresh `clip-path` polygon to the headline every
 * animation frame. An animating clip-path cannot be composited: the browser
 * re-rasterises the whole headline sixty times a second.
 *
 * Instead each PANE is a wrapper with `overflow: clip` carrying an affine
 * transform, and the copy inside it carries the EXACT INVERSE. The wrapper's
 * overflow clips in its own local space, so the clip edge moves while the
 * glyphs, counter-transformed, do not move at all. Both elements change only
 * `transform`. Neither is ever repainted.
 *
 * ── why the phone needs two panes ───────────────────────────────────────────
 * Wide hides ONE half-plane — everything right of the slant — so one wrapper
 * does it. The phone's region is the UNION of two half-planes: visible left of
 * the slant OR above a second, horizontal edge. A union of half-planes is not
 * convex, and no affine image of a rectangle ever is, so no single wrapper —
 * and no nest of them, which can only INTERSECT — can express it. It is two
 * disjoint pieces over two copies of the copy, overlapping by PANE_SEAM so the
 * shared edge has no translucent hairline.
 *
 * ⛔ THE TABLET'S OWN TABLE IS NOT HERE. It was measured against a 584-wide
 * crop of the mobile master that no longer ships — the tablet plays the wide
 * cut. It is preserved in the archive. Do not wire it back without
 * re-measuring against whatever footage the tablet is playing at the time.
 */

/** Film-space bleed subtracted from the reveal edge so it never hairlines. */
export const REV_PAD = 3;

/* ── wide, >=721px — film width 1920, reveal starts at grid frame 124 ─────── */

export const REV_F0 = 124;
export const REV_YREF = 490;

export const REV_X: readonly number[] = [
2.0, 8.9, 26.9, 46.1, 66.2, 86.3, 106.8, 127.9, 149.8, 171.2, 193.2, 215.9, 238.8, 261.5,
  283.5, 306.1, 328.6, 350.8, 373.1, 395.0, 416.9, 438.2, 459.5, 480.7, 501.7, 521.9, 541.8, 561.5,
  581.2, 600.1, 618.6, 637.4, 655.8, 673.4, 690.2, 707.4, 724.3, 740.6, 756.0, 771.7, 787.6, 802.4,
  816.6, 831.1, 845.5, 859.2, 872.3, 885.6, 898.9, 911.7, 923.7, 936.0, 948.2, 959.9, 971.4, 982.6,
  993.7, 1004.2, 1014.6, 1025.1, 1035.6, 1045.6, 1055.1, 1064.6, 1074.2, 1083.5, 1092.3, 1101.2, 1110.2, 1118.5,
  1126.4, 1134.6, 1142.6, 1150.4, 1158.1, 1165.5, 1172.9, 1179.8, 1186.3, 1193.1, 1199.7, 1205.7,
];

export const REV_S: readonly number[] = [
0.0, -0.0294, -0.0334, -0.0351, -0.0378, -0.0408, -0.044, -0.0477, -0.0515, -0.0538,
  -0.0594, -0.0643, -0.0672, -0.0712, -0.075, -0.0796, -0.083, -0.0874, -0.0923, -0.0952,
  -0.1001, -0.1037, -0.1098, -0.1144, -0.1182, -0.1232, -0.1294, -0.1341, -0.1394, -0.1449,
  -0.1505, -0.1553, -0.1599, -0.1647, -0.1713, -0.1774, -0.1834, -0.1888, -0.1949, -0.2011,
  -0.2062, -0.2111, -0.2176, -0.2226, -0.228, -0.2341, -0.2383, -0.2434, -0.2487, -0.2527,
  -0.2576, -0.2621, -0.2678, -0.2737, -0.2785, -0.2832, -0.2891, -0.2936, -0.2982, -0.3027,
  -0.3074, -0.3116, -0.3169, -0.3216, -0.3257, -0.3296, -0.3335, -0.3377, -0.341, -0.3443,
  -0.3482, -0.3507, -0.3544, -0.3583, -0.3621, -0.3652, -0.3684, -0.372, -0.3746, -0.3774,
  -0.3803, -0.3845,
];

/* ── phone, <=720px — film width 608, reveal starts at grid frame 170 ─────── */

export const PREV_F0 = 170;
/** Film-space y the slant's x-intercept is quoted at. */
export const PREV_XREF = 240;
/** Film-space x the horizontal edge's y-intercept is quoted at. */
export const PREV_YREF = 304;

export const PREV_X: readonly number[] = [
25.2, 31.6, 38.3, 44.3, 50.2, 54.8, 60.1, 64.0, 67.5, 69.8, 72.9, 74.3, 75.6, 78.8, 85.1, 92.0,
  99.5, 109.0, 119.7, 130.8, 143.2, 156.4, 169.5, 182.8, 194.8, 207.9, 221.0, 232.1, 241.7, 255.0, 264.0, 273.0,
];

export const PREV_SX: readonly number[] = [
-0.2289, -0.2369, -0.2456, -0.2523, -0.2593, -0.261, -0.2687, -0.2718, -0.2769, -0.2809,
  -0.2861, -0.2905, -0.295, -0.2995, -0.3054, -0.3093, -0.3147, -0.3201, -0.3218, -0.3264,
  -0.3303, -0.3355, -0.3404, -0.3461, -0.3479, -0.3522, -0.3585, -0.3591, -0.3542, -0.375, -0.375, -0.375,
];

/**
 * The horizontal edge is not in shot for the first 8 frames of the phone
 * reveal. `-9999` is the sentinel for "not yet", and it parks the strip pane's
 * edge ten thousand film pixels above the copy, which clips that pane's whole
 * copy away — exactly what the original's 4-point stage-1 wedge meant.
 */
export const PREV_Y: readonly number[] = [
-9999, -9999, -9999, -9999, -9999, -9999, -9999, -9999, -8.1, -4.1, -0.7, 2.6, 6.3, 13.4, 26.2, 41.2,
  58.6, 77.9, 99.0, 120.8, 142.7, 164.5, 186.2, 206.9, 227.0, 246.0, 263.9, 280.7, 296.6, 310.8, 324.1, 335.9,
];

export const PREV_SY: readonly number[] = [
0, 0, 0, 0, 0, 0, 0, 0, 0.0542, 0.0525, 0.0523, 0.0518, 0.0511, 0.0511, 0.0506, 0.0502,
  0.05, 0.0499, 0.0493, 0.0487, 0.048, 0.0473, 0.0459, 0.0464, 0.0456, 0.0459, 0.0459, 0.0454,
  0.0439, 0.044, 0.0432, 0.0423,
];

/**
 * Clamp-ended linear interpolation into a frame table.
 *
 * `u` is a FRACTIONAL frame index. The film time is continuous, so the edge is
 * interpolated between measured frames rather than stepped, which is what
 * keeps it smooth however fast the visitor scrolls.
 */
export function at(a: readonly number[], u: number): number {
  const n = a.length - 1;
  if (u <= 0) return a[0];
  if (u >= n) return a[n];
  const i = Math.floor(u);
  return a[i] + (a[i + 1] - a[i]) * (u - i);
}

/** The film -> element coordinate frame the tables are expressed in. */
export interface RevealBox {
  sc: number;
  dx: number;
  dy: number;
  left: number;
  top: number;
  w: number;
  h: number;
}

/** A 2D affine map, in CSS `matrix(a,b,c,d,e,f)` order. */
export interface Affine {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export const IDENTITY: Affine = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

/**
 * A pane parked far above everything, i.e. clipping its own copy away entirely.
 *
 * Used for the strip pane on the bands that have no second edge, and for both
 * panes under `?reveal=off`. It is a transform like any other, so switching a
 * pane off costs a compositor property change and not a paint.
 */
export const PANE_OFF: Affine = { a: 1, b: 0, c: 0, d: 1, e: 0, f: -100000 };

/**
 * Is this pane carrying no edge at all this frame?
 *
 * `PANE_OFF` is a real transform and writing it to the DOM would be correct:
 * the pane's clip box lands a hundred thousand pixels above the copy and
 * uncovers nothing. It is still not what the engine writes, because a pane
 * whose inner has been counter-translated the same hundred thousand pixels
 * back out of the box is — under the `overflow: hidden` fallback that Safari
 * before 16 gets, having no `overflow: clip` — a scroll container with a
 * hundred thousand pixels of scrollable overflow, sitting on the page for as
 * long as the band lasts. The engine parks the pane with `visibility` over the
 * identity instead: nothing paints either way, and this way nothing can scroll
 * to it either. This is how it tells the two cases apart.
 *
 * The threshold has a long way to fall before it can catch a real pane. The
 * largest offset the tables ever ask for is the phone's own "not in shot yet"
 * sentinel, which lands the strip's edge around −8000; `./reveal.test.ts`
 * pins that margin so a future table cannot creep up on it.
 */
export function isPaneOff(m: Affine): boolean {
  return m.f <= PANE_OFF.f;
}

export function applyAffine(m: Affine, x: number, y: number): [number, number] {
  return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
}

/** `m ∘ n` — `n` applied first, exactly as `transform: <m> <n>` composes. */
export function composeAffine(m: Affine, n: Affine): Affine {
  return {
    a: m.a * n.a + m.c * n.b,
    b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d,
    d: m.b * n.c + m.d * n.d,
    e: m.a * n.e + m.c * n.f + m.e,
    f: m.b * n.e + m.d * n.f + m.f,
  };
}

/** The exact inverse. This is what the inner element carries. */
export function invertAffine(m: Affine): Affine {
  const det = m.a * m.d - m.b * m.c;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
}

/**
 * `matrix(...)`, at a precision that keeps the pair an inverse pair.
 *
 * The offsets are quantised at 1e-4px and the shears at 1e-9. The shears look
 * over-precise until you notice what multiplies them: the inner's translation
 * runs to a couple of thousand pixels, because that is how far the copy has to
 * be pushed back through the pane, and a quantisation error on a shear is paid
 * against THAT, not against the width of the line. At 1e-6 the pair would stop
 * cancelling at around two thousandths of a pixel; at 1e-9 it is a millionth,
 * and the strings are still short — the shears come out of the measured tables
 * with four decimals and only the inverses need the tail.
 */
export function affineCss(m: Affine): string {
  const q9 = (n: number) => Math.round(n * 1e9) / 1e9;
  const q4 = (n: number) => Math.round(n * 1e4) / 1e4;
  return (
    'matrix(' +
    q9(m.a) +
    ',' +
    q9(m.b) +
    ',' +
    q9(m.c) +
    ',' +
    q9(m.d) +
    ',' +
    q4(m.e) +
    ',' +
    q4(m.f) +
    ')'
  );
}

/**
 * The reveal line's own box, as the panes see it.
 *
 * `sc`/`dx`/`dy`/`left`/`top`/`w`/`h` are the film frame the polygons were
 * expressed in, unchanged. The four extra numbers are the line's PADDING and
 * its CONTENT-box size, read off `getComputedStyle` because both have to be
 * exact to the sub-pixel: `pl`/`pt` place the shared transform origin, and
 * `cw`/`ch` are what the pane's own clip rectangle is measured from.
 * `offsetWidth` would not do — it is rounded to whole pixels, and half a pixel
 * of error in the pane's edge is half a pixel of error in the reveal.
 */
export interface RevealMetrics extends RevealBox {
  /** the line's padding-left / padding-top, in px */
  pl: number;
  pt: number;
  /** the line's content-box width / height, in px */
  cw: number;
  ch: number;
}

/** How far a pane's box reaches past the copy on each side, in px. */
export interface PaneBleed {
  l: number;
  t: number;
  r: number;
  b: number;
}

/**
 * The wedge pane clips with its RIGHT edge, so its other three sides have to
 * stay clear of the copy for the whole sweep. Its left edge trails the reveal
 * edge by `l + cw + r`, and the sweep only ends once that edge has cleared the
 * line's right-hand side — which is why `l` is the big one.
 */
export const WEDGE_BLEED: PaneBleed = { l: 800, t: 80, r: 120, b: 80 };

/**
 * The strip pane clips with its LEFT and BOTTOM edges, so the slack goes the
 * other way: its top edge trails the horizontal edge by `t + ch + b`, and its
 * right edge trails the slant by `l + cw + r`.
 */
export const STRIP_BLEED: PaneBleed = { l: 120, t: 800, r: 800, b: 80 };

/**
 * How far the strip pane reaches back across the slant, in px.
 *
 * The two panes tile the plane along the slant. Abutting them exactly would put
 * two antialiased clip edges on the same line, each contributing about half
 * coverage, which reads as a translucent hairline down the headline.
 * Overlapping them instead costs a sub-pixel band in which glyph antialiasing
 * is laid down twice — invisible, because a solid glyph interior is unchanged
 * by a second identical pass.
 */
export const PANE_SEAM = 0.75;

/** The slant, in pane coordinates: `u = a + s·v`. */
export function paneSlant(
  x0: number,
  s: number,
  box: RevealMetrics,
  ref: number,
): number {
  const A = box.dx - box.left + box.sc * (x0 - s * ref) + s * (box.top - box.dy);
  return A - box.pl + s * box.pt;
}

/** The film's horizontal edge, in pane coordinates: `v = b + s·u`. */
export function paneLevel(
  y0: number,
  s: number,
  box: RevealMetrics,
  ref: number,
): number {
  const B = box.dy - box.top + box.sc * (y0 - s * ref) + s * (box.left - box.dx);
  return B - box.pt + s * box.pl;
}

/**
 * A pane whose RIGHT edge lands on `u = a + s·v`.
 *
 * One shear. `matrix(1,0,s,1,tx,0)` IS `translateX(tx) skewX(atan s)`, and its
 * inverse is `skewX(-atan s) translateX(-tx)` — the plain double transform.
 */
export function wedgePane(
  a: number,
  s: number,
  box: RevealMetrics,
  bl: PaneBleed,
): Affine {
  return { a: 1, b: 0, c: s, d: 1, e: a - (box.cw + bl.r), f: 0 };
}

/**
 * A pane whose LEFT edge lands on `u = a + sx·v` AND whose BOTTOM edge lands on
 * `v = b + sy·u`.
 *
 * Two shears at once. Solving the images of those two edges for the offsets:
 *
 *      e = (a + sx·b)/D − L − sx·B          D = 1 − sx·sy
 *      f = (b + sy·a)/D − B − sy·L
 *
 * which comes out symmetric in the two edges, as it has to.
 */
export function cornerPane(
  a: number,
  sx: number,
  b: number,
  sy: number,
  box: RevealMetrics,
  bl: PaneBleed,
): Affine {
  const L = -bl.l;
  const B = box.ch + bl.b;
  const D = 1 - sx * sy;
  return {
    a: 1,
    b: sy,
    c: sx,
    d: 1,
    e: (a + sx * b) / D - L - sx * B,
    f: (b + sy * a) / D - B - sy * L,
  };
}

/** One frame of the composited reveal. */
export interface RevealPanes {
  /**
   * The sweep is over and nothing is clipped.
   *
   * This is the `''` the polygon used to return, and it carries the same
   * meaning downstream in both the places it did. It is what tells the engine
   * the line's scrim may finally come on — and it is what RELEASES the clip.
   * The polygon was removed from the element at this point and the line was
   * left unclipped for the rest of the page's life; the panes' `overflow` comes
   * off here for the same reason, so that nothing the line paints afterwards
   * has to fit inside a pane's bleed to survive.
   */
  done: boolean;
  /** the wedge pane's wrapper transform; its inner carries the inverse */
  wedge: Affine;
  /** the strip pane's wrapper transform. `PANE_OFF` on wide and tablet. */
  strip: Affine;
}

const ALL_ON: RevealPanes = { done: true, wedge: IDENTITY, strip: PANE_OFF };

/**
 * Wide and tablet — one slanted edge, one pane.
 *
 * The `done` test is the polygon's, verbatim, rounding included: the sweep is
 * over either when the table runs out or when the edge has cleared the line's
 * right-hand side by 30px, and the intercepts it compares are the ones the
 * polygon quoted at 1dp.
 */
export function widePanes(frameIndex: number, box: RevealMetrics): RevealPanes {
  const GX = REV_X;
  const GS = REV_S;
  const GF0 = REV_F0;
  const GYR = REV_YREF;

  const i = frameIndex - GF0;
  const x0 = at(GX, i) - REV_PAD;
  const s = at(GS, i);
  const yT = box.top - 60;
  const yB = box.top + box.h + 60;
  const xT = Number(
    (box.dx + (x0 + s * ((yT - box.dy) / box.sc - GYR)) * box.sc - box.left).toFixed(1),
  );
  const xB = Number(
    (box.dx + (x0 + s * ((yB - box.dy) / box.sc - GYR)) * box.sc - box.left).toFixed(1),
  );
  if (i >= GX.length - 1 || Math.min(xT, xB) > box.w + 30) return ALL_ON;

  return {
    done: false,
    wedge: wedgePane(paneSlant(x0, s, box, GYR), s, box, WEDGE_BLEED),
    strip: PANE_OFF,
  };
}

/**
 * Phone — the slant and the horizontal edge, two panes.
 *
 * The polygon's two stages need no branch here. Before the horizontal edge is
 * in shot `PREV_Y` holds its `-9999` sentinel, which puts the strip pane's
 * bottom edge some ten thousand film pixels above the copy: the pane clips its
 * whole copy away on its own, which is exactly what the polygon's 4-point
 * stage-1 wedge meant.
 */
export function phonePanes(frameIndex: number, box: RevealMetrics): RevealPanes {
  const i = frameIndex - PREV_F0;
  if (i >= PREV_X.length - 1) return ALL_ON;

  const x0 = at(PREV_X, i) - REV_PAD;
  const sx = at(PREV_SX, i);
  const yp = at(PREV_Y, i) - REV_PAD;
  const sy = at(PREV_SY, i);

  const a = paneSlant(x0, sx, box, PREV_XREF);
  const b = paneLevel(yp, sy, box, PREV_YREF);

  return {
    done: false,
    wedge: wedgePane(a, sx, box, WEDGE_BLEED),
    strip: cornerPane(a - PANE_SEAM, sx, b, sy, box, STRIP_BLEED),
  };
}

/** Dispatch on band, exactly as `revealClip` does. */
export function revealPanes(
  frameIndex: number,
  box: RevealMetrics,
  band: { phone: boolean },
): RevealPanes {
  return band.phone ? phonePanes(frameIndex, box) : widePanes(frameIndex, box);
}

/**
 * Is this pane-space point inside the pane's clip?
 *
 * Pull the point back through the wrapper's transform and ask whether it landed
 * inside the wrapper's own rectangle. The tests use it to check the panes
 * against the polygon region for region, which is the only comparison that
 * actually proves the picture did not move.
 */
export function insidePane(
  m: Affine,
  box: RevealMetrics,
  bl: PaneBleed,
  u: number,
  v: number,
): boolean {
  const [x, y] = applyAffine(invertAffine(m), u, v);
  return x >= -bl.l && x <= box.cw + bl.r && y >= -bl.t && y <= box.ch + bl.b;
}
