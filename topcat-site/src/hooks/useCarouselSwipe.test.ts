import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  attachCarouselSwipe,
  WHEEL_HELIX,
  WHEEL_REVIEW_DECK,
  WHEEL_STONE_WHEEL,
} from './useCarouselSwipe';

/* ------------------------------------------------------------ helpers -- */

let el: HTMLDivElement;
let detach: () => void = () => {};
/** A hand-cranked clock, injected through `opts.now`, so the cooldown tests
 *  do not depend on wall time. */
let clock = 0;
const now = () => clock;

beforeEach(() => {
  clock = 0;
  el = document.createElement('div');
  document.body.appendChild(el);
  /* jsdom does not implement scrolling; the pointer engine's vertical fling
     calls window.scrollBy for real. */
  window.scrollBy = vi.fn();
});

afterEach(() => {
  detach();
  detach = () => {};
  el.remove();
  vi.restoreAllMocks();
});

function wheel(deltaX: number, deltaY = 0) {
  const e = new WheelEvent('wheel', { deltaX, deltaY, bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e;
}

function mouse(type: string, clientX: number, target: EventTarget = el) {
  const e = new MouseEvent(type, { clientX, clientY: 0, bubbles: true, cancelable: true, button: 0 });
  target.dispatchEvent(e);
  return e;
}

function touch(type: string, clientX: number) {
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'touches', { value: [{ clientX, clientY: 0 }] });
  el.dispatchEvent(e);
  return e;
}

/** jsdom has no PointerEvent constructor; a MouseEvent with the pointer
 *  fields defined on it is what the handlers actually read. */
function pointer(
  type: string,
  x: number,
  y: number,
  o: { id?: number; pointerType?: string; t?: number; target?: EventTarget } = {},
) {
  const e = new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  Object.defineProperty(e, 'pointerId', { value: o.id ?? 1 });
  Object.defineProperty(e, 'pointerType', { value: o.pointerType ?? 'touch' });
  if (o.t !== undefined) Object.defineProperty(e, 'timeStamp', { value: o.t });
  (o.target ?? el).dispatchEvent(e);
  return e;
}

/* ------------------------------------------------------- trackpad wheel -- */

describe('wheel — the trackpad path (site.js:1181-1191)', () => {
  it('fires one next step for a rightward flick past the threshold', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_STONE_WHEEL, now });

    const e = wheel(30);

    expect(onStep).toHaveBeenCalledTimes(1);
    expect(onStep).toHaveBeenCalledWith(1);
    /* The handler must be able to preventDefault, which is why it is bound
       {passive:false} and cannot be a React onWheel prop. */
    expect(e.defaultPrevented).toBe(true);
  });

  it('fires a prev step for a leftward flick', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_STONE_WHEEL, now });
    wheel(-30);
    expect(onStep).toHaveBeenCalledWith(-1);
  });

  it('the 2:1 axis gate ignores a vertical page scroll carrying deltaX jitter', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_STONE_WHEEL, now });

    /* |dx| 40 is well past the 24px threshold, but it is not 2x |dy|. */
    const e = wheel(40, 100);

    expect(onStep).not.toHaveBeenCalled();
    /* Crucially it must NOT preventDefault, or the page stops scrolling. */
    expect(e.defaultPrevented).toBe(false);
  });

  it('the gate lets a shallow-but-horizontal flick through at exactly 2:1', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_STONE_WHEEL, now });
    wheel(30, 15);
    expect(onStep).toHaveBeenCalledTimes(1);
  });

  it('accumulates: it needs more than 24px of deltaX, not one event', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_STONE_WHEEL, now });

    wheel(8);
    wheel(8);
    wheel(8); /* 24 exactly — the source tests > 24, so this is still short */
    expect(onStep).not.toHaveBeenCalled();

    wheel(1); /* 25 */
    expect(onStep).toHaveBeenCalledTimes(1);
    expect(onStep).toHaveBeenCalledWith(1);
  });

  it('the accumulator resets after a step, so 25px more is needed for the next', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_STONE_WHEEL, now });

    wheel(30);
    clock = 1000; /* past any cooldown */
    wheel(20);
    expect(onStep).toHaveBeenCalledTimes(1);
    wheel(20);
    expect(onStep).toHaveBeenCalledTimes(2);
  });

  it('the 260ms cooldown suppresses a second step from one long flick', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_STONE_WHEEL, now });

    wheel(30);
    expect(onStep).toHaveBeenCalledTimes(1);

    clock = 100;
    wheel(30);
    clock = 259;
    wheel(30);
    expect(onStep).toHaveBeenCalledTimes(1);

    clock = 260;
    wheel(1);
    expect(onStep).toHaveBeenCalledTimes(2);
  });

  it('the helix preset is the same gate and accumulator with a 300ms cooldown', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_HELIX, now });

    wheel(30);
    clock = 299;
    wheel(30);
    expect(onStep).toHaveBeenCalledTimes(1);
    clock = 300;
    wheel(1);
    expect(onStep).toHaveBeenCalledTimes(2);
  });

  it('the review deck preset rejects an exactly-diagonal delta (site.js:1822)', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_REVIEW_DECK, now });

    wheel(80, 80);
    expect(onStep).not.toHaveBeenCalled();
    wheel(80, 79);
    expect(onStep).toHaveBeenCalledTimes(1);
  });

  it('the review deck locks after one page until 140ms of quiet', () => {
    vi.useFakeTimers();
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, { onStep, wheel: WHEEL_REVIEW_DECK, now });

    wheel(70); /* > 60 */
    expect(onStep).toHaveBeenCalledTimes(1);

    /* A long flick keeps re-arming the quiet timer, so the lock holds. */
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(50);
      wheel(70);
    }
    expect(onStep).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(140);
    wheel(70);
    expect(onStep).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('the enabled gate is checked before the axis test and before preventDefault', () => {
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, {
      onStep,
      enabled: () => false,
      wheel: WHEEL_STONE_WHEEL,
      now,
    });

    const e = wheel(300);
    expect(onStep).not.toHaveBeenCalled();
    expect(e.defaultPrevented).toBe(false);
  });
});

/* ------------------------------------------------------------ raw drag -- */

describe("drag: 'raw' — the stone wheel / desktop helix bindings", () => {
  it('drags with the mouse and reports continuous deltas', () => {
    const onDragStart = vi.fn();
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();
    detach = attachCarouselSwipe(el, {
      drag: 'raw',
      dragClass: 'dragging',
      onDragStart,
      onDragMove,
      onDragEnd,
      now,
    });

    const down = mouse('mousedown', 100);
    expect(down.defaultPrevented).toBe(true);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(el.classList.contains('dragging')).toBe(true);

    mouse('mousemove', 130, window);
    mouse('mousemove', 160, window);
    expect(onDragMove.mock.calls).toEqual([[30], [60]]);

    mouse('mouseup', 160, window);
    expect(onDragEnd).toHaveBeenCalledWith(60, 0);
    expect(el.classList.contains('dragging')).toBe(false);
  });

  it('ends the drag when the mouse is released outside the element', () => {
    const onDragEnd = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'raw', onDragEnd, now });

    mouse('mousedown', 100);
    mouse('mousemove', 40, window);
    /* Released over the document, far from the carousel. */
    mouse('mouseup', 40, document.body);

    expect(onDragEnd).toHaveBeenCalledWith(-60, 0);
  });

  it('ignores a move that never had a press', () => {
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'raw', onDragMove, onDragEnd, now });

    mouse('mousemove', 500, window);
    mouse('mouseup', 500, window);

    expect(onDragMove).not.toHaveBeenCalled();
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('drags with a finger', () => {
    const onDragStart = vi.fn();
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'raw', onDragStart, onDragMove, onDragEnd, now });

    touch('touchstart', 200);
    touch('touchmove', 155);
    touch('touchmove', 120);
    touch('touchend', 120);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragMove.mock.calls).toEqual([[-45], [-80]]);
    expect(onDragEnd).toHaveBeenCalledWith(-80, 0);
  });

  it("preventDefaultMouseDown:'when-enabled' leaves a disabled mousedown alone", () => {
    detach = attachCarouselSwipe(el, {
      drag: 'raw',
      enabled: () => false,
      preventDefaultMouseDown: 'when-enabled',
      now,
    });
    expect(mouse('mousedown', 10).defaultPrevented).toBe(false);
  });

  it("preventDefaultMouseDown defaults to 'always', the stone wheel's oddity", () => {
    detach = attachCarouselSwipe(el, { drag: 'raw', enabled: () => false, now });
    /* site.js:1170 preventDefaults before pointerDown checks galleryOn. */
    expect(mouse('mousedown', 10).defaultPrevented).toBe(true);
  });

  it('detaching removes the window listeners', () => {
    const onDragMove = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'raw', onDragMove, now });
    mouse('mousedown', 100);
    detach();
    detach = () => {};
    mouse('mousemove', 200, window);
    expect(onDragMove).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------- pointer drag -- */

describe("drag: 'pointer' — the shared attachSwipe (site.js:4-81)", () => {
  it('needs 5px of slop before the axis locks, then reports deltas', () => {
    const onDragStart = vi.fn();
    const onDragMove = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'pointer', onDragStart, onDragMove, now });

    pointer('pointerdown', 100, 100, { t: 0 });
    pointer('pointermove', 104, 100, { t: 10, target: window }); /* inside slop */
    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDragMove).not.toHaveBeenCalled();

    pointer('pointermove', 140, 100, { t: 20, target: window });
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragMove).toHaveBeenCalledWith(40);
  });

  it('reports the release velocity so a flick can be told from a shove', () => {
    const onDragEnd = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'pointer', onDragEnd, now });

    pointer('pointerdown', 300, 100, { t: 0 });
    pointer('pointermove', 260, 100, { t: 16, target: window });
    pointer('pointermove', 220, 100, { t: 32, target: window });
    pointer('pointerup', 220, 100, { t: 40, target: window });

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    const [dx, vx] = onDragEnd.mock.calls[0];
    expect(dx).toBe(-80);
    /* Left-going drag: negative px/ms, from the 0.6/0.4 EMA at site.js:44. */
    expect(vx).toBeLessThan(0);
  });

  it('a vertical touch drag scrolls the page instead of turning the carousel', () => {
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'pointer', onDragMove, onDragEnd, now });

    pointer('pointerdown', 100, 300, { t: 0 });
    pointer('pointermove', 100, 240, { t: 16, target: window });
    pointer('pointerup', 100, 240, { t: 24, target: window });

    expect(onDragMove).not.toHaveBeenCalled();
    expect(onDragEnd).not.toHaveBeenCalled();
    expect(window.scrollBy).toHaveBeenCalledWith(0, 60);
  });

  it('the ignore predicate keeps a drag off an expanded review page', () => {
    const inner = document.createElement('div');
    inner.className = 'rev-page';
    el.appendChild(inner);

    const onDragStart = vi.fn();
    detach = attachCarouselSwipe(el, {
      drag: 'pointer',
      ignore: (t) => !!(t as Element)?.closest?.('.rev-page'),
      onDragStart,
      onDragMove: () => {},
      now,
    });

    pointer('pointerdown', 100, 100, { t: 0, target: inner });
    pointer('pointermove', 160, 100, { t: 16, target: window });
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('a right-button mouse press never starts a drag', () => {
    const onDragStart = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'pointer', onDragStart, now });

    const e = new MouseEvent('pointerdown', { clientX: 100, clientY: 100, bubbles: true, button: 2 });
    Object.defineProperty(e, 'pointerId', { value: 1 });
    Object.defineProperty(e, 'pointerType', { value: 'mouse' });
    el.dispatchEvent(e);
    pointer('pointermove', 200, 100, { t: 16, pointerType: 'mouse', target: window });

    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('a move from a different pointer id is ignored', () => {
    const onDragMove = vi.fn();
    detach = attachCarouselSwipe(el, { drag: 'pointer', onDragMove, now });

    pointer('pointerdown', 100, 100, { t: 0, id: 1 });
    pointer('pointermove', 200, 100, { t: 16, id: 9, target: window });
    expect(onDragMove).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------- both together -- */

describe('one element, drag and wheel together', () => {
  it('serves the stone wheel: continuous drag deltas plus discrete wheel steps', () => {
    const onDragMove = vi.fn();
    const onStep = vi.fn();
    detach = attachCarouselSwipe(el, {
      drag: 'raw',
      dragClass: 'dragging',
      onDragMove,
      onStep,
      wheel: WHEEL_STONE_WHEEL,
      now,
    });

    mouse('mousedown', 0);
    mouse('mousemove', 90, window);
    mouse('mouseup', 90, window);
    expect(onDragMove).toHaveBeenCalledWith(90);

    wheel(40);
    expect(onStep).toHaveBeenCalledWith(1);
  });

  it('a null element is a no-op, as site.js:5 is', () => {
    expect(() => attachCarouselSwipe(null, { drag: 'raw', wheel: WHEEL_STONE_WHEEL })()).not.toThrow();
  });
});
