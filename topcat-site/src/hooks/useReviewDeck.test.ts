import { createElement } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Reviews from '@/components/sections/Reviews';

/**
 * The three motion engines of the review deck, against the old build's own
 * numbers (assets/site.js:1727-1951).
 *
 * THE TRAP THIS FILE EXISTS TO AVOID: tests/setup.ts installs a NO-OP
 * IntersectionObserver, and useReviewDeck arms its first layout on an
 * observer. Under the no-op stub the deck is armed and never fires, every
 * card keeps its server-rendered inline style of nothing at all, and a test
 * that asserts "no transform yet" passes while testing absolutely nothing.
 * So this file installs a RECORDING observer and fires the callback by hand;
 * `enter()` below is the only way the deck ever lays out here.
 */

/* ------------------------------------------------------------ harness -- */

type IOEntryish = { isIntersecting: boolean; target: Element };
type IORecord = { cb: (e: IOEntryish[]) => void; els: Element[] };
let ioRecords: IORecord[] = [];
let realIO: typeof IntersectionObserver;

/** Every value jsdom reports as 0 falls through to the source's own
 *  fallbacks, so the layout is fully determined by innerWidth alone:
 *
 *    wide   deck 300x400, stage 520  -> GS 1, slots at -328 / 0 / +328
 *    solo   deck 480x320             -> GS 0.875, cellW 420, R 756.08, step 359
 */
const WIDE_SLOT = [-328, 0, 328];
const SOLO_R = 756.0824576595057;
const SOLO_STEP = 359;

function setWidth(w: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: w,
    configurable: true,
    writable: true,
  });
}

/** jsdom gives every element a zero rect; the entrance is driven entirely by
 *  `revStage.getBoundingClientRect().top`, so that one rect is stubbed. */
function setStageTop(top: number) {
  const stage = document.getElementById('revStage');
  if (!stage) throw new Error('no #revStage');
  stage.getBoundingClientRect = () =>
    ({ top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 }) as DOMRect;
}

/**
 * CSSOM normalises what it stores: `style.opacity = '0.000'` reads back as
 * '0'. The source writes toFixed(3) strings, so compare the NUMBER, not the
 * text — asserting the text is asserting jsdom's serialiser.
 */
function opacity(el: HTMLElement): number {
  return parseFloat(el.style.opacity);
}

function cards(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('#revDeck .rev'));
}

/**
 * Fire every armed IntersectionObserver with its OWN observed elements —
 * the deck's first layout, and `.rise`'s reveal along with it. Firing one
 * observer's callback with another's entries is how this harness first broke:
 * useReveal reads `e.target`.
 */
function enter() {
  act(() => {
    ioRecords.forEach((r) => {
      r.cb(r.els.map((target) => ({ isIntersecting: true, target })));
    });
  });
}

function scroll() {
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

/** jsdom has no PointerEvent constructor; a MouseEvent carrying the pointer
 *  fields is what the handlers actually read. */
function pointer(
  type: string,
  x: number,
  y: number,
  target: EventTarget,
  t?: number,
) {
  const e = new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  Object.defineProperty(e, 'pointerType', { value: 'touch' });
  /* The velocity EMA divides by max(1, dt); leave the timestamps alone and
     every drag is a 1ms flick, which pages on the flick test instead of the
     throw test. Hand the clock over explicitly. */
  if (t !== undefined) Object.defineProperty(e, 'timeStamp', { value: t });
  act(() => {
    target.dispatchEvent(e);
  });
  return e;
}

beforeEach(() => {
  vi.useFakeTimers();
  ioRecords = [];
  realIO = globalThis.IntersectionObserver;
  class RecordingIO {
    private rec: IORecord;
    constructor(cb: (e: IOEntryish[]) => void) {
      this.rec = { cb, els: [] };
      ioRecords.push(this.rec);
    }
    observe(el: Element) {
      this.rec.els.push(el);
    }
    unobserve(el: Element) {
      this.rec.els = this.rec.els.filter((e) => e !== el);
    }
    disconnect() {
      this.rec.els = [];
    }
    takeRecords() {
      return [];
    }
  }
  const ctor = RecordingIO as unknown as typeof IntersectionObserver;
  globalThis.IntersectionObserver = ctor;
  window.IntersectionObserver = ctor;
  window.scrollBy = vi.fn();
  Object.defineProperty(window, 'innerHeight', {
    value: 768,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  cleanup();
  globalThis.IntersectionObserver = realIO;
  window.IntersectionObserver = realIO;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* ============================================ 1. the wide entrance flip == */

describe('applyEntranceFlip — site.js:1900-1911', () => {
  beforeEach(() => setWidth(1400));

  it('parks the three visible cards face-down before the section is reached', () => {
    render(createElement(Reviews));
    setStageTop(800); // 1.04 viewports: past REV_ENTER_TOP (0.95), so p = 0
    enter();

    const c = cards();
    /* p=0 -> e=0 -> y=REV_FLIP_Y, rx=REV_FLIP_RX, sc=REV_FLIP_SC. */
    expect(c[0].style.transform).toBe(
      'perspective(1400px) translate3d(-328px,130.0px,0) rotateX(-88.0deg) scale(0.820)',
    );
    expect(c[1].style.transform).toContain('translate3d(0px,130.0px,0)');
    expect(c[2].style.transform).toContain('translate3d(328px,130.0px,0)');
    expect(opacity(c[0])).toBe(0);
    /* transition:none every frame — the flip is scroll position, not a
       transition, and a transition would fight it. */
    expect(c[0].style.transition).toBe('none');
    expect(c[0].style.pointerEvents).toBe('none');
  });

  it('parks every card outside the window of three at translate3d(0,60px,0) scale(0.9)', () => {
    render(createElement(Reviews));
    setStageTop(800);
    enter();

    const c = cards();
    for (const el of c.slice(3)) {
      expect(el.style.transform).toBe('translate3d(0,60px,0) scale(0.9)');
      expect(el.style.opacity).toBe('0');
      expect(el.style.zIndex).toBe('0');
    }
  });

  it('hinges the cards up on rotateX as the stage rises through the viewport', () => {
    render(createElement(Reviews));
    setStageTop(800);
    enter();

    /* Half way: top at 0.575 viewports -> p = 0.5 -> eOut(0.5) = 0.875, so
       rotateX is -88 * 0.125 = -11.0deg and the card is already opaque
       (opacity = e*1.6, clamped). */
    setStageTop(0.575 * 768);
    scroll();
    const c = cards();
    expect(c[0].style.transform).toContain('rotateX(-11.0deg)');
    expect(c[0].style.transform).toContain('scale(0.978)');
    expect(opacity(c[0])).toBe(1);
    /* Not yet clickable: the source only hands back pointer events past
       98% of the flip. */
    expect(c[0].style.pointerEvents).toBe('none');
  });

  it('settles to the flat rest layout once the stage passes REV_SETTLE_TOP', () => {
    render(createElement(Reviews));
    setStageTop(800);
    enter();
    setStageTop(0);
    scroll();

    const c = cards();
    WIDE_SLOT.forEach((x, k) => {
      expect(c[k].style.transform).toBe(`translate3d(${x}px,0,0) scale(1.000)`);
      expect(c[k].style.opacity).toBe('1');
      expect(c[k].style.pointerEvents).toBe('auto');
      expect(c[k].style.zIndex).toBe(String(5 - k));
    });
    /* At rest the cards get their transition back. */
    expect(c[0].style.transition).toBe(
      'transform .5s var(--ease),opacity .4s var(--ease)',
    );
  });

  it('is idempotent once settled — a further scroll does not re-place', () => {
    render(createElement(Reviews));
    setStageTop(0);
    enter();
    const c = cards();
    /* A marker CSSOM will actually keep — an unparseable transform is
       silently dropped, which is how this probe first lied. */
    c[0].style.zIndex = '99';
    scroll();
    /* revPhase is already 'settled', so desktopReviewScroll returns without
       touching the cards (site.js:1919). */
    expect(c[0].style.zIndex).toBe('99');
  });
});

/* ================================================== 2. the wide page turn = */

describe('shiftCards — site.js:1932-1951', () => {
  beforeEach(() => setWidth(1400));

  function settled() {
    render(createElement(Reviews));
    setStageTop(0);
    enter();
    return cards();
  }

  it('throws the leaving card off the side, spinning and shrinking', () => {
    const c = settled();
    act(() => {
      document.getElementById('revPageNext')!.click();
    });

    /* offX = innerWidth/2 + 420 = 1120; roll = 380 * dir. */
    expect(c[0].style.transform).toBe(
      'translate3d(-1120px,-40px,0) rotate(-380deg) scale(0.5)',
    );
    expect(c[0].style.opacity).toBe('0');
    expect(c[0].style.zIndex).toBe('1');
    expect(c[0].style.transition).toBe(
      'transform .72s cubic-bezier(.5,0,.7,1),opacity .6s ease',
    );
  });

  it('places the entering card off the OPPOSITE side with no transition, then releases it two frames later', () => {
    const c = settled();
    act(() => {
      document.getElementById('revPageNext')!.click();
    });

    /* Frame 0: parked at +1120 with transition:none. Set transition and
       transform in one frame and the browser coalesces them into no
       animation at all — hence the double rAF. */
    expect(c[3].style.transition).toBe('none');
    expect(c[3].style.transform).toBe(
      'translate3d(1120px,-40px,0) rotate(380deg) scale(0.5)',
    );
    expect(c[3].style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(40); // two animation frames
    });
    expect(c[3].style.transition).toBe(
      'transform .74s cubic-bezier(.25,.9,.3,1),opacity .5s ease',
    );
    expect(c[3].style.transform).toBe('translate3d(328px,0,0) scale(1.000)');
    expect(c[3].style.opacity).toBe('1');
  });

  it('slides the two survivors into their new slots rather than cross-fading', () => {
    const c = settled();
    act(() => {
      document.getElementById('revPageNext')!.click();
    });
    expect(c[1].style.transform).toBe('translate3d(-328px,0,0) scale(1.000)');
    expect(c[2].style.transform).toBe('translate3d(0px,0,0) scale(1.000)');
    expect(c[1].style.transition).toBe(
      'transform .6s var(--ease),opacity .4s var(--ease)',
    );
  });

  it('re-seats at rest after SHIFT_SETTLE and refuses a second turn while paging', () => {
    const c = settled();
    act(() => {
      document.getElementById('revPageNext')!.click();
    });
    /* revPaging is true: the second click is dropped (site.js:1933), so the
       leaving card is still card 0 and not card 1. */
    act(() => {
      document.getElementById('revPageNext')!.click();
    });
    expect(c[1].style.opacity).toBe('1');

    act(() => {
      vi.advanceTimersByTime(800);
    });
    /* revStart is 1, so the window is now 1,2,3 and card 0 is parked. */
    expect(c[0].style.transform).toBe('translate3d(0,60px,0) scale(0.9)');
    expect(c[1].style.transform).toBe('translate3d(-328px,0,0) scale(1.000)');
    expect(c[3].style.transform).toBe('translate3d(328px,0,0) scale(1.000)');
  });

  it('pages backwards from the other end', () => {
    const c = settled();
    act(() => {
      document.getElementById('revPagePrev')!.click();
    });
    /* dir -1: card 2 leaves to the RIGHT, card 14 enters from the LEFT. */
    expect(c[2].style.transform).toBe(
      'translate3d(1120px,-40px,0) rotate(380deg) scale(0.5)',
    );
    expect(c[14].style.transform).toBe(
      'translate3d(-1120px,-40px,0) rotate(-380deg) scale(0.5)',
    );
  });
});

/* ==================================================== 3. the solo carousel = */

describe('the solo carousel — site.js:1727-1831', () => {
  /* No --revPer in jsdom (css:false), so perPage() falls through to the
     source's own `innerWidth < 720 ? 1 : 3` — which is the solo mode. */
  beforeEach(() => setWidth(600));

  function solo() {
    render(createElement(Reviews));
    setStageTop(0);
    enter();
    return cards();
  }

  it('seats the cards on a cylinder, one SOLO_ANG step apart', () => {
    const c = solo();
    expect(c[0].style.transform).toBe(
      `translateZ(${-SOLO_R}px) rotateY(0.00deg) translateZ(${SOLO_R}px) scale(0.875)`,
    );
    expect(opacity(c[0])).toBe(1);
    expect(c[0].style.zIndex).toBe('10');

    /* One step out: yawed 32deg, scaled to SOLO_NS of the centre, dimmed to
       SOLO_DIM. */
    expect(c[1].style.transform).toContain('rotateY(32.00deg)');
    expect(c[1].style.transform).toContain('scale(0.752)');
    expect(opacity(c[1])).toBe(0.5);
    /* Wrapped the short way: card 14 is the LEFT neighbour of card 0. */
    expect(c[14].style.transform).toContain('rotateY(-32.00deg)');
  });

  it('drags with the pointer, one soloStep of travel per step of yaw', () => {
    const c = solo();
    const stage = document.getElementById('revStage')!;
    const deck = document.getElementById('revDeck')!;

    pointer('pointerdown', 300, 100, stage);
    pointer('pointermove', 250, 100, window);

    /* soloOff is round(soloStep(R)) = 359px, so 50px of finger is
       -50/359 = -0.1393 of a step, i.e. -4.46deg of yaw. */
    expect(deck.classList.contains('solo-dragging')).toBe(true);
    expect(deck.classList.contains('rev-live')).toBe(true);
    expect(c[0].style.transform).toContain(
      `rotateY(${((-50 / SOLO_STEP) * 32).toFixed(2)}deg)`,
    );
    expect(c[1].style.transform).toContain(
      `rotateY(${((1 - 50 / SOLO_STEP) * 32).toFixed(2)}deg)`,
    );
  });

  it('pages on a throw past SOLO_THROW and rolls home on easeRoll', () => {
    const c = solo();
    const stage = document.getElementById('revStage')!;
    const deck = document.getElementById('revDeck')!;

    pointer('pointerdown', 300, 100, stage);
    pointer('pointermove', 250, 100, window);
    pointer('pointerup', 250, 100, window); // dx = -50, past SOLO_THROW (48)

    expect(deck.classList.contains('solo-dragging')).toBe(false);
    /* Mid-roll the deck is not yet home. */
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(c[1].style.transform).not.toContain('rotateY(0.00deg)');
    /* SOLO_DUR is 620ms; past it soloAnim is exactly 0 and card 1 is the
       centred card. */
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(c[1].style.transform).toBe(
      `translateZ(${-SOLO_R}px) rotateY(0.00deg) translateZ(${SOLO_R}px) scale(0.875)`,
    );
    expect(opacity(c[1])).toBe(1);
    expect(c[0].style.transform).toContain('rotateY(-32.00deg)');
  });

  it('does not page for a short, slow drag — it rolls back to where it was', () => {
    const c = solo();
    const stage = document.getElementById('revStage')!;

    /* 15px over 200ms: under SOLO_THROW (48) and under SOLO_FLICK
       (0.45 px/ms), so neither release test fires. */
    pointer('pointerdown', 300, 100, stage, 0);
    pointer('pointermove', 285, 100, window, 200);
    pointer('pointerup', 285, 100, window, 200);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(c[0].style.transform).toContain('rotateY(0.00deg)');
  });

  it('answers to a trackpad deltaX on the deck — the client reviews mobile on a MacBook', () => {
    const c = solo();
    const deck = document.getElementById('revDeck')!;

    act(() => {
      deck.dispatchEvent(
        new WheelEvent('wheel', {
          deltaX: 80,
          deltaY: 0,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    /* One page forward: card 1 is centred. */
    expect(c[1].style.transform).toContain('rotateY(0.00deg)');
  });

  it('ignores a wheel whose deltaY dominates — that is a page scroll', () => {
    const c = solo();
    const deck = document.getElementById('revDeck')!;
    act(() => {
      deck.dispatchEvent(
        new WheelEvent('wheel', {
          deltaX: 80,
          deltaY: 200,
          bubbles: true,
          cancelable: true,
        }),
      );
      vi.advanceTimersByTime(700);
    });
    expect(c[0].style.transform).toContain('rotateY(0.00deg)');
  });

  it('pages when a neighbour is clicked, and swallows the click that ends a drag', () => {
    const c = solo();
    const stage = document.getElementById('revStage')!;

    /* A click on the card one step out pages to it (site.js:1838). */
    act(() => {
      c[1].click();
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(c[1].style.transform).toContain('rotateY(0.00deg)');

    /* But the click that follows a drag release is swallowed, so a throw
       never also expands or pages a second time. */
    pointer('pointerdown', 300, 100, stage);
    pointer('pointermove', 250, 100, window);
    pointer('pointerup', 250, 100, window);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    const before = c[2].style.transform;
    act(() => {
      c[2].click();
    });
    expect(c[2].style.transform).toBe(before);
  });

  it('sets the pager geometry the CSS reads back', () => {
    solo();
    const section = document.getElementById('reviews')!;
    expect(section.classList.contains('rev-solo')).toBe(true);
    expect(section.style.getPropertyValue('--revScale')).toBe('0.8750');
    expect(section.style.getPropertyValue('--revPagerX')).not.toBe('');
  });
});

/* ======================================================== the arming trap = */

describe('the deferred first layout', () => {
  it('lays nothing out until the observer fires — and everything once it does', () => {
    setWidth(1400);
    render(createElement(Reviews));
    setStageTop(0);
    /* Armed, not run. This is the state tests/setup.ts's no-op observer would
       leave the deck in forever. */
    expect(cards()[0].style.transform).toBe('');
    enter();
    expect(cards()[0].style.transform).toBe('translate3d(-328px,0,0) scale(1.000)');
  });

  it('runs the layout itself if a scroll somehow arrives first', () => {
    setWidth(1400);
    render(createElement(Reviews));
    setStageTop(0);
    scroll();
    expect(cards()[0].style.transform).toBe('translate3d(-328px,0,0) scale(1.000)');
  });
});
