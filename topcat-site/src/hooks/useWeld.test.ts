import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ARMD, EDGE_IN, REST, SHUT, WELD, docTop, easeIO, useWeld } from './useWeld';

/* ------------------------------------------------------------ harness -- */

/**
 * jsdom lays nothing out, so every input the weld reads is stated outright:
 * the viewport height, `#process`'s height, `#about`'s height, and where
 * `#about` sits in the document. Those four numbers plus `--barH` (0 here,
 * since jsdom resolves no custom properties) determine every number the hook
 * writes, so the assertions below are arithmetic, not approximations.
 *
 *   vh = 1000, procH = 900, aboutH = 800, docTop(#about) = 12000
 *
 *   pin   = min(0, max(1000-900, 0-0))            = 0
 *   slack = max(0, 1000-0-800) = 200
 *   target= 0 + min(200/2, 1000*0.06)             = 60
 *   HOLD  = 400   SLIDE = 1200   TAIL = 300   TOTAL = 1900
 *   pad   = max(0, 1900 - (900 + 0 - 60))         = 1060
 *   S     = 12000 - 1060 - 900 - 0                = 10040
 *
 * so `px` (the weld's own clock) is `scrollY - 10040`.
 */
const VH = 1000;
const PROC_H = 900;
const ABOUT_H = 800;
const ABOUT_TOP = 12000;
const S = 10040;
const HOLD = 400;
const SLIDE = 1200;
const TOTAL = 1900;

let mediaState: Record<string, boolean>;
const mediaListeners: Record<string, Array<() => void>> = {};

function installMatchMedia() {
  mediaState = {
    '(min-width:1121px)': true,
    '(prefers-reduced-motion: reduce)': false,
  };
  for (const k of Object.keys(mediaListeners)) delete mediaListeners[k];
  window.matchMedia = ((query: string) => ({
    get matches() {
      return !!mediaState[query];
    },
    media: query,
    onchange: null,
    addEventListener: (_t: string, fn: () => void) => {
      (mediaListeners[query] ||= []).push(fn);
    },
    removeEventListener: (_t: string, fn: () => void) => {
      mediaListeners[query] = (mediaListeners[query] || []).filter((f) => f !== fn);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function setMedia(query: string, value: boolean) {
  mediaState[query] = value;
  (mediaListeners[query] || []).forEach((fn) => fn());
}

/** The hook's IntersectionObserver, captured so a test can fire it — that is
 *  the source's own build trigger (site.js:4567). */
let ioCallback: IntersectionObserverCallback | null = null;
let ioTargets: Element[] = [];

function installIntersectionObserver() {
  ioCallback = null;
  ioTargets = [];
  class FakeIO {
    constructor(cb: IntersectionObserverCallback) {
      ioCallback = cb;
    }
    observe(el: Element) {
      ioTargets.push(el);
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver;
  window.IntersectionObserver = globalThis.IntersectionObserver;
}

const fireIntersect = () =>
  ioCallback?.(
    ioTargets.map((t) => ({ isIntersecting: true, target: t }) as IntersectionObserverEntry),
    null as unknown as IntersectionObserver,
  );

/** rAF made synchronous and drainable, so no test waits on a real frame. */
let rafQueue: FrameRequestCallback[] = [];
function installRaf() {
  rafQueue = [];
  const raf = ((cb: FrameRequestCallback) => rafQueue.push(cb)) as typeof requestAnimationFrame;
  const caf = (() => {}) as typeof cancelAnimationFrame;
  window.requestAnimationFrame = raf;
  window.cancelAnimationFrame = caf;
  globalThis.requestAnimationFrame = raf;
  globalThis.cancelAnimationFrame = caf;
}
/** Drain a bounded number of generations — `pump()` re-arms itself forever. */
function flushRaf(generations = 3) {
  for (let i = 0; i < generations; i++) {
    const q = rafQueue;
    rafQueue = [];
    q.forEach((cb) => cb(0));
  }
}

function fix(el: HTMLElement, prop: 'offsetHeight' | 'offsetTop', value: number) {
  Object.defineProperty(el, prop, { value, configurable: true });
}

function scrollTo(y: number) {
  Object.defineProperty(window, 'pageYOffset', { value: y, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  window.dispatchEvent(new Event('scroll'));
}

/** The two sections plus the divider between them, as page.tsx renders them. */
function buildPage() {
  const proc = document.createElement('section');
  proc.className = 'section';
  proc.id = 'process';

  const divider = document.createElement('div');
  divider.className = 'section-divider';

  const about = document.createElement('section');
  about.className = 'section';
  about.id = 'about';
  about.innerHTML = `
    <div class="about-wrap">
      <h2 class="section-title rise" id="aboutTitle">About us</h2>
      <div class="about-collage" id="aboutCollage">
        <figure class="ac-tile" id="t1"></figure>
        <figure class="ac-tile" id="t2"></figure>
      </div>
    </div>`;

  document.body.append(proc, divider, about);
  fix(proc, 'offsetHeight', PROC_H);
  fix(about, 'offsetHeight', ABOUT_H);
  fix(about, 'offsetTop', ABOUT_TOP);
  return { proc, divider, about };
}

let dom: ReturnType<typeof buildPage>;

beforeEach(() => {
  installMatchMedia();
  installIntersectionObserver();
  installRaf();
  Object.defineProperty(window, 'innerHeight', { value: VH, configurable: true, writable: true });
  scrollTo(0);
  dom = buildPage();
});

afterEach(() => {
  document.body.className = '';
  document.body.querySelectorAll('#weldStage').forEach((n) => n.remove());
  dom.proc.remove();
  dom.divider.remove();
  dom.about.remove();
  vi.restoreAllMocks();
});

const mount = () => renderHook(() => useWeld());

/* -------------------------------------------------------------- specs -- */

describe('the constants', () => {
  it('are the source’s own, unrounded', () => {
    // site.js:4447-4449 — carried across, not re-derived.
    expect(REST).toBe(0.4);
    expect(SHUT).toBe(1.2);
    expect(WELD).toBe(0.3);
    expect(EDGE_IN).toBe(0.06);
    expect(ARMD).toBe(0.94);
  });
});

describe('easeIO', () => {
  it('is the source’s cubic ease-in-out', () => {
    // site.js:4453
    expect(easeIO(0)).toBe(0);
    expect(easeIO(0.5)).toBe(0.5);
    expect(easeIO(1)).toBe(1);
    expect(easeIO(0.25)).toBeCloseTo(4 * 0.25 ** 3, 12);
    expect(easeIO(0.75)).toBeCloseTo(1 - Math.pow(-1.5 + 2, 3) / 2, 12);
  });
});

describe('docTop', () => {
  it('walks the offsetParent chain, not the client rect', () => {
    // site.js:4452 — a document coordinate that does not move while #process
    // is sticky, which getBoundingClientRect() would not give.
    expect(docTop(dom.about)).toBe(ABOUT_TOP);
  });
});

describe('body.weld-live', () => {
  it('is added on mount at >=1121px', () => {
    const { unmount } = mount();
    expect(document.body.classList.contains('weld-live')).toBe(true);
    unmount();
  });

  it('is NOT added below 1121px', () => {
    setMedia('(min-width:1121px)', false);
    const { unmount } = mount();
    expect(document.body.classList.contains('weld-live')).toBe(false);
    unmount();
  });

  it('is NOT added under prefers-reduced-motion: reduce', () => {
    setMedia('(prefers-reduced-motion: reduce)', true);
    const { unmount } = mount();
    expect(document.body.classList.contains('weld-live')).toBe(false);
    unmount();
  });

  it('is not added at all when #about is missing', () => {
    dom.about.remove();
    const { unmount } = mount();
    expect(document.body.classList.contains('weld-live')).toBe(false);
    unmount();
  });

  it('arrives when the viewport crosses into the desktop band', () => {
    // site.js:4578 — the mq `change` handler, not a resize.
    setMedia('(min-width:1121px)', false);
    const { unmount } = mount();
    expect(document.body.classList.contains('weld-live')).toBe(false);
    setMedia('(min-width:1121px)', true);
    expect(document.body.classList.contains('weld-live')).toBe(true);
    unmount();
  });

  it('leaves again when the viewport drops out of it', () => {
    const { unmount } = mount();
    setMedia('(min-width:1121px)', false);
    expect(document.body.classList.contains('weld-live')).toBe(false);
    unmount();
  });
});

describe('measure', () => {
  it('publishes --procPin and buys the scroll distance as margin on #about', () => {
    const { unmount } = mount();
    flushRaf();
    // site.js:4501 / 4509 — see the arithmetic in the harness header.
    expect(dom.proc.style.getPropertyValue('--procPin')).toBe('0.00px');
    expect(dom.about.style.marginTop).toBe('1060px');
    unmount();
  });
});

describe('the stage', () => {
  it('is built with two doors, a seam, and an id-stripped clone of #about', () => {
    const { unmount } = mount();
    flushRaf();
    fireIntersect();
    flushRaf();

    const stage = document.getElementById('weldStage');
    expect(stage).not.toBeNull();
    expect(stage!.getAttribute('aria-hidden')).toBe('true');
    expect(stage!.querySelectorAll('.weld-door').length).toBe(2);
    expect(stage!.querySelector('.weld-l')).not.toBeNull();
    expect(stage!.querySelector('.weld-r')).not.toBeNull();
    expect(stage!.querySelector('#weldSeam')).not.toBeNull();
    expect(stage!.querySelectorAll('.ws-glow,.ws-run,.ws-head').length).toBe(3);

    // Two clones, each `.weld-about`, each aria-hidden, and NOT carrying a
    // second `#about` / `#aboutCollage` / `#t1` into the document.
    const clones = stage!.querySelectorAll('.weld-about');
    expect(clones.length).toBe(2);
    clones.forEach((c) => expect(c.getAttribute('aria-hidden')).toBe('true'));
    expect(stage!.querySelectorAll('[id]').length).toBe(1); // #weldSeam only
    expect(document.querySelectorAll('#about').length).toBe(1);

    // site.js:4463 — the clone's `.rise` children are pinned revealed, because
    // nothing observes a detached copy.
    stage!.querySelectorAll<HTMLElement>('.rise').forEach((el) => {
      expect(el.classList.contains('in')).toBe(true);
      expect(el.style.transition).toBe('none');
    });
    unmount();
  });

  it('is built once, not once per scroll event', () => {
    const { unmount } = mount();
    flushRaf();
    fireIntersect();
    flushRaf();
    scrollTo(S + 800);
    flushRaf();
    fireIntersect();
    flushRaf();
    expect(document.querySelectorAll('#weldStage').length).toBe(1);
    unmount();
  });
});

describe('the door travel', () => {
  it('is the source’s eased translate at a third of the shut', () => {
    const { unmount } = mount();
    flushRaf();
    scrollTo(S + HOLD + SLIDE / 3); // px = 800, d = 1/3
    flushRaf();

    const stage = document.getElementById('weldStage')!;
    expect(stage.classList.contains('on')).toBe(true);
    // easeIO(1/3) = 4*(1/3)^3 = 0.148148…  ->  off = 85.185
    expect(stage.querySelector<HTMLElement>('.weld-l')!.style.transform).toBe(
      'translate3d(-85.185%,0,0)',
    );
    expect(stage.querySelector<HTMLElement>('.weld-r')!.style.transform).toBe(
      'translate3d(85.185%,0,0)',
    );
    // d (0.333) is well past EDGE_IN (0.06), so the edge glow is full and the
    // seam is still dark.
    expect(stage.style.getPropertyValue('--edgeA')).toBe('1.000');
    expect(stage.style.getPropertyValue('--seamA')).toBe('0.000');
    expect(dom.about.classList.contains('weld-hide')).toBe(true);
    expect(dom.proc.classList.contains('weld-past')).toBe(false);
    unmount();
  });

  it('shuts and fires the seam once the doors meet', () => {
    const { unmount } = mount();
    flushRaf();
    scrollTo(S + HOLD + SLIDE); // d = 1
    flushRaf();

    const stage = document.getElementById('weldStage')!;
    expect(stage.querySelector<HTMLElement>('.weld-l')!.style.transform).toBe(
      'translate3d(0.000%,0,0)',
    );
    expect(stage.classList.contains('welding')).toBe(true);
    expect(stage.style.getPropertyValue('--seamA')).toBe('1.000');
    unmount();
  });

  it('re-arms the seam only after scrolling back past ARMD', () => {
    const { unmount } = mount();
    flushRaf();
    scrollTo(S + HOLD + SLIDE);
    flushRaf();
    const stage = document.getElementById('weldStage')!;
    expect(stage.classList.contains('welding')).toBe(true);

    // d = 0.96, still above ARMD (0.94) — the weld stays struck.
    scrollTo(S + HOLD + SLIDE * 0.96);
    flushRaf();
    expect(stage.classList.contains('welding')).toBe(true);

    // d = 0.90, below ARMD — disarmed, ready to fire again.
    scrollTo(S + HOLD + SLIDE * 0.9);
    flushRaf();
    expect(stage.classList.contains('welding')).toBe(false);
    unmount();
  });
});

describe('the hand-off', () => {
  it('hides #process behind .weld-past once the whole run is past', () => {
    const { unmount } = mount();
    flushRaf();
    // Through the run first — the stage is built lazily, only while in phase
    // (site.js:4519), so jumping straight past TOTAL correctly builds nothing.
    scrollTo(S + HOLD + SLIDE);
    flushRaf();
    expect(document.getElementById('weldStage')!.classList.contains('on')).toBe(true);

    scrollTo(S + TOTAL + 200);
    flushRaf();
    expect(dom.proc.classList.contains('weld-past')).toBe(true);
    expect(dom.about.classList.contains('weld-hide')).toBe(false);
    expect(document.getElementById('weldStage')!.classList.contains('on')).toBe(false);
    unmount();
  });

  it('holds neither class before the run begins', () => {
    const { unmount } = mount();
    flushRaf();
    scrollTo(S - 300);
    flushRaf();
    expect(dom.proc.classList.contains('weld-past')).toBe(false);
    expect(dom.about.classList.contains('weld-hide')).toBe(false);
    unmount();
  });
});

describe('teardown', () => {
  it('leaves nothing behind on <body> or on either section', () => {
    const { unmount } = mount();
    flushRaf();
    scrollTo(S + HOLD + SLIDE / 2);
    flushRaf();
    expect(document.body.classList.contains('weld-live')).toBe(true);
    expect(document.getElementById('weldStage')).not.toBeNull();

    unmount();

    // A client-side navigation must not leave the class on an element React
    // does not own, nor a second stage for the next mount to fight with.
    expect(document.body.classList.contains('weld-live')).toBe(false);
    expect(document.getElementById('weldStage')).toBeNull();
    expect(dom.about.classList.contains('weld-hide')).toBe(false);
    expect(dom.proc.classList.contains('weld-past')).toBe(false);
    expect(dom.about.style.marginTop).toBe('');
    expect(dom.proc.style.getPropertyValue('--procPin')).toBe('');
  });

  it('cleans up even when the weld never armed', () => {
    setMedia('(min-width:1121px)', false);
    const { unmount } = mount();
    unmount();
    expect(document.body.classList.contains('weld-live')).toBe(false);
    expect(document.getElementById('weldStage')).toBeNull();
  });

  it('does not react to scroll after unmount', () => {
    const { unmount } = mount();
    flushRaf();
    unmount();
    scrollTo(S + HOLD + SLIDE / 2);
    flushRaf();
    expect(document.getElementById('weldStage')).toBeNull();
    expect(document.body.classList.contains('weld-live')).toBe(false);
  });

  it('mounts a second time without doubling the stage', () => {
    const first = mount();
    flushRaf();
    fireIntersect();
    flushRaf();
    first.unmount();

    const second = mount();
    flushRaf();
    fireIntersect();
    flushRaf();
    expect(document.querySelectorAll('#weldStage').length).toBe(1);
    second.unmount();
  });
});
