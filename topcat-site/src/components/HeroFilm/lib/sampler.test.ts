/**
 * The readback memo, and the bug it exists to prevent.
 *
 * `drawImage(video, …)` + `getImageData` pulls the decoded frame back off the
 * GPU. It is the single most expensive thing the film does per tick, and the
 * memo is the only thing standing between one readback per presented frame and
 * one per animation frame per lit line.
 *
 * The regression these tests pin: keying the memo on a rect rounded to ONE
 * pixel. A story line is in motion for the whole intro, so its rect moved every
 * tick, every key missed, and the cache did nothing at exactly the moment it
 * was needed. Reported from a device as "stuttering on the intro right up until
 * the text overlay disappears, then smooth" -- which is bandGrade() ceasing to
 * be called, not the film getting easier.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FrameSampler, type Rect } from './sampler';


/** A canvas whose readback is real enough to count, and free to run. */
function stubCanvas() {
  const ctx = {
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(48 * 8 * 4).fill(128),
    })),
  };
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    if (tag !== 'canvas') return document.createElementNS('http://www.w3.org/1999/xhtml', tag);
    return { width: 0, height: 0, getContext: () => ctx } as unknown as HTMLCanvasElement;
  }) as typeof document.createElement);
  return ctx;
}

const video = { videoWidth: 406, videoHeight: 720, readyState: 4 } as HTMLVideoElement;
const bg: Rect = { left: 0, top: 0, width: 406, height: 720 };

describe('FrameSampler readback memo', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('reads once for a still line held on one video frame', () => {
    stubCanvas();
    const s = new FrameSampler();
    s.setFrame(1);
    const r: Rect = { left: 40, top: 300, width: 320, height: 90 };
    for (let i = 0; i < 30; i++) s.bandGrade('line-0', video, bg, r);
    expect(s.reads).toBe(1);
  });

  it('re-reads when the video frame advances', () => {
    stubCanvas();
    const s = new FrameSampler();
    const r: Rect = { left: 40, top: 300, width: 320, height: 90 };
    for (const f of [1, 2, 3]) {
      s.setFrame(f);
      s.bandGrade('line-0', video, bg, r);
      s.bandGrade('line-0', video, bg, r);
    }
    expect(s.reads).toBe(3);
  });

  it('THE REGRESSION: a line sliding sub-pixel-per-tick does not read every tick', () => {
    stubCanvas();
    const s = new FrameSampler();
    s.setFrame(7);
    // The wipe: ~1.5px of travel per animation frame, held on one video frame
    // (a 24fps frame spans ~2.5 ticks at 60Hz). Rounded to 1px this produced a
    // fresh key nearly every tick.
    for (let i = 0; i < 40; i++) {
      s.bandGrade('line-0', video, bg, { left: 40 + i * 1.5, top: 300, width: 320, height: 90 });
    }
    // 40 ticks x 1.5px = 60px of travel = 3-4 sixteen-pixel steps.
    expect(s.reads).toBeLessThanOrEqual(5);
    expect(s.reads).toBeGreaterThan(0);
  });

  it('a line that genuinely crosses the frame still resamples along the way', () => {
    stubCanvas();
    const s = new FrameSampler();
    s.setFrame(7);
    for (let x = 0; x <= 320; x += 16) {
      s.bandGrade('line-0', video, bg, { left: x, top: 300, width: 320, height: 90 });
    }
    // Moving a full 320px must not be silently served from one stale sample.
    expect(s.reads).toBeGreaterThanOrEqual(15);
  });

  it('keeps separate lines separate', () => {
    stubCanvas();
    const s = new FrameSampler();
    s.setFrame(3);
    const r: Rect = { left: 40, top: 300, width: 320, height: 90 };
    s.bandGrade('line-0', video, bg, r);
    s.bandGrade('line-1', video, bg, r);
    s.bandGrade('line-0', video, bg, r);
    expect(s.reads).toBe(2);
  });

  it('the whole intro costs readbacks in proportion to film frames, not ticks', () => {
    stubCanvas();
    const s = new FrameSampler();
    // 6 seconds of intro: 144 video frames at 24fps, 360 ticks at 60Hz, one
    // lit line sliding the width of the hero across the whole wipe.
    let frame = -1;
    for (let tick = 0; tick < 360; tick++) {
      const f = Math.floor(tick / 2.5);
      if (f !== frame) { frame = f; s.setFrame(f); }
      s.bandGrade('line-0', video, bg, {
        left: (tick / 360) * 900, top: 300, width: 320, height: 90,
      });
    }
    // Two costs, and only one of them is avoidable. The floor is one readback
    // per video frame (144) because the cache is invalidated when the picture
    // changes -- that is the sampler doing its job. On top sit the crossings of
    // the 16px grid as the line travels 900px, ~56 of them, some landing on a
    // frame change and so already paid for. 178 total.
    //
    // What matters is the comparison with the tick count: keyed to the pixel
    // this was 360, one for every animation frame, which is the stutter.
    expect(s.reads).toBeGreaterThanOrEqual(144); // cannot beat one per picture
    expect(s.reads).toBeLessThan(360 * 0.6); // and nowhere near one per tick
  });
});
