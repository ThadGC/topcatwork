import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  HERO_CLEAR_MS,
  HERO_INTERVAL_MS,
  HERO_N,
  useProjectSlideshow,
} from './useProjectSlideshow';

/* ------------------------------------------------------------ helpers -- */

type Shot = readonly [string, number, number];

const POOL: readonly Shot[] = [
  ['/assets/projects/x-g1.webp', 1600, 1067],
  ['/assets/projects/x-g2.webp', 1600, 1067],
  ['/assets/projects/x-g3.webp', 1600, 1067],
  ['/assets/projects/x-g4.webp', 1600, 1067],
  ['/assets/projects/x-g5.webp', 1600, 1067],
  ['/assets/projects/x-g6.webp', 1600, 1067],
];
const CARD = '/assets/projects/x-1400.webp';

let heroBg: HTMLDivElement;
/** Every URL the engine asked the browser to decode, in order. */
let fetched: string[];

/**
 * `preload` (site.js:2342) resolves on the Image's own load event, so the
 * fake Image resolves it the moment `src` is assigned — the handler is always
 * attached first in the source.
 */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  #src = '';
  set src(v: string) {
    this.#src = v;
    fetched.push(v);
    this.onload?.();
  }
  get src() {
    return this.#src;
  }
}

function slides() {
  return Array.from(heroBg.querySelectorAll<HTMLElement>('.phb-slide'));
}

function mount(clicked: string | null, pool: readonly Shot[] | null) {
  const ref = { current: heroBg as HTMLDivElement | null };
  return renderHook(
    (props: { clicked: string | null }) =>
      useProjectSlideshow(ref, props.clicked, pool),
    { initialProps: { clicked } },
  );
}

const bg = (el: HTMLElement) => el.style.backgroundImage;

beforeEach(() => {
  fetched = [];
  vi.stubGlobal('Image', FakeImage);
  vi.useFakeTimers();
  heroBg = document.createElement('div');
  heroBg.id = 'projHeroBg';
  // site.js:2339 — Gallery.tsx renders the five slides; the hook drives them.
  heroBg.innerHTML = Array.from({ length: HERO_N }, () => '<div class="phb-slide"></div>').join(
    '',
  );
  document.body.appendChild(heroBg);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  heroBg.remove();
});

/* -------------------------------------------------------------- specs -- */

describe('the source’s numbers', () => {
  it('is five slides on a 4.5s timer with a 1.4s tail', () => {
    // site.js:2338, 2357, 2371.
    expect(HERO_N).toBe(5);
    expect(HERO_INTERVAL_MS).toBe(4500);
    expect(HERO_CLEAR_MS).toBe(1400);
  });
});

describe('starting', () => {
  it('shows the clicked card image first, before any timer runs', () => {
    const { unmount } = mount(CARD, POOL);
    const s = slides();
    // site.js:2350-2354 — slide 0 is lit synchronously, not on the interval.
    expect(bg(s[0])).toBe(`url("${CARD}")`);
    expect(s[0].style.opacity).toBe('1');
    expect(s[0].style.zIndex).toBe('1');
    expect(s[0].classList.contains('active')).toBe(true);
    for (const other of s.slice(1)) {
      expect(bg(other)).toBe('');
      expect(other.style.opacity).toBe('0');
      expect(other.classList.contains('active')).toBe(false);
    }
    unmount();
  });

  it('fetches the next two frames up front', () => {
    // site.js:2356 — heroSeq.slice(1,3).
    const { unmount } = mount(CARD, POOL);
    expect(fetched).toEqual([POOL[0][0], POOL[1][0]]);
    unmount();
  });

  it('runs no timer for a project with no photographs', async () => {
    // site.js:2355 — heroSeq is [clickedSrc] alone, so there is nothing to
    // cross-fade to and the interval is never created.
    const { unmount } = mount(CARD, []);
    expect(fetched).toEqual([]);
    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS * 3);
    expect(slides().map(bg)).toEqual([`url("${CARD}")`, '', '', '', '']);
    unmount();
  });
});

describe('cycling', () => {
  it('cross-fades to the next photograph every 4.5s', async () => {
    const { unmount } = mount(CARD, POOL);
    const s = slides();

    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS);
    // site.js:2365-2369 — the incoming slide is only revealed once decoded.
    expect(bg(s[1])).toBe(`url("${POOL[0][0]}")`);
    expect(s[1].style.opacity).toBe('1');
    expect(s[1].style.zIndex).toBe('2');
    expect(s[1].classList.contains('active')).toBe(true);
    // The outgoing slide is still lit through the 1.3s CSS fade.
    expect(s[0].style.opacity).toBe('1');

    await vi.advanceTimersByTimeAsync(HERO_CLEAR_MS);
    // site.js:2371-2375
    expect(s[0].style.opacity).toBe('0');
    expect(s[0].style.zIndex).toBe('0');
    expect(s[0].classList.contains('active')).toBe(false);
    // and the frame after next is fetched off the back of the reset.
    expect(fetched).toContain(POOL[1][0]);

    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS - HERO_CLEAR_MS);
    expect(bg(s[2])).toBe(`url("${POOL[1][0]}")`);
    unmount();
  });

  it('wraps the five slides around a longer sequence', async () => {
    const { unmount } = mount(CARD, POOL);
    const s = slides();
    // Seven images through five slides: the sixth advance lands back on
    // slide 1 (site.js:2362 — heroIdx is taken modulo HERO_N).
    for (let i = 0; i < 5; i++) await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS);
    expect(bg(s[0])).toBe(`url("${POOL[4][0]}")`);
    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS);
    expect(bg(s[1])).toBe(`url("${POOL[5][0]}")`);
    unmount();
  });

  it('returns to the clicked image at the end of the sequence', async () => {
    const short: readonly Shot[] = [POOL[0], POOL[1]];
    const { unmount } = mount(CARD, short);
    const s = slides();
    // heroSeq is [card, g1, g2]; the third advance is back to the card.
    for (let i = 0; i < 3; i++) await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS);
    expect(bg(s[3])).toBe(`url("${CARD}")`);
    unmount();
  });
});

describe('stopping', () => {
  it('stops the timer when the overlay closes', async () => {
    const view = mount(CARD, POOL);
    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS);
    const before = slides().map(bg);

    // site.js:2503 — closeFocus calls stopHero.
    view.rerender({ clicked: null });

    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS * 3);
    expect(slides().map(bg)).toEqual(before);
    view.unmount();
  });

  it('drops the in-flight tail of a run that has been superseded', async () => {
    const view = mount(CARD, POOL);
    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS);
    const s = slides();
    expect(s[1].style.opacity).toBe('1');

    /* Close and reopen inside the 1.4s tail. `heroRun` (site.js:2344) is what
       stops the old run's setTimeout from wiping a slide the new run has
       just lit. */
    view.rerender({ clicked: null });
    view.rerender({ clicked: CARD });
    expect(s[0].style.opacity).toBe('1');
    await vi.advanceTimersByTimeAsync(HERO_CLEAR_MS);
    expect(s[0].style.opacity).toBe('1');
    view.unmount();
  });

  it('clears the timer on unmount', async () => {
    const { unmount } = mount(CARD, POOL);
    const s = slides();
    unmount();
    await vi.advanceTimersByTimeAsync(HERO_INTERVAL_MS * 3);
    expect(s.map(bg)).toEqual([`url("${CARD}")`, '', '', '', '']);
  });
});
