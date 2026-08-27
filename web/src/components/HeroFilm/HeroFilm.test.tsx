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

  it('bakes no fetchable media URL into the EXPORTED html', () => {
    // The band is unknown at build time, so a `src` on the <video> would start
    // a 24 MB desktop download on a phone before any JS could stop it, and a
    // `src` on the still would spend 151,604 bytes on an element that
    // `html.cine-on` holds at opacity 0 for the whole session.
    //
    // Neither is an ATTRIBUTE in the export. All six encode URLs are in the
    // export — they have to be, the parse-time script picks from them — but
    // inside a <script>, where nothing fetches them speculatively.
    mockMatchMedia(1440);
    const html = renderToStaticMarkup(<HeroFilm />);
    expect(html).toContain('<video');
    expect(html).toContain('preload="none"');
    expect(html).not.toMatch(/<video[^>]*\ssrc=/);
    expect(html).not.toMatch(/<video[^>]*\sposter=/);
    // The still is present and addressable, but deferred.
    expect(html).toMatch(/<img[^>]*data-src="[^"]*hero-night/);
    expect(html).not.toMatch(/<img[^>]*\ssrc="[^"]*hero-night[^"]*"[^>]*fetchpriority/i);

    // Every `topcat-intro` mention is inside a script tag, not an attribute.
    for (const at of [...html.matchAll(/topcat-intro/g)].map((m) => m.index)) {
      const before = html.slice(0, at);
      expect(before.lastIndexOf('<script')).toBeGreaterThan(before.lastIndexOf('</script>'));
    }
  });

  it('gives a no-JS visitor a real <img src> hero, inside <noscript>', () => {
    // With the still deferred, <noscript> is the ONLY hero a visitor without
    // JavaScript gets. It must carry the src and the srcset, and it must be
    // raw markup — React hydrating children inside a <noscript> is a mismatch
    // on every load, because the browser parses that content as text.
    mockMatchMedia(1440);
    const html = renderToStaticMarkup(<HeroFilm />);
    const ns = /<noscript>(.*?)<\/noscript>/s.exec(html);
    expect(ns).toBeTruthy();
    expect(ns![1]).toMatch(/^<img [^>]*src="\/assets\/site\/hero-night-2752\.webp"/);
    expect(ns![1]).toContain('srcset=');
    expect(ns![1]).toContain('width="2752"');
    // And it must be out of flow. `.bgImg` is a 100%-height block inside a
    // clipped `.bg`, so a second one in normal flow lands entirely below the
    // deferred element and the no-JS hero paints blank.
    expect(ns![1]).toContain('position:absolute');
  });

  it('sets the cine gate and the media boot during parse, not from an effect', () => {
    // `html.cine-on` is what switches the runway to 800vh on a phone. Until it
    // lands, the services strip sits ~1.3k px below the fold instead of ~5.8k,
    // inside Chrome's lazy threshold — which is how 1,863,538 bytes of service
    // imagery got in front of the film. Both scripts must be in the export.
    mockMatchMedia(390);
    const html = renderToStaticMarkup(<HeroFilm />);
    expect(html).toContain("classList.add('cine-on')");
    expect(html).toContain('stopImmediatePropagation');
    expect(html).toContain('document.currentScript');
    // The gate has to precede the elements it gates.
    expect(html.indexOf("classList.add('cine-on')")).toBeLessThan(html.indexOf('<img'));
    // The media boot has to follow them.
    expect(html.indexOf('document.currentScript')).toBeGreaterThan(html.indexOf('<video'));
  });

  it('preloads the band plate — the first picture of the intro — and only that', () => {
    // `.plate` is over the film at opacity 1 until the decoder paints, so it is
    // what the visitor looks at while the film buffers. It was arriving at
    // t=553ms, behind the service strip. The reduced-motion clause is what
    // keeps a visitor who will never see the film from fetching 41,906 bytes.
    mockMatchMedia(390);
    const html = renderToStaticMarkup(<HeroFilm />);
    const links = [...html.matchAll(/<link[^>]*rel="preload"[^>]*>/g)].map((m) => m[0]);
    // TWO, not three, since 27 Aug: the tablet plays the wide cut, so it wants
    // the wide plate. See lib/timeline.ts `filmBand`.
    expect(links).toHaveLength(2);
    for (const l of links) {
      expect(l).toContain('as="image"');
      expect(l).toContain('prefers-reduced-motion: no-preference');
    }
    expect(links.some((l) => l.includes('plate-f0-phone.webp'))).toBe(true);
    // And the other one covers everything above the phone in ONE query.
    const wide = links.find((l) => !l.includes('phone'))!;
    expect(wide).toContain('(min-width:721px)');
    expect(wide).not.toContain('max-width:1120px');
    // The still hero is NOT preloaded — it is the thing being deferred.
    expect(links.some((l) => l.includes('hero-night'))).toBe(false);
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
    expect(src).toBe('/assets/video/topcat-intro-1920.mp4?v=9');
    expect(src.startsWith('blob:')).toBe(false);
  });

  it('picks the phone encode on a phone, stamp and all', () => {
    mockMatchMedia(390);
    const { container } = render(<HeroFilm />);
    const video = container.querySelector('video')!;
    expect(video.getAttribute('src')).toBe('/assets/video/topcat-intro-608.mp4?v=9');
    // The poster IS the plate — same sha256, one URL, one download. The
    // separate `topcat-intro-608-poster.webp?v=9` was 41,906 duplicate bytes
    // arriving at t=556ms, in the window the film needs for its first range
    // request. See the note on DEFAULT_SOURCES.poster.
    expect(video.getAttribute('poster')).toBe(
      '/assets/video/plates/plate-f0-phone.webp?v=5',
    );
  });

  it('leaves a src the parse-time boot already attached alone', () => {
    // The boot script points the element at the band encode ~480ms before
    // hydration gets here. Re-assigning the identical URL and calling load()
    // would abort that fetch and throw the buffer away — the head start would
    // cost a round trip instead of saving one.
    mockMatchMedia(390);
    const loads = vi.fn();
    HTMLMediaElement.prototype.load = loads;

    const view = render(<HeroFilm />);
    const video = view.container.querySelector('video')!;
    expect(video.getAttribute('src')).toBe('/assets/video/topcat-intro-608.mp4?v=9');
    const first = loads.mock.calls.length;

    // Remount against an element that already carries the source: the second
    // attach must not call load() again.
    view.rerender(<HeroFilm />);
    expect(loads.mock.calls.length).toBe(first);
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

describe('the reveal clip', () => {
  /**
   * The reveal uncovers the headline with two clipping panes carrying
   * transforms. What this checks is not the picture — that is lib/reveal.ts's
   * job and it is tested there against the polygons it replaced — but the two
   * DOM states either side of it: the pane clips WHILE the sweep is running,
   * and it is RELEASED the moment it is not.
   *
   * The release matters. A pane clips to the copy's content box plus its
   * bleed, and the old `clip-path` was removed from the element at exactly this
   * point rather than left on it. Parked in the clipping state instead, the
   * line would be cut to a box sized for the reveal for the rest of the page's
   * life, and any ink added later — a bigger shadow, an outline, a text-stroke
   * — would be silently trimmed to it.
   *
   * jsdom has no layout, so the numbers here are supplied: a `getBoundingClientRect`
   * for the film box and a `currentTime` for the frame. That is enough, because
   * the reveal is keyed to the film's own frame index and nothing else.
   */
  const RECT = {
    left: 0,
    top: 0,
    right: 1440,
    bottom: 900,
    width: 1440,
    height: 900,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;

  let media: Array<[string, PropertyDescriptor | undefined]> = [];

  /** Mount the film with a given source frame on screen. */
  function mountAtFrame(sourceFrame: number) {
    mockMatchMedia(1440);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(RECT);
    media = (['readyState', 'currentTime'] as const).map((k) => [
      k,
      Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, k),
    ]);
    Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
      configurable: true,
      get: () => 4,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
      configurable: true,
      get: () => sourceFrame / 12, // SRCFPS
      set: () => {},
    });

    const { container } = render(<HeroFilm />);
    const line = container.querySelectorAll('p[data-vpos]')[1] as HTMLElement;
    return {
      line,
      wedge: line.querySelector<HTMLElement>('[data-rv="wedge"]')!,
      strip: line.querySelector<HTMLElement>('[data-rv="strip"]')!,
    };
  }

  afterEach(() => {
    for (const [k, d] of media) {
      if (d) Object.defineProperty(HTMLMediaElement.prototype, k, d);
      else delete (HTMLMediaElement.prototype as unknown as Record<string, unknown>)[k];
    }
    media = [];
    vi.restoreAllMocks();
  });

  it('clips while the sweep is running', () => {
    // Frame 124 is REV_F0: the wide reveal's first frame, with the whole line
    // still covered.
    const { line, wedge } = mountAtFrame(124);
    expect(line.hasAttribute('data-rv-open')).toBe(false);
    expect(wedge.style.transform).toMatch(/^matrix\(/);
    expect(wedge.style.transform).not.toBe('matrix(1,0,0,1,0,0)');
  });

  it('lets go of it once the sweep is over', () => {
    // Past the end of the wide table (124 + 82). The stylesheet hangs the
    // pane's `overflow` and its `will-change` off this attribute.
    const { line, wedge } = mountAtFrame(124 + 82);
    expect(line.hasAttribute('data-rv-open')).toBe(true);
    expect(wedge.style.transform).toBe('matrix(1,0,0,1,0,0)');
  });

  it('parks the second copy instead of translating it off-screen', () => {
    // The strip pane carries the phone's horizontal edge and nothing else, so
    // on the wide band it is parked for the whole film. Parked means hidden
    // over the identity: translating it away instead would leave its inner
    // counter-translated a hundred thousand pixels out of a box that, without
    // `overflow: clip`, is a scroll container.
    for (const frame of [124, 124 + 40, 124 + 82]) {
      const { strip } = mountAtFrame(frame);
      expect(strip.style.visibility).toBe('hidden');
      expect(strip.style.transform).toBe('matrix(1,0,0,1,0,0)');
      cleanup();
    }
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

/**
 * THE PARSE-TIME GATE'S FAILURE MODE.
 *
 * `html.cine-on` is now asserted during HTML parse, which is the whole point —
 * it is what makes the runway 800vh before Chrome's lazy-loading pass measures
 * how far below the fold the services strip is. But it is asserted by a script
 * that cannot know whether the JavaScript behind it will arrive, and on the
 * phone band that class carries `chrome.css:1141`, which is `display:none` on
 * the WhatsApp and call buttons until the engine adds `skip-live`.
 *
 * So the class is armed rather than asserted. These tests run the exported
 * script itself — not a copy of it — against a stand-in for the film's subtree.
 */
describe('the parse-time gate disarms itself if the engine never arrives', () => {
  /** The gate is the first inline script in the export. */
  function gateScript(): string {
    mockMatchMedia(390);
    const found = /<script>([\s\S]*?)<\/script>/.exec(
      renderToStaticMarkup(<HeroFilm />),
    );
    expect(found).toBeTruthy();
    return found![1];
  }

  function stage() {
    document.documentElement.className = '';
    Reflect.deleteProperty(window, '__cineHold');
    document.body.innerHTML =
      '<div id="cine"><div class="bg">' +
      '<img data-src="/still.webp" data-srcset="/still.webp 100w">' +
      '<video src="/film.mp4"></video>' +
      '</div></div>';
  }

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
    Reflect.deleteProperty(window, '__cineHold');
  });

  it('holds the gate when the engine reports for duty', () => {
    vi.useFakeTimers();
    const src = gateScript();
    stage();
    new Function(src)();
    expect(document.documentElement.classList.contains('cine-on')).toBe(true);

    // useHeroFilm.ts:1185 — the film is running.
    window.__cineHold = true;
    dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(10000);

    expect(document.documentElement.classList.contains('cine-on')).toBe(true);
    // The still stays deferred: `.bgImg` is at opacity 0 for the session.
    expect(document.querySelector('img')!.getAttribute('src')).toBeNull();
    expect(document.querySelector('video')!.getAttribute('src')).toBe(
      '/film.mp4',
    );
  });

  it('drops the gate and promotes the still when it does not', () => {
    vi.useFakeTimers();
    const src = gateScript();
    stage();
    new Function(src)();
    expect(document.documentElement.classList.contains('cine-on')).toBe(true);

    // No `__cineHold`: React never reached the film.
    dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(10000);

    expect(document.documentElement.classList.contains('cine-on')).toBe(false);
    const img = document.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/still.webp');
    expect(img.getAttribute('srcset')).toBe('/still.webp 100w');
    expect(img.hasAttribute('data-src')).toBe(false);
    // And a 6.22 MB download nobody can watch is called off.
    expect(document.querySelector('video')!.hasAttribute('src')).toBe(false);
  });
});
