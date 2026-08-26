/**
 * HERO FILM — the frame sampler.  ** FIX #1 **
 *
 * ── the cost ────────────────────────────────────────────────────────────────
 * `grade()` and `bandGrade()` both work by drawing the <video> into a tiny
 * offscreen canvas and reading the pixels back. That readback is a GPU->CPU
 * sync: measured at ~8.3ms per call on the shipping asset. The legacy module
 * made up to four of them per animation frame — one nav grade plus one per
 * visible story line — which is 33ms of a 16.7ms budget spent looking at
 * pixels, every frame.
 *
 * ── the observation ─────────────────────────────────────────────────────────
 * The source film is 12fps. At 60 animation frames a second, at least four
 * consecutive frames sample the *same decoded video frame* and get, by
 * construction, the same answer. Nothing about the readback is per-animation-
 * frame; it is per-video-frame.
 *
 * ── the fix ─────────────────────────────────────────────────────────────────
 * Key a cache on the presented video frame (`requestVideoFrameCallback`'s
 * `presentedFrames`, falling back to a quantised `mediaTime`), and clear it
 * whenever a new frame is presented. Within one video frame every sample is a
 * map hit. That takes the worst case from ~60 readbacks a second per element
 * to ~12, and while the film is parked — which is most of the time, because
 * the transport pauses rather than seeks — to zero.
 *
 * The rect is part of the key as well: a resize changes the answer even though
 * the frame did not.
 */

import { navGradeFromLuma, bandGradeFromLuma, sortedLuma } from './outputs';
import { sampleRect } from './geometry';

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Grid the film is downsampled onto. 48 wide; height varies by consumer. */
/**
 * Position quantiser for the readback memo.
 *
 * The memo used to key on the rect rounded to ONE PIXEL, and that quietly
 * defeated the whole cache. A story line is in motion for the entire intro --
 * the wipe slides it, the clip-path uncovers it -- so its rect moved by more
 * than a pixel every tick, every key was a miss, and the readback ran on every
 * animation frame despite the cache. The symptom was exact: the film juddered
 * until the text overlay left the screen and went smooth the instant it did,
 * because that is when bandGrade() stops being called at all.
 *
 * QUANTISE_PX is one sample column. The readback lays a GRID_W x GRID_H grid
 * over the box, so for a hero line around 800px wide a column is ~16px; moving
 * the box less than that cannot change which pixels fall in which cell by more
 * than a rounding error, and the result is a luminance driving a glow, not
 * something anyone can see to the pixel. Fixed rather than derived from the
 * rect so that a changing width cannot change the step and reintroduce misses.
 */
const QUANTISE_PX = 16;

const quantise = (r: Rect): string =>
  Math.round(r.left / QUANTISE_PX) +
  ',' +
  Math.round(r.top / QUANTISE_PX) +
  ',' +
  Math.round(r.width / QUANTISE_PX) +
  ',' +
  Math.round(r.height / QUANTISE_PX);

const GRID_W = 48;
const GRID_H = 8;

export class FrameSampler {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  /** A 2D context that came back null once will come back null every time. */
  private noCanvas = false;
  /** Identity of the video frame the cache currently describes. */
  private frameKey = Number.NaN;
  private cache = new Map<string, number>();

  /** Readbacks actually performed. Exposed so a perf test can assert on it. */
  reads = 0;

  private context(): CanvasRenderingContext2D | null {
    if (this.ctx) return this.ctx;
    // Latched: without it a headless environment re-attempts the context on
    // every sample, which means a warning per element per frame.
    if (this.noCanvas || typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = GRID_W;
    c.height = GRID_H;
    // `willReadFrequently` moves the backing store to the CPU, which is the
    // whole point when every draw is followed by a getImageData.
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = c.getContext('2d', { willReadFrequently: true });
    } catch {
      ctx = null;
    }
    if (!ctx) {
      this.noCanvas = true;
      return null;
    }
    this.canvas = c;
    this.ctx = ctx;
    return ctx;
  }

  /**
   * Declare which video frame is on screen. Anything cached against a
   * different frame is stale and is dropped.
   */
  setFrame(key: number): void {
    if (key === this.frameKey) return;
    this.frameKey = key;
    this.cache.clear();
  }

  /** Drop everything — used on resize, band change and unmount. */
  invalidate(): void {
    this.frameKey = Number.NaN;
    this.cache.clear();
  }

  dispose(): void {
    this.invalidate();
    this.ctx = null;
    this.canvas = null;
    this.noCanvas = false;
  }

  /**
   * Draw `rect` (in viewport coordinates, over `bgRect`) into a
   * `GRID_W x gridH` cell and return the sorted luma of those cells.
   * `null` when the frame cannot be read — a tainted canvas, a decoder that
   * has not produced a frame, a zero-height rect.
   */
  private read(
    video: HTMLVideoElement,
    bgRect: Rect,
    rect: Rect,
    gridH: number,
  ): number[] | null {
    const ctx = this.context();
    if (!ctx) return null;
    if (!video.videoWidth || video.readyState < 2) return null;
    if (!bgRect.height || !rect.height) return null;

    const s = sampleRect({
      bgRect,
      rect,
      videoW: video.videoWidth,
      videoH: video.videoHeight,
    });

    try {
      ctx.clearRect(0, 0, GRID_W, GRID_H);
      ctx.drawImage(video, s.sx, s.sy, s.sw, s.sh, 0, 0, GRID_W, gridH);
    } catch {
      return null;
    }
    let data: Uint8ClampedArray;
    try {
      data = ctx.getImageData(0, 0, GRID_W, gridH).data;
    } catch {
      return null;
    }
    this.reads++;
    return sortedLuma(data, GRID_W * gridH);
  }

  private memo(id: string, rect: Rect, compute: () => number | null): number {
    const key = id + '|' + quantise(rect);
    const hit = this.cache.get(key);
    if (hit !== undefined) return hit;
    const v = compute();
    if (v === null) return -1; // not cached: the next frame may well succeed
    this.cache.set(key, v);
    return v;
  }

  /**
   * Nav grade — the top `barH` pixels of the film, 48x4 = 192 samples, the
   * 188th taken and floored at 0.20. Returns -1 when unreadable, matching the
   * legacy contract (the caller leaves `--navGrade` alone).
   */
  navGrade(video: HTMLVideoElement, bgRect: Rect, barH: number): number {
    const rect: Rect = {
      left: bgRect.left,
      top: bgRect.top,
      width: bgRect.width,
      height: barH,
    };
    return this.memo('nav', rect, () => {
      const sorted = this.read(video, bgRect, rect, 4);
      return sorted ? navGradeFromLuma(sorted) : null;
    });
  }

  /**
   * Band grade — one story line's own rect, 48x8 = 384 samples, the max taken
   * with no floor. Returns -1 when unreadable.
   */
  bandGrade(id: string, video: HTMLVideoElement, bgRect: Rect, rect: Rect): number {
    return this.memo(id, rect, () => {
      const sorted = this.read(video, bgRect, rect, GRID_H);
      return sorted ? bandGradeFromLuma(sorted) : null;
    });
  }
}
