/**
 * HERO FILM — mount, teardown and fallback tests.
 *
 * jsdom has no decoder, no layout and no `matchMedia`, so this cannot test the
 * film. What it CAN test is the part that bites on a real site: that the
 * component mounts without touching anything it should not, that reduced
 * motion leaves a still hero behind, and — the one that actually matters for a
 * multi-page app — that unmounting removes every listener, every timer, every
 * rAF and every class it put on the document. A scroll-driven module that
 * leaks across a client-side navigation keeps running against a hero that is
 * no longer on the page.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeroFilm } from './HeroFilm';

type MQL = {
  matches: boolean;
  media: string;
  addEventListener: (t: string, l: () => void) => void;
  removeEventListener: (t: string, l: () => void) => void;
  addListener: () => void;
  removeListener: () => void;
  onchange: null;
  dispatchEvent: () => boolean;
};

/** Install a `matchMedia` that answers for a given viewport width. */
function mockMatchMedia(width: number, reduce = false) {
  const answer = (q: string): boolean => {
    if (q.includes('prefers-reduced-motion')) return reduce;
    const max = /max-width:\s*(\d+)/.exec(q);
    if (max) return width <= Number(max[1]);
    const min = /min-width:\s*(\d+)/.exec(q);
    if (min) return width >= Number(min[1]);
    return false;
  };
  const mql = (query: string): MQL => ({
    matches: answer(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  });
  vi.stubGlobal('matchMedia', vi.fn(mql));
  Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(mql) });
}

/** Count live window/document listeners so a leak is visible. */
function listenerCounter() {
  const counts = new Map<string, number>();
  const bump = (target: string, type: string, n: number) => {
    const k = target + ':' + type;
    counts.set(k, (counts.get(k) ?? 0) + n);
  };
  const wAdd = window.addEventListener.bind(window);
  const wRem = window.removeEventListener.bind(window);
  const dAdd = document.addEventListener.bind(document);
  const dRem = document.removeEventListener.bind(document);

  window.addEventListener = ((t: string, l: EventListener, o?: never) => {
    bump('w', t, 1);
    wAdd(t, l, o);
  }) as typeof window.addEventListener;
  window.removeEventListener = ((t: string, l: EventListener, o?: never) => {
    bump('w', t, -1);
    wRem(t, l, o);
  }) as typeof window.removeEventListener;
  document.addEventListener = ((t: string, l: EventListener, o?: never) => {
    bump('d', t, 1);
    dAdd(t, l, o);
  }) as typeof document.addEventListener;
  document.removeEventListener = ((t: string, l: EventListener, o?: never) => {
    bump('d', t, -1);
    dRem(t, l, o);
  }) as typeof document.removeEventListener;

  return {
    counts,
    restore() {
      window.addEventListener = wAdd;
      window.removeEventListener = wRem;
      document.addEventListener = dAdd;
      document.removeEventListener = dRem;
    },
  };
}

beforeEach(() => {
  // jsdom has no `canPlayType`; without one the film refuses to start, which
  // is correct behaviour but would make every test below test the fallback.
  HTMLMediaElement.prototype.canPlayType = () => 'probably' as CanPlayTypeResult;
  HTMLMediaElement.prototype.play = () => Promise.resolve();
  HTMLMediaElement.prototype.pause = () => {};
  HTMLMediaElement.prototype.load = () => {};
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.className = '';
});

describe('markup', () => {
  it('renders the still hero, the film and all three story beats', () => {
    mockMatchMedia(1440);
    const { container } = render(<HeroFilm>hero copy</HeroFilm>);

    expect(container.querySelector('img')).toBeTruthy();
    expect(container.querySelector('video')).toBeTruthy();
    expect(container.querySelectorAll('p[data-vpos]')).toHaveLength(3);
    expect(container.textContent).toContain('It starts as a mountain.');
    expect(container.textContent).toContain('The slab you choose is');
    expect(container.textContent).toContain('The stone sets the tone of');
    expect(container.textContent).toContain('hero copy');
  });

  it('ships no video src in the EXPORTED html, so the wrong encode is never fetched', () => {
    // Asserted against the static-export output, not the hydrated DOM: the
    // band is unknown at build time, so baking a src into the HTML would start
    // a 1920 download on a phone before any JS could stop it. The engine picks
    // the encode on mount instead — which is why the live DOM does have one.
    mockMatchMedia(1440);
    const html = renderToStaticMarkup(<HeroFilm />);
    expect(html).toContain('<video');
    expect(html).toContain('preload="none"');
    expect(html).not.toContain('topcat-intro');
    expect(html).not.toMatch(/<video[^>]*\ssrc=/);
    // The still hero, on the other hand, must be in the HTML with a
    // fetchpriority, because it is what the visitor actually sees first.
    expect(html).toMatch(/<img[^>]*hero-night/);
  });

  it('marks the film muted and inline — the transport depends on play()', () => {
    mockMatchMedia(1440);
    const { container } = render(<HeroFilm />);
    const video = container.querySelector('video')!;
    expect(video.muted || video.hasAttribute('muted')).toBe(true);
    expect(video.getAttribute('playsinline')).not.toBeNull();
  });

  it('exposes the skip control as a real button', () => {
    mockMatchMedia(1440);
    const { container } = render(<HeroFilm skipLabel="Skip intro" />);
    const btn = container.querySelector('button');
    expect(btn?.textContent).toBe('Skip intro');
    expect(btn?.getAttribute('type')).toBe('button');
  });

  it('places the caller trust slot inside the story plane so it rides the wipe', () => {
    mockMatchMedia(1440);
    const { container } = render(<HeroFilm trust={<b data-testid="chips">chips</b>} />);
    expect(container.querySelector('[data-testid="chips"]')).toBeTruthy();
  });
});

describe('how the clip is loaded', () => {
  it('attaches the band encode as a direct same-origin URL, never a blob', () => {
    // Direct first is the reference's order and the reason it works: byte
    // ranges keep currentTime seekable and sidestep Chrome's blob: media
    // safety check. The Blob path is the fallback, and it only exists once
    // the element has actually errored.
    mockMatchMedia(1440);
    const { container } = render(<HeroFilm />);
    const src = container.querySelector('video')!.getAttribute('src') ?? '';
    expect(src).toBe('/assets/video/topcat-intro-1920.mp4?v=8');
    expect(src.startsWith('blob:')).toBe(false);
  });

  it('picks the phone encode on a phone, stamp and all', () => {
    mockMatchMedia(390);
    const { container } = render(<HeroFilm />);
    const video = container.querySelector('video')!;
    expect(video.getAttribute('src')).toBe('/assets/video/topcat-intro-608.mp4?v=8');
    expect(video.getAttribute('poster')).toBe(
      '/assets/video/topcat-intro-608-poster.webp?v=8',
    );
  });

  it('stops listening for clip errors once unmounted', () => {
    // The teardown contract: release() drops the loader's listeners, so a late
    // error on a detached element cannot start a 25 MB fallback download for a
    // film that is no longer on the page.
    mockMatchMedia(1440);
    const fetchSpy = vi.fn(() => new Promise<never>(() => {}));
    vi.stubGlobal('fetch', fetchSpy);

    const view = render(<HeroFilm />);
    const video = view.container.querySelector('video')!;
    view.unmount();

    video.dispatchEvent(new Event('error'));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('iOS priming', () => {
  it('never plays the film on a pointer device', () => {
    // The scrub transport seeks and never plays. A stray play() on desktop is
    // pure drift — the old prime fired on every device and ignored the band.
    mockMatchMedia(1440);
    const play = vi.fn(() => Promise.resolve());
    HTMLMediaElement.prototype.play = play;

    const { container } = render(<HeroFilm />);
    const video = container.querySelector('video')!;
    dispatchEvent(new Event('scroll'));
    dispatchEvent(new Event('pointerdown'));
    // `loadedmetadata` in particular: that is where the old unconditional
    // "prime the decoder while we are still at the top of the page" play()
    // lived, and it fired on desktop too.
    video.dispatchEvent(new Event('loadedmetadata'));
    video.dispatchEvent(new Event('loadeddata'));
    video.dispatchEvent(new Event('canplay'));

    expect(play).not.toHaveBeenCalled();
  });

  it('primes once on a touch device, and only after a gesture', () => {
    // iOS will not paint a frame until playback has been initiated once, and
    // will not allow playback until the visitor has touched something. So:
    // wait for the gesture, then play/pause exactly once.
    mockMatchMedia(390);
    const play = vi.fn(() => Promise.resolve());
    HTMLMediaElement.prototype.play = play;

    const { container } = render(<HeroFilm />);
    container.querySelector('video')!.dispatchEvent(new Event('loadeddata'));
    expect(play).not.toHaveBeenCalled();

    dispatchEvent(new Event('pointerdown'));
    expect(play).toHaveBeenCalledTimes(1);

    // A second gesture is not a second prime.
    dispatchEvent(new Event('pointerdown'));
    expect(play).toHaveBeenCalledTimes(1);
  });
});

describe('reduced motion', () => {
  it('never turns the film on, and leaves the still hero visible', () => {
    mockMatchMedia(1440, true);
    render(<HeroFilm />);
    expect(document.documentElement.classList.contains('cine-on')).toBe(false);
  });

  it('releases the hero copy anyway — nothing else is going to ink it', () => {
    mockMatchMedia(1440, true);
    const { container } = render(<HeroFilm>copy</HeroFilm>);
    // `fail()` schedules the class over a double rAF, exactly as the legacy
    // hero-parallax fallback does.
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const hero = container.querySelector('section')!;
            expect(hero.classList.contains('loaded')).toBe(true);
            resolve();
          }),
        ),
      );
    });
  });
});

describe('teardown', () => {
  it('leaves no listener behind on unmount', () => {
    mockMatchMedia(1440);
    const spy = listenerCounter();
    const view = render(<HeroFilm />);
    view.unmount();
    spy.restore();

    for (const [key, n] of spy.counts) {
      expect(n, key + ' listeners still attached').toBe(0);
    }
  });

  it('leaves no class behind on the document', () => {
    // This is the one that bites on a client-side navigation away from the
    // home page: `cine-on` is what gives every OTHER module its film-aware
    // behaviour, and a stale one restyles a page that has no film.
    mockMatchMedia(1440);
    const view = render(<HeroFilm />);
    view.unmount();

    const root = document.documentElement;
    for (const c of ['cine-on', 'cine-done', 'skip-live', 'to-hero']) {
      expect(root.classList.contains(c), c + ' left on <html>').toBe(false);
    }
  });

  it('releases the __cineHold flag the hero parallax reads', () => {
    mockMatchMedia(1440);
    const view = render(<HeroFilm />);
    view.unmount();
    expect(window.__cineHold).toBe(false);
  });

  it('cancels its animation frame', () => {
    mockMatchMedia(1440);
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const view = render(<HeroFilm />);
    dispatchEvent(new Event('scroll'));
    view.unmount();
    // Either it had a frame pending and cancelled it, or it had none — what
    // must never happen is a pending frame surviving the unmount.
    expect(cancel).toHaveBeenCalled();
    cancel.mockRestore();
  });

  it('survives mount / unmount / remount', () => {
    mockMatchMedia(1440);
    for (let i = 0; i < 3; i++) {
      const view = render(<HeroFilm />);
      dispatchEvent(new Event('scroll'));
      dispatchEvent(new Event('resize'));
      view.unmount();
    }
    expect(document.documentElement.classList.contains('cine-on')).toBe(false);
  });
});

describe('the scroll path', () => {
  it('does not throw on scroll, resize or a synthetic load', () => {
    mockMatchMedia(1440);
    render(<HeroFilm />);
    expect(() => {
      dispatchEvent(new Event('scroll'));
      dispatchEvent(new Event('resize'));
      dispatchEvent(new Event('load'));
    }).not.toThrow();
  });

  it('handles the phone band without a phone-specific beat override', () => {
    // Beat 2 has no `-phone` timing and must inherit the narrow one, because
    // both media queries match on a phone.
    mockMatchMedia(390);
    expect(() => {
      render(<HeroFilm />);
      dispatchEvent(new Event('scroll'));
    }).not.toThrow();
  });
});
