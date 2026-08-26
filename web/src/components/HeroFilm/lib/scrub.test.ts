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
  decideScrub,
  lerpToward,
  scrubEpsilon,
  type ScrubCommand,
  type ScrubInput,
} from './scrub';

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
    const cmd = decideScrub(state({ want: 10, current: 10, currentTime: 10.02 }));
    expect(isSeek(cmd)).toBe(true);
  });

  it('is 8ms on desktop and 20ms on mobile', () => {
    expect(scrubEpsilon(false)).toBe(0.008);
    expect(scrubEpsilon(true)).toBe(0.02);
    expect(DEFAULT_SCRUB.epsilonDesktop).toBeLessThan(DEFAULT_SCRUB.epsilonMobile);
  });

  it('lets mobile absorb an error desktop would correct', () => {
    // 12ms out: over the desktop deadband, under the mobile one.
    const drift = { want: 10, current: 10, currentTime: 10.012 };
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
    expect(long.currentTime).toBeCloseTo(10.5, 2);
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

  it('never yanks the decoder back more than one 60fps frame', () => {
    // The end-to-end version of the above, through the real policy. Raw, this
    // input would send the decoder 500ms backwards six times — six keyframe
    // hunts, in an input that is really just one steady forward scroll with
    // wheel noise on it.
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
    expect(worstBack).toBeLessThan(1 / 60);
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

  it('still reaches the last 12fps source frame despite that ceiling', () => {
    // The closing beauty frame starts at DUR - 1/12. The ceiling must not
    // stop short of it or the film has no payoff.
    expect(DEFAULT_SCRUB.ceiling * DUR).toBeGreaterThan(DUR - 1 / 12);
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
