/**
 * HERO FILM — disciplined-seek scrub tests.
 *
 * These cover the three behaviours that were the whole reason for porting
 * VDM Digital's engine, and all three fail SILENTLY. A controller that queues
 * seeks just feels like the judder it replaced; a missing deadband burns the
 * decoder on corrections nobody can see; a missing lerp feeds raw wheel
 * notches to a hardware decoder. None of it throws, so it gets tested.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SCRUB,
  SRC_FRAME,
  decideScrub,
  lerpToward,
  scrubEpsilon,
  type ScrubCommand,
  type ScrubInput,
} from './scrub';
import { FPS, SRCFPS } from './constants';

const DUR = 44.25;

/** A settled, caught-up, desktop element. Override one field per test. */
function state(over: Partial<ScrubInput> = {}): ScrubInput {
  return {
    want: 10,
    current: 10,
    currentTime: 10,
    duration: DUR,
    readyState: 4,
    seeking: false,
    mobile: false,
    ...over,
  };
}

const isSeek = (c: ScrubCommand): c is Extract<ScrubCommand, { kind: 'seek' }> =>
  c.kind === 'seek';
const isHold = (c: ScrubCommand): c is Extract<ScrubCommand, { kind: 'hold' }> =>
  c.kind === 'hold';

describe('seek coalescing', () => {
  it('issues nothing at all while a seek is in flight', () => {
    // The single line this whole port exists for: `if (video.seeking) continue`.
    const cmd = decideScrub(state({ want: 30, current: 10, currentTime: 10, seeking: true }));
    expect(cmd.kind).toBe('idle');
  });

  it('does not queue: a second seek is never issued behind the first', () => {
    // Drive twelve animation frames with the decoder stuck on one seek. The
    // old module re-fired from `seeked` and built a backlog; this must emit
    // exactly zero commands until the element stops seeking.
    let seeks = 0;
    for (let i = 0; i < 12; i++) {
      const cmd = decideScrub(
        state({ want: 10 + i * 0.4, current: 10, currentTime: 10, seeking: true }),
      );
      if (cmd.kind === 'seek') seeks++;
    }
    expect(seeks).toBe(0);
  });

  it('freezes the chase while seeking, so it cannot run ahead of the decoder', () => {
    // `idle` deliberately carries no `current`: the caller keeps the value it
    // had. Advancing it here would aim the next seek at a place the scroll has
    // already left, which immediately needs another seek.
    const cmd = decideScrub(state({ want: 40, current: 10, currentTime: 10, seeking: true }));
    expect(cmd).toEqual({ kind: 'idle' });
  });

  it('resumes with exactly one seek the frame the element stops seeking', () => {
    const cmd = decideScrub(state({ want: 30, current: 10, currentTime: 10, seeking: false }));
    expect(isSeek(cmd)).toBe(true);
  });
});

describe('the epsilon deadband', () => {
  it('does not seek for an error inside the deadband', () => {
    // Chase already parked on the element: nothing to correct.
    const cmd = decideScrub(state({ want: 10, current: 10, currentTime: 10.004 }));
    expect(cmd.kind).toBe('hold');
  });

  it('seeks once the error clears the deadband', () => {
    const out = 10 + DEFAULT_SCRUB.epsilonDesktop * 1.5;
    const cmd = decideScrub(state({ want: 10, current: 10, currentTime: out }));
    expect(isSeek(cmd)).toBe(true);
  });

  it('is derived from the SOURCE frame duration, not from a written-down ms', () => {
    // The whole retune in one assertion. The masters are 24fps, so a frame is
    // 41.7ms; the VDM reference's 8ms / 20ms were its own clips' numbers and
    // are not transferable.
    expect(SRC_FRAME).toBeCloseTo(1 / 24, 12);
    expect(SRC_FRAME).toBe(1 / FPS);
    expect(scrubEpsilon(false)).toBe(SRC_FRAME / 2);
    expect(scrubEpsilon(true)).toBe(SRC_FRAME);
    expect(DEFAULT_SCRUB.epsilonDesktop).toBeLessThan(DEFAULT_SCRUB.epsilonMobile);
  });

  it('is never tighter than half a source frame, on either device', () => {
    // THE FLOOR, and the reason this test exists. It is a cost argument, not
    // a proof of "same picture" — see the block above DEFAULT_SCRUB for why
    // the symmetric version of that claim does not hold. From a frame-start
    // `currentTime` every FORWARD target inside half a frame is the picture
    // already on screen, so a tighter band buys decodes and nothing else; and
    // it does not buy freshness either, because the backward exposure stays
    // one frame however narrow the band gets. At the old 8ms desktop value
    // that was five wasted seeks per presented picture, for the same
    // worst-case staleness.
    const half = SRC_FRAME / 2;
    expect(DEFAULT_SCRUB.epsilonDesktop).toBeGreaterThanOrEqual(half);
    expect(DEFAULT_SCRUB.epsilonMobile).toBeGreaterThanOrEqual(half);
    expect(scrubEpsilon(false)).toBeGreaterThanOrEqual(half);
    expect(scrubEpsilon(true)).toBeGreaterThanOrEqual(half);
  });

  it('never lets either device rest more than a whole source frame out', () => {
    // THE CAP, and what actually bounds the staleness. A band of one source
    // frame can hold a target that belongs to the immediate neighbour; a band
    // any wider could hold one two frames away. One frame is the promise.
    expect(DEFAULT_SCRUB.epsilonDesktop).toBeLessThanOrEqual(SRC_FRAME);
    expect(DEFAULT_SCRUB.epsilonMobile).toBeLessThanOrEqual(SRC_FRAME);
  });

  it('holds inside the deadband on EITHER side of the target', () => {
    // Sweep the whole sub-half-frame range rather than asserting one sample,
    // and sweep it in both directions: the band is symmetric about
    // `currentTime` (`Math.abs`), so an element sitting BEHIND the target has
    // to be exercised too. It used to only ever be driven ahead of it, which
    // is the half of the range where the deadband is cheapest to defend.
    //
    // Stepped as n/20 rather than by adding 0.05, so the last k is 0.45 and
    // not 0.49999999999999994 — which rounds up onto the boundary itself.
    for (let n = 1; n <= 9; n++) {
      const k = n / 20;
      for (const dir of [1, -1]) {
        const drift = { want: 10, current: 10, currentTime: 10 + dir * SRC_FRAME * k };
        const at = `k=${dir * k}`;
        expect(decideScrub(state({ ...drift, mobile: false })).kind, at).toBe('hold');
        expect(decideScrub(state({ ...drift, mobile: true })).kind, at).toBe('hold');
      }
    }
  });

  it('is one source frame stale at worst, and that worst case is BACKWARD', () => {
    // The asymmetric case the symmetry argument misses, pinned so the comment
    // above DEFAULT_SCRUB cannot drift back into claiming zero staleness.
    //
    // `currentTime` is not a frame midpoint. Firefox and Safari snap a landed
    // seek to the frame's START, so take the honest case: the element sits on
    // frame 240's start (exactly 10.0s) and the chase asks for a time just
    // inside the band behind it. That target belongs to frame 239 — a
    // different picture — and the deadband holds anyway.
    const frameStart = 240 * SRC_FRAME;
    const frameOf = (t: number) => Math.floor(t / SRC_FRAME);
    expect(frameOf(frameStart)).toBe(240);

    for (const mobile of [false, true]) {
      const eps = scrubEpsilon(mobile);
      const behind = frameStart - eps * 0.999;
      const dev = 'mobile=' + mobile;

      const cmd = decideScrub(
        state({ want: behind, current: behind, currentTime: frameStart, mobile }),
      );
      expect(cmd.kind, dev).toBe('hold');
      // A DIFFERENT frame is being refused — not the one on screen…
      expect(frameOf(behind), dev).not.toBe(240);
      // …but never more than one frame away, on either device. That is the
      // whole promise, and it is what the SRC_FRAME cap above buys.
      expect(240 - frameOf(behind), dev).toBe(1);

      // Clear the band and it is fetched, same as forward.
      const further = frameStart - eps * 1.001;
      expect(
        decideScrub(state({ want: further, current: further, currentTime: frameStart, mobile })).kind,
        dev,
      ).toBe('seek');
    }
  });

  it('lets mobile absorb an error desktop would correct', () => {
    // 0.6 of a source frame out: over the desktop deadband (half a frame),
    // under the mobile one (a whole frame).
    const drift = { want: 10, current: 10, currentTime: 10 + SRC_FRAME * 0.6 };
    expect(decideScrub(state({ ...drift, mobile: false })).kind).toBe('seek');
    expect(decideScrub(state({ ...drift, mobile: true })).kind).toBe('hold');
  });

  it('bounds the seeks on a held scroll by convergence, not by frame count', () => {
    // The old module seeked on every changed 1/60th frame index, so parking
    // the scroll 0.5s away from the film still cost a seek per animation
    // frame, forever. Here the chase converges geometrically and the deadband
    // then swallows everything: the seek count is a function of the GAP, not
    // of how long the visitor sits there.
    const run = (frames: number) => {
      let current = 10;
      let currentTime = 10;
      let seeks = 0;
      for (let i = 0; i < frames; i++) {
        const cmd = decideScrub(state({ want: 10.5, current, currentTime }));
        if (cmd.kind === 'idle') continue;
        current = cmd.current;
        if (isSeek(cmd)) {
          seeks++;
          currentTime = cmd.time;
        }
      }
      return { seeks, currentTime };
    };

    const short = run(30);
    const long = run(600);
    expect(short.seeks).toBeGreaterThan(0);
    // Twenty times the frames, and not one extra seek.
    expect(long.seeks).toBe(short.seeks);
    expect(long.seeks).toBeLessThan(20);
    // It settles inside the deadband, which is the only accuracy the scrub
    // ever promises: within half a source frame of the demand, i.e. the
    // picture on screen is that frame or the one before it.
    expect(10.5 - long.currentTime).toBeGreaterThanOrEqual(0);
    expect(10.5 - long.currentTime).toBeLessThanOrEqual(DEFAULT_SCRUB.epsilonDesktop);
  });
});

describe('the target lerp', () => {
  it('closes 20% of the remaining gap per animation frame', () => {
    expect(lerpToward(0, 1, 0.2)).toBeCloseTo(0.2, 10);
    expect(lerpToward(0.2, 1, 0.2)).toBeCloseTo(0.36, 10);
    expect(DEFAULT_SCRUB.lerp).toBe(0.2);
  });

  it('snaps onto the target when there is no chase yet', () => {
    expect(lerpToward(Number.NaN, 7, 0.2)).toBe(7);
    const cmd = decideScrub(state({ want: 20, current: Number.NaN, currentTime: 0 }));
    expect(isSeek(cmd) && cmd.current).toBe(20);
  });

  it('seeks toward the LERPED value, not the raw scroll demand', () => {
    // 10 -> 20 is a 10s jump. One frame of chase must land at 12, not 20.
    const cmd = decideScrub(state({ want: 20, current: 10, currentTime: 10 }));
    expect(isSeek(cmd)).toBe(true);
    if (!isSeek(cmd)) return;
    expect(cmd.current).toBeCloseTo(12, 10);
    expect(cmd.time).toBeCloseTo(12, 10);
  });

  it('converges on the demand instead of oscillating around it', () => {
    let current = 0;
    for (let i = 0; i < 60; i++) {
      const cmd = decideScrub(state({ want: 5, current, currentTime: current }));
      if (cmd.kind !== 'idle') current = cmd.current;
    }
    // 0.8^60 of the original 5s gap. It approaches from below and never
    // crosses over, which is what "no oscillation" means here.
    expect(current).toBeLessThan(5);
    expect(current).toBeCloseTo(5, 4);
  });

  it('collapses a spiky scroll to inside the deadband', () => {
    // Alternating wheel notches around a rising mean. A lerp is a low-pass
    // filter: it does not remove the direction changes, it removes their
    // AMPLITUDE — and once the backward swing is smaller than the deadband,
    // no seek is issued for it at all. That is the property that matters, so
    // it is the one asserted; counting sign flips would pass on a filter that
    // still yanked the decoder half a second backwards.
    const raw = [10, 10.6, 10.1, 10.7, 10.2, 10.8, 10.3, 10.9];

    const backSteps = (xs: number[]) => {
      const out: number[] = [];
      for (let i = 1; i < xs.length; i++) {
        if (xs[i] < xs[i - 1]) out.push(xs[i - 1] - xs[i]);
      }
      return out;
    };

    let current = 10;
    const chased: number[] = [];
    for (const want of raw) {
      current = lerpToward(current, want, DEFAULT_SCRUB.lerp);
      chased.push(current);
    }

    const rawBack = Math.max(...backSteps(raw));
    const chasedBack = Math.max(...backSteps(chased));
    expect(rawBack).toBeGreaterThan(0.4);
    // Fifty-fold. Not zero — a low-pass filter attenuates a reversal, it does
    // not abolish it — but small enough that mobile deadbands it away outright
    // and desktop pays at most one 8ms correction for it.
    expect(chasedBack).toBeLessThan(rawBack / 50);
    expect(chasedBack).toBeLessThan(DEFAULT_SCRUB.epsilonMobile);
  });

  it('never yanks the decoder backwards at all on a spiky forward scroll', () => {
    // The end-to-end version of the above, through the real policy. Raw, this
    // input would send the decoder 500ms backwards six times — six keyframe
    // hunts, in an input that is really just one steady forward scroll with
    // wheel noise on it.
    //
    // It used to assert "less than one 60fps frame". At a frame-derived
    // deadband the answer is stronger and exactly zero: the lerp attenuates
    // every reversal to under half a source frame and the deadband then
    // refuses to issue a seek for any of them, so not one backward seek is
    // emitted.
    const raw = [10, 10.6, 10.1, 10.7, 10.2, 10.8, 10.3, 10.9];
    let current = 10;
    let currentTime = 10;
    let worstBack = 0;
    for (const want of raw) {
      const cmd = decideScrub(state({ want, current, currentTime }));
      if (cmd.kind === 'idle') continue;
      current = cmd.current;
      if (isSeek(cmd)) {
        if (cmd.time < currentTime) {
          worstBack = Math.max(worstBack, currentTime - cmd.time);
        }
        currentTime = cmd.time;
      }
    }
    expect(worstBack).toBe(0);
    expect(currentTime).toBeGreaterThan(10.3);
  });
});

describe('guards', () => {
  it('does nothing before a frame has been decoded', () => {
    expect(decideScrub(state({ readyState: 1, want: 20, currentTime: 0 })).kind).toBe('idle');
  });

  it('does nothing before the duration is known', () => {
    for (const duration of [Number.NaN, Number.POSITIVE_INFINITY, 0]) {
      expect(decideScrub(state({ duration, want: 20, currentTime: 0 })).kind).toBe('idle');
    }
  });

  it('never addresses a time at or past the duration', () => {
    // Seeking to `duration` drops the element into its ended state, from which
    // play() restarts at zero — the viewer would be thrown back to the quarry.
    const cmd = decideScrub(state({ want: 1e9, current: 1e9, currentTime: 0 }));
    expect(isSeek(cmd)).toBe(true);
    if (!isSeek(cmd)) return;
    expect(cmd.time).toBeLessThan(DUR);
    expect(cmd.time).toBeCloseTo(DEFAULT_SCRUB.ceiling * DUR, 10);
  });

  it('still reaches the last SOURCE frame despite that ceiling', () => {
    // The closing beauty frame is source frame 1061 of 1062 and starts at
    // DUR - 1/24 = 44.2083. The ceiling must not stop short of it or the film
    // has no payoff.
    //
    // This is where the frame rate correction bit hardest and most quietly.
    // The old ceiling of 0.999 was chosen against a believed 12fps source —
    // an 83ms last frame starting at 44.1667, which 44.2058 clears easily. The
    // real source is 24fps and its last frame starts 25ms later than that, so
    // 0.999 addressed frame 1060 and the closing frame was unreachable by
    // scrubbing. Nothing threw; you simply never saw the last frame until the
    // lock-at-end `snap()` put it there.
    const lastFrameStart = DUR - 1 / FPS;
    expect(DEFAULT_SCRUB.ceiling * DUR).toBeGreaterThanOrEqual(lastFrameStart);
    expect(Math.floor(DEFAULT_SCRUB.ceiling * DUR * FPS)).toBe(Math.round(DUR * FPS) - 1);
    // …and 0.999 would not, which is the regression this pins.
    expect(0.999 * DUR).toBeLessThan(lastFrameStart);
  });

  it('leaves the rAF loop able to park at the end of the film', () => {
    // useHeroFilm.ts keeps ticking while |want - currentTime| > 1 / SRCFPS.
    // At film progress 1 `want` is `dur`, but the scrub can only address
    // `ceiling * dur`, and the deadband lets the element rest one epsilon
    // short of that. If the sum of those two residues exceeds the slop, the
    // loop never parks, `armSettle()` is never reached from the tick and the
    // film's lock-at-end depends entirely on the scroll handler's copy of it.
    //
    // Nothing about that failure is visible in a screenshot, so it is pinned
    // here rather than discovered on a phone.
    const residue = (1 - DEFAULT_SCRUB.ceiling) * DUR + DEFAULT_SCRUB.epsilonMobile;
    expect(residue).toBeLessThan(1 / SRCFPS);
    // The old pairing — a 0.999 ceiling with a whole-source-frame deadband —
    // is exactly the combination that does not park.
    expect(0.001 * DUR + SRC_FRAME).toBeGreaterThan(1 / SRCFPS);
  });

  it('empirically rests inside that slop from any approach', () => {
    // The bound above is an inequality on constants; this drives the real
    // policy to film progress 1 from a fine sweep of starting positions and
    // checks where it actually comes to rest. The staircase phase is what
    // decides the residue, so one starting point proves nothing.
    const C = DEFAULT_SCRUB.ceiling * DUR;
    let worst = 0;
    for (let k = 0; k < 400; k++) {
      const start = C - 0.3 * (k / 400);
      let current = start;
      let currentTime = start;
      for (let i = 0; i < 400; i++) {
        const cmd = decideScrub(
          state({ want: DUR, current, currentTime, mobile: true }),
        );
        if (cmd.kind === 'idle') continue;
        current = cmd.current;
        if (isSeek(cmd)) currentTime = cmd.time;
      }
      worst = Math.max(worst, DUR - currentTime);
    }
    expect(worst).toBeLessThan(1 / SRCFPS);
  });

  it('never addresses a negative time', () => {
    const cmd = decideScrub(state({ want: -50, current: -50, currentTime: 10 }));
    expect(isSeek(cmd) && cmd.time).toBe(0);
  });
});

describe('the whole point: a steady scroll must not build a backlog', () => {
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  /**
   * Model decoder: every seek takes `landIn` animation frames to land, and
   * `seeking` is true throughout — which is exactly the condition the
   * coalescing guard reads.
   */
  function scrub(frames: number, landIn: number, vel = 1.5) {
    const dt = 1 / 60;
    let current = Number.NaN;
    let currentTime = 0;
    let seeking = false;
    let left = 0;
    let pending = 0;
    let seeks = 0;
    let seeksWhileSeeking = 0;
    const lagAt: number[] = [];

    for (let i = 0; i < frames; i++) {
      if (seeking && --left <= 0) {
        seeking = false;
        currentTime = pending;
      }
      const want = i * dt * vel;
      const cmd = decideScrub(state({ want, current, currentTime, seeking }));
      if (cmd.kind === 'seek') {
        if (seeking) seeksWhileSeeking++;
        seeks++;
        seeking = true;
        left = landIn;
        pending = cmd.time;
        current = cmd.current;
      } else if (isHold(cmd)) {
        current = cmd.current;
      }
      lagAt.push(want - currentTime);
    }
    return { seeks, seeksWhileSeeking, lagAt, currentTime };
  }

  it('never issues a seek while one is outstanding', () => {
    for (const landIn of [1, 3, 8]) {
      expect(scrub(240, landIn).seeksWhileSeeking, 'landIn=' + landIn).toBe(0);
    }
  });

  it('costs far fewer seeks than animation frames', () => {
    const { seeks } = scrub(240, 3);
    expect(seeks).toBeGreaterThan(10);
    expect(seeks).toBeLessThanOrEqual(240 / 3);
  });

  it('holds a STANDING lag rather than accumulating a growing one', () => {
    // This is the difference between the two failure modes. The old queued
    // scrub fell further behind the longer you scrolled, because every landed
    // seek immediately fired the next one at a place the scroll had already
    // left. A lerp against a moving target has a fixed steady-state lag —
    // (1-k)/k frames of demand, stretched by the decoder's own latency — and
    // it does not grow.
    //
    // Compared as window MEANS, not as two instants: the lag sawtooths within
    // every seek cycle (it climbs while the seek is in flight and drops when
    // it lands), so two single samples can differ by a whole cycle's worth
    // while the film is behaving perfectly.
    const { lagAt } = scrub(600, 3);
    expect(mean(lagAt.slice(560, 600))).toBeGreaterThan(0);
    expect(
      Math.abs(mean(lagAt.slice(560, 600)) - mean(lagAt.slice(100, 140))),
    ).toBeLessThan(0.05);
  });

  it('keeps that standing lag under half a second at a brisk scroll', () => {
    // ~0.375s at 1.5x with a three-frame decoder. It is a lag between the
    // scroll and the picture, not between the picture and the copy: every
    // visible output is composed from the film's ACTUAL presented time, so
    // the story beats stay welded to the frames they were tuned against.
    const { lagAt } = scrub(240, 3);
    expect(Math.max(...lagAt.slice(60))).toBeLessThan(0.5);
  });

  it('stays bounded even against a decoder eight frames slow', () => {
    // A slow decoder costs more lag, but still a BOUNDED one — the chase is
    // frozen while seeking, so it cannot run away and leave a backlog behind.
    // This is the case that broke the old module: there, a slow decoder and a
    // fast scroll compounded.
    const slow = scrub(600, 8);
    expect(slow.seeksWhileSeeking).toBe(0);
    expect(
      Math.abs(mean(slow.lagAt.slice(560, 600)) - mean(slow.lagAt.slice(260, 300))),
    ).toBeLessThan(0.05);
  });
});
