/**
 * HERO FILM — rate controller tests.
 *
 * This is the fix that replaced per-frame `currentTime` seeks with forward
 * playback, and it is the one piece of the film whose failure modes are all
 * silent: a controller that seeks too often just feels like the old judder, a
 * controller that plays an ended element rewinds the film to the quarry, a
 * controller that asks past the last frame drops the page into the ended state
 * and never comes back. None of that throws. So it gets tested.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TRANSPORT,
  chaseRate,
  decideTransport,
  frameFor,
  frameTime,
  lastFrameIndex,
  type TransportCommand,
  type TransportInput,
} from './transport';
import { FPS } from './constants';

const DUR = 44.25;
/** The lattice under test is the config's, which is the SOURCE rate. */
const F = DEFAULT_TRANSPORT.fps;

/** A settled, playing, caught-up element. Override one field per test. */
function state(over: Partial<TransportInput> = {}): TransportInput {
  return {
    want: 10,
    wantVel: 0,
    currentTime: 10,
    duration: DUR,
    readyState: 4,
    paused: false,
    seeking: false,
    ended: false,
    now: 1000,
    lastSeekAt: 0,
    lastSeekFrame: -1,
    ...over,
  };
}

const isRate = (c: TransportCommand): c is Extract<TransportCommand, { kind: 'rate' }> =>
  c.kind === 'rate';
const isSeek = (c: TransportCommand): c is Extract<TransportCommand, { kind: 'seek' }> =>
  c.kind === 'seek';

describe('frame arithmetic', () => {
  it('quantises onto the SOURCE lattice, not a 60fps one', () => {
    // Both masters are 24fps / 1062 frames / 44.25s. The lattice has to be
    // the source's or the mid-frame sampling below is sampling the midpoint
    // of nothing.
    expect(F).toBe(FPS);
    expect(F).toBe(24);
    expect(lastFrameIndex(DUR, F)).toBe(1061);
    expect(Math.round(DUR * F)).toBe(1062);
  });

  it('never addresses a frame at or past the duration', () => {
    const last = lastFrameIndex(DUR, F);
    expect(last).toBe(Math.round(DUR * F) - 1);
    expect(frameTime(last, F)).toBeLessThan(DUR);
    // It stops exactly half a source frame short — the midpoint of the last
    // frame — where the old 1/60 lattice left only 8.3ms. Asserted as a ratio
    // against the old lattice rather than as `> 1 / (2 * F)`, which is the
    // value itself and would be decided by floating point.
    const headroom = DUR - frameTime(last, F);
    expect(headroom).toBeCloseTo(1 / (2 * F), 12);
    expect(headroom).toBeGreaterThan(DUR - frameTime(lastFrameIndex(DUR, 60), 60));
  });

  it('samples mid-frame, so a rounding wobble cannot pick the neighbour', () => {
    expect(frameTime(0, F)).toBeCloseTo(0.5 / F, 10);
    expect(frameTime(119, F)).toBeCloseTo(119.5 / F, 10);
  });

  it('puts every lattice point strictly inside a source frame', () => {
    // The reason the lattice must equal the source rate. On the old 1/60 grid
    // against this 24fps master, f = 2 resolved to 2.5/60 = 1/24 EXACTLY —
    // the boundary between source frames 0 and 1, where floating point picks
    // the picture. The `+ 0.5` only buys anything when the grid is the film's.
    for (let f = 0; f <= lastFrameIndex(DUR, F); f += 7) {
      const offset = frameTime(f, F) * FPS - f;
      expect(offset).toBeGreaterThan(0.05);
      expect(offset).toBeLessThan(0.95);
    }
    // The counter-example, spelled out so nobody re-introduces it.
    expect(frameTime(2, 60) * FPS).toBeCloseTo(1, 12);
  });

  it('clamps into range and survives nonsense', () => {
    const last = lastFrameIndex(DUR, F);
    expect(frameFor(-5, F, last)).toBe(0);
    expect(frameFor(1e9, F, last)).toBe(last);
    expect(frameFor(Number.NaN, F, last)).toBe(0);
  });

  it('reports frame 0 when the duration is not known yet', () => {
    expect(lastFrameIndex(Number.NaN, F)).toBe(0);
    expect(lastFrameIndex(Number.POSITIVE_INFINITY, F)).toBe(0);
    expect(lastFrameIndex(0, F)).toBe(0);
  });
});

describe('chaseRate', () => {
  it('is the feed-forward velocity plus the proportional correction', () => {
    // The feed-forward term is what removes the ~1.8s of standing lag a plain
    // proportional chase leaves behind, so it must be additive, not a factor.
    expect(chaseRate(0.5, 2)).toBeCloseTo(2 + 1.6 * 0.5, 10);
  });

  it('never exceeds the ceiling', () => {
    expect(chaseRate(100, 100)).toBe(DEFAULT_TRANSPORT.rateMax);
  });

  it('collapses a negligible demand to zero rather than crawling', () => {
    // Below rateMin the element is paused instead: asking a decoder for 0.01x
    // is worse than asking it for nothing.
    expect(chaseRate(0.001, 0)).toBe(0);
    expect(chaseRate(-1, 0)).toBe(0);
  });
});

describe('decideTransport — chasing', () => {
  it('plays forward, faster than real time, when the film is behind', () => {
    const cmd = decideTransport(state({ want: 11, currentTime: 10, wantVel: 1.2 }));
    expect(isRate(cmd)).toBe(true);
    if (!isRate(cmd)) return;
    expect(cmd.rate).toBeCloseTo(1.2 + 1.6 * 1, 10);
    expect(cmd.rate).toBeGreaterThan(1);
  });

  it('asks the caller to play() only when the element is paused', () => {
    const behind = { want: 11, currentTime: 10, wantVel: 1 };
    const a = decideTransport(state({ ...behind, paused: true }));
    const b = decideTransport(state({ ...behind, paused: false }));
    expect(isRate(a) && a.play).toBe(true);
    expect(isRate(b) && b.play).toBe(false);
  });

  it('does not seek for an error a fast-forward can absorb', () => {
    // 2.0s behind is inside jumpAhead (2.2): rate, not seek.
    const cmd = decideTransport(state({ want: 12, currentTime: 10, wantVel: 0 }));
    expect(cmd.kind).toBe('rate');
  });

  it('caps the rate rather than fast-forwarding at an unusable speed', () => {
    const cmd = decideTransport(state({ want: 12.1, currentTime: 10, wantVel: 40 }));
    expect(isRate(cmd) && cmd.rate).toBe(DEFAULT_TRANSPORT.rateMax);
  });
});

describe('decideTransport — caught up', () => {
  it('pauses when the film has arrived', () => {
    expect(decideTransport(state({ want: 10, currentTime: 10 })).kind).toBe('pause');
  });

  it('stays quiet once already paused — no redundant pause every frame', () => {
    expect(decideTransport(state({ want: 10, currentTime: 10, paused: true })).kind).toBe(
      'idle',
    );
  });

  it('pauses rather than seeking back over a small forward overshoot', () => {
    // Forward play always overshoots a little; at 8x one animation frame is
    // ~133ms. Turning that into a seek is exactly the behaviour this
    // controller exists to remove.
    const cmd = decideTransport(state({ want: 10, currentTime: 10.13 }));
    expect(cmd.kind).toBe('pause');
  });
});

describe('decideTransport — the seek fallback', () => {
  it('seeks once when the user scrolls back, then dedupes', () => {
    const back = state({ want: 8, currentTime: 10 });
    const first = decideTransport(back);
    expect(isSeek(first)).toBe(true);
    if (!isSeek(first)) return;
    expect(first.time).toBeCloseTo(frameTime(frameFor(8, F, lastFrameIndex(DUR, F)), F), 10);

    // Same want, same frame: the controller must not re-issue the seek on the
    // next animation frame while the first one is still settling.
    const second = decideTransport({ ...back, lastSeekFrame: first.frame });
    expect(second.kind).toBe('idle');
  });

  it('seeks once when the film is far behind, then dedupes', () => {
    const far = state({ want: 30, currentTime: 10, wantVel: 3 });
    const first = decideTransport(far);
    expect(isSeek(first)).toBe(true);
    if (!isSeek(first)) return;
    expect(decideTransport({ ...far, lastSeekFrame: first.frame }).kind).toBe('idle');
  });

  it('never asks for a time at or past the real last frame', () => {
    const cmd = decideTransport(state({ want: 9_999, currentTime: 0 }));
    expect(isSeek(cmd)).toBe(true);
    if (!isSeek(cmd)) return;
    expect(cmd.frame).toBe(lastFrameIndex(DUR, F));
    expect(cmd.time).toBeLessThan(DUR);
  });

  it('leaves an in-flight seek alone inside the stall window', () => {
    const cmd = decideTransport(
      state({ want: 30, currentTime: 10, seeking: true, now: 1000, lastSeekAt: 900 }),
    );
    expect(cmd.kind).toBe('idle');
  });

  it('kicks the decoder when a seek hangs past the stall window', () => {
    const cmd = decideTransport(
      state({ want: 30, currentTime: 10, seeking: true, now: 1000, lastSeekAt: 800 }),
    );
    expect(cmd.kind).toBe('kick');
  });
});

describe('decideTransport — the end of the media', () => {
  it('never restarts an ended element', () => {
    // play() on an ended element rewinds it to zero. At the end of the film
    // that would drop the viewer back into the quarry with no way out.
    const cmd = decideTransport(
      state({ want: DUR, currentTime: DUR, ended: true, paused: true }),
    );
    expect(cmd.kind).toBe('idle');
  });

  it('never issues a rate command for an ended element, even if want is ahead', () => {
    const cmd = decideTransport(
      state({ want: DUR + 1, currentTime: DUR, ended: true, paused: true, wantVel: 2 }),
    );
    expect(cmd.kind).not.toBe('rate');
  });

  it('still seeks an ended element backwards when the user scrolls back', () => {
    const cmd = decideTransport(
      state({ want: 20, currentTime: DUR, ended: true, paused: true }),
    );
    expect(isSeek(cmd)).toBe(true);
  });
});

describe('decideTransport — guards', () => {
  it('does nothing before a frame has been decoded', () => {
    expect(decideTransport(state({ readyState: 1, want: 20, currentTime: 0 })).kind).toBe(
      'idle',
    );
  });

  it('does nothing before the duration is known', () => {
    for (const duration of [Number.NaN, Number.POSITIVE_INFINITY, 0]) {
      expect(decideTransport(state({ duration, want: 20, currentTime: 0 })).kind).toBe(
        'idle',
      );
    }
  });
});

describe('the whole point: a steady scroll should not seek', () => {
  it('issues zero seeks across a full forward scrub', () => {
    // Simulate 4 seconds of scrolling at 1.5x film speed, stepping the model
    // element forward by playbackRate x dt each animation frame — which is
    // what a decoder actually does.
    let currentTime = 0;
    let lastSeekFrame = -1;
    let seeks = 0;
    let rates = 0;
    const dt = 1 / 60;
    const vel = 1.5;

    for (let i = 0; i < 240; i++) {
      const want = i * dt * vel;
      const cmd = decideTransport(
        state({
          want,
          wantVel: vel,
          currentTime,
          paused: false,
          now: 1000 + i * 16.7,
          lastSeekFrame,
        }),
      );
      if (cmd.kind === 'seek') {
        seeks++;
        currentTime = cmd.time;
        lastSeekFrame = cmd.frame;
      } else if (cmd.kind === 'rate') {
        rates++;
        currentTime += cmd.rate * dt;
        lastSeekFrame = -1;
      }
    }

    expect(seeks).toBe(0);
    expect(rates).toBeGreaterThan(200);
    // And the feed-forward term should have kept it close, not 1.8s adrift.
    expect(Math.abs(currentTime - 239 * dt * vel)).toBeLessThan(0.2);
  });
});
