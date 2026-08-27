import { describe, expect, it } from 'vitest';

import { contentBox } from './geometry';
import {
  PANE_SEAM,
  STRIP_BLEED,
  WEDGE_BLEED,
  cornerPane,
  paneSlant,
  wedgePane,
  type RevealMetrics,
} from './reveal';

/**
 * The reveal line's real computed style in the phone band, read off the page at
 * 390x844. `width` reads 390px while the line's content box is 335.406px:
 * `box-sizing` is `border-box`, so Blink resolves `width` to the BORDER box.
 *
 * The padding really is 27.296875px and the computed style rounds it to
 * `27.3px`, so peeling it back off lands on 335.4 rather than 335.40625. Six
 * thousandths of a pixel is not the reveal's problem; fifty-four pixels was.
 */
const PHONE_LINE = {
  boxSizing: 'border-box',
  width: '390px',
  height: '136.4375px',
  paddingLeft: '27.3px',
  paddingRight: '27.3px',
  paddingTop: '0px',
  paddingBottom: '0px',
  borderLeftWidth: '0px',
  borderRightWidth: '0px',
  borderTopWidth: '0px',
  borderBottomWidth: '0px',
};

/** The same line in the wide band at 1440x900 — no padding, nothing to peel. */
const WIDE_LINE = {
  ...PHONE_LINE,
  width: '748.796875px',
  height: '237.390625px',
  paddingLeft: '0px',
  paddingRight: '0px',
};

describe('contentBox', () => {
  it('peels padding and border off a border-box element', () => {
    expect(contentBox(PHONE_LINE)).toEqual({
      w: 335.4,
      h: 136.4375,
      pl: 27.3,
      pt: 0,
    });
  });

  it('leaves a content-box element alone', () => {
    expect(contentBox({ ...PHONE_LINE, boxSizing: 'content-box' })).toEqual({
      w: 390,
      h: 136.4375,
      pl: 27.3,
      pt: 0,
    });
  });

  it('is the identity where there is no padding — the wide and tablet bands', () => {
    const box = contentBox(WIDE_LINE);
    expect(box.w).toBe(748.796875);
    expect(box.h).toBe(237.390625);
    expect(box.pl).toBe(0);
    expect(box.pt).toBe(0);
  });

  it('subtracts borders as well as padding', () => {
    expect(
      contentBox({
        ...PHONE_LINE,
        borderLeftWidth: '2px',
        borderRightWidth: '3px',
        borderTopWidth: '1px',
      }).w,
    ).toBeCloseTo(330.4, 6);
  });

  it('treats an unparseable length as zero', () => {
    expect(contentBox({ ...PHONE_LINE, paddingRight: 'auto' }).w).toBeCloseTo(362.7, 6);
  });
});

/**
 * THE REGRESSION. Feeding the border-box width in as `cw` moved the wedge
 * pane's clip edge — which is placed by subtracting `cw + bleed.r` from the
 * slant — 54.6px behind the slant, while the strip pane's edge, placed off the
 * bleed alone, stayed on it. The two panes stopped tiling and the band between
 * them was uncovered by neither: a black bar down the middle of the headline
 * for the whole sweep. Measured on the phone at source frame 198, the gap was
 * 53.9px at every scanline.
 */
describe('the two phone panes tile along the slant', () => {
  /** The line's real content width in the phone band at 390x844. */
  const CW = 335.40625;

  const metrics = (cw: number): RevealMetrics => ({
    sc: 0.78168,
    dx: -42.63,
    dy: 0,
    left: 0,
    top: 122,
    w: 390,
    h: 136,
    pl: 27.3,
    pt: 0,
    cw,
    ch: 136.4375,
  });

  /** Source frame 198: x0/sx/yp/sy straight off the tables, PAD applied. */
  const x0 = 241.7 - 3;
  const sx = -0.3542;
  const yp = 296.6 - 3;
  const sy = 0.0439;

  /** Where each pane's clip edge actually lands, in pane coordinates at v. */
  const wedgeRight = (cwUsed: number, v: number): number => {
    const box = metrics(cwUsed);
    const m = wedgePane(paneSlant(x0, sx, box, 240), sx, box, WEDGE_BLEED);
    // the pane's REAL right edge, which is measured off the real content box
    // b = 0 on the wedge, so the pane's local y IS v.
    const trueRight = CW + WEDGE_BLEED.r;
    return trueRight + m.c * v + m.e;
  };

  const stripLeft = (v: number): number => {
    const box = metrics(CW);
    const a = paneSlant(x0, sx, box, 240);
    const b =
      box.dy - box.top + box.sc * (yp - sy * 304) + sy * (box.left - box.dx) - box.pt + sy * box.pl;
    const m = cornerPane(a - PANE_SEAM, sx, b, sy, box, STRIP_BLEED);
    // The strip carries both shears, so its local y is not v: invert the second
    // row of the matrix on the left edge x = -STRIP_BLEED.l first.
    const L = -STRIP_BLEED.l;
    const yLocal = v - m.b * L - m.f;
    return L + m.c * yLocal + m.e;
  };

  it('overlaps by exactly PANE_SEAM when cw is the content box', () => {
    for (const v of [0, 34.1, 68.2, 102.3, 136.4]) {
      expect(stripLeft(v) - wedgeRight(CW, v)).toBeCloseTo(-PANE_SEAM, 6);
    }
  });

  it('opens a 53.85px hole when cw is the border box', () => {
    for (const v of [0, 34.1, 68.2, 102.3, 136.4]) {
      expect(stripLeft(v) - wedgeRight(390, v)).toBeCloseTo(390 - CW - PANE_SEAM, 6);
    }
  });
});
