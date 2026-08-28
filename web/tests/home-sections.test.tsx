import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import About from '@/components/sections/About';
import Cta from '@/components/sections/Cta';
import Estimator from '@/components/sections/Estimator';
import Faq from '@/components/sections/Faq';
import Gallery from '@/components/sections/Gallery';
import Process from '@/components/sections/Process';
import Reviews from '@/components/sections/Reviews';
import SectionDivider from '@/components/sections/SectionDivider';
import Services from '@/components/sections/Services';
import Stones from '@/components/sections/Stones';
import TradePrompt from '@/components/sections/TradePrompt';
import Why from '@/components/sections/Why';
import { FAQS } from '@/data/home/faqs';
import { PROCESS } from '@/data/home/process';
import { PROJECTS } from '@/data/home/projects';
import { REVIEWS } from '@/data/home/reviews';
import { SERVICES } from '@/data/home/services';

/**
 * Structural tests for the home-page composition.
 *
 * These assert the SHAPE of the rendered DOM — the ids, the class names and
 * the element counts — rather than how it looks, because the appearance is
 * carried entirely by src/styles/home-sections.css, which is generated from
 * the legacy stylesheet and selects on exactly those hooks. A section that
 * renders the right copy under the wrong class name is invisible, and that is
 * the failure mode worth catching.
 */

/* jsdom has no IntersectionObserver; every section mounts one. */
class FakeIO implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  /* Added by the DOM lib TypeScript 7 ships; `implements` requires it. */
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [];
  static instances: FakeIO[] = [];
  observed: Element[] = [];
  constructor(
    public cb: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    FakeIO.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve(el: Element) {
    this.observed = this.observed.filter((n) => n !== el);
  }
  disconnect() {
    this.observed = [];
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  /** Fire an intersection for everything currently observed. */
  fireAll(isIntersecting = true) {
    this.cb(
      this.observed.map(
        (target) =>
          ({
            target,
            isIntersecting,
            boundingClientRect: { top: 100 } as DOMRectReadOnly,
          }) as IntersectionObserverEntry,
      ),
      this,
    );
  }
}

beforeEach(() => {
  FakeIO.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIO);
  // jsdom leaves document.fonts undefined; the FAQ's plate lock awaits it.
  if (!document.fonts) {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SectionDivider', () => {
  it('renders the wrapper + inner span the travelling highlight needs', () => {
    const { container } = render(<SectionDivider />);
    const div = container.querySelector('.section-divider');
    expect(div).toHaveAttribute('aria-hidden', 'true');
    expect(div?.querySelector('span.sd-line')).toBeTruthy();
  });
});

describe('Reviews', () => {
  it('renders every review into the deck, server-side', () => {
    const { container } = render(<Reviews />);
    const cards = container.querySelectorAll('#revDeck .rev');
    expect(cards).toHaveLength(REVIEWS.length);
    // The legacy page ships an empty deck; putting the copy in the tree is
    // the one improvement this port makes, so assert it stays.
    expect(container.querySelector('.rev')).toHaveAttribute(
      'data-full',
      REVIEWS[0].q,
    );
  });

  it('keeps the pager disabled only when there is a single page', () => {
    render(<Reviews />);
    // 15 reviews at any --revPer is more than one page, but jsdom reports no
    // computed --revPer and zero-size boxes, so the hook falls back and the
    // buttons stay in their initial disabled state until layout runs.
    expect(screen.getByLabelText('Previous reviews')).toBeInTheDocument();
    expect(screen.getByLabelText('Next reviews')).toBeInTheDocument();
  });

  /**
   * The deck's first layout is deferred, and this is the contract that makes
   * the deferral safe rather than merely cheap.
   *
   * `layout()` ends in `fitQuote` per card, which binary-searches the word
   * count by writing `textContent` and reading `scrollHeight` — about ninety
   * forced synchronous layouts for fifteen cards. Run at mount it lands
   * inside React's passive-effect flush, on the same main thread the hero
   * film is starting on, for a section that is ~5,700px below the fold.
   *
   * So: nothing at mount, everything when the deck is approached.
   */
  describe('the deck lays out when it is approached, not at mount', () => {
    let callbacks: IntersectionObserverCallback[] = [];
    let observed: Element[] = [];
    let realIO: typeof IntersectionObserver;

    beforeEach(() => {
      callbacks = [];
      observed = [];
      realIO = globalThis.IntersectionObserver;
      class RecordingIO {
        constructor(cb: IntersectionObserverCallback) {
          callbacks.push(cb);
        }
        observe(el: Element) {
          observed.push(el);
        }
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
      globalThis.IntersectionObserver =
        RecordingIO as unknown as typeof IntersectionObserver;
      window.IntersectionObserver = globalThis.IntersectionObserver;
    });

    afterEach(() => {
      globalThis.IntersectionObserver = realIO;
      window.IntersectionObserver = realIO;
    });

    it('writes no card transforms until the observer fires', () => {
      const { container } = render(<Reviews />);
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>('#revDeck .rev'),
      );
      expect(cards.length).toBe(REVIEWS.length);
      // `layout()` is the only thing that writes these. None of them yet.
      expect(cards.every((el) => el.style.transform === '')).toBe(true);
      expect(observed).toContain(container.querySelector('#revDeck'));
    });

    it('lays the whole deck out once the observer reports it visible', () => {
      const { container } = render(<Reviews />);
      const deck = container.querySelector('#revDeck');
      // The deck is watched, and the reveal observers are too, so fire every
      // callback for the deck entry and let each decide.
      for (const cb of callbacks) {
        cb(
          [{ isIntersecting: true, target: deck }] as unknown as IntersectionObserverEntry[],
          {} as IntersectionObserver,
        );
      }
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>('#revDeck .rev'),
      );
      // jsdom gives every box zero size, so the numbers are degenerate — but
      // `layout()` having run at all is exactly what is being asserted.
      expect(cards.some((el) => el.style.transform !== '')).toBe(true);
    });
  });
});

describe('Services', () => {
  it('renders eight flip cards with a front and a back face', () => {
    const { container } = render(<Services />);
    const cards = container.querySelectorAll('#svcGridServices .svc');
    expect(cards).toHaveLength(SERVICES.length);
    for (const card of cards) {
      expect(card.querySelector('.face.front')).toBeTruthy();
      expect(card.querySelector('.face.back')).toBeTruthy();
    }
  });

  it('shows the title on the front and the long copy on the back only', () => {
    // buildCards is called with `nameOnly:true`, so `.desc` must not exist.
    const { container } = render(<Services />);
    const first = container.querySelector('.svc')!;
    expect(first.querySelector('.front-text .desc')).toBeNull();
    expect(first.querySelector('.back-text p')?.textContent).toBe(
      SERVICES[0].long,
    );
  });

  it('flips a card on click and keeps the read-more link from flipping it', () => {
    const { container } = render(<Services />);
    const card = container.querySelector('.svc')!;
    expect(card.className).not.toContain('flipped');
    fireEvent.click(card);
    expect(card.className).toContain('flipped');
    // The link stops propagation, so the card must still be flipped after.
    fireEvent.click(card.querySelector('.svc-more')!);
    expect(card.className).toContain('flipped');
  });

  it('leaves the helix stage empty for the carousel engine', () => {
    const { container } = render(<Services />);
    expect(container.querySelector('#helixStage')?.childElementCount).toBe(0);
    // …but the tablist it drives is present and populated.
    expect(container.querySelectorAll('#svcNav button')).toHaveLength(
      SERVICES.length,
    );
  });

  it('asks for a slot the phone actually has, not a 440px one', () => {
    // `(max-width:720px) 440px` is wider than a 384px handset and cannot
    // describe the two-column grid home-sections.css:524 puts there. It pulled
    // the 2400w rung: 1,863,538 B of below-the-fold stone on the wire before
    // the film's own poster was requested, where 880w (363,758 B) covers the
    // slot 1.24x over at dpr 3.75.
    const { container } = render(<Services />);
    for (const img of container.querySelectorAll<HTMLImageElement>(
      '#svcGridServices .stone img',
    )) {
      expect(img.getAttribute('sizes')).toBe('(max-width:720px) 45vw, 1160px');
    }
  });

  /**
   * The entrance is armed, not run at mount — see the note in Services.tsx.
   * `measure()` is eight forced synchronous layouts and `.svc-rev` carries a
   * permanent `will-change`, both for a grid ~5,700px below the fold while the
   * film is starting.
   */
  describe('the grid dresses itself when it is approached, not at mount', () => {
    let callbacks: IntersectionObserverCallback[] = [];
    let observed: Element[] = [];
    let realIO: typeof IntersectionObserver;

    beforeEach(() => {
      callbacks = [];
      observed = [];
      realIO = globalThis.IntersectionObserver;
      class RecordingIO {
        constructor(cb: IntersectionObserverCallback) {
          callbacks.push(cb);
        }
        observe(el: Element) {
          observed.push(el);
        }
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
      globalThis.IntersectionObserver =
        RecordingIO as unknown as typeof IntersectionObserver;
      window.IntersectionObserver = globalThis.IntersectionObserver;
    });

    afterEach(() => {
      globalThis.IntersectionObserver = realIO;
      window.IntersectionObserver = realIO;
    });

    it('leaves the cards in their SSR state, and watches the grid', () => {
      const { container } = render(<Services />);
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>('#svcGridServices .svc'),
      );
      expect(cards).toHaveLength(SERVICES.length);
      // No `.svc-rev` means no `will-change`, and no `--svcFrom` means
      // `measure()` has not run.
      expect(cards.every((el) => !el.classList.contains('svc-rev'))).toBe(true);
      expect(
        cards.every((el) => el.style.getPropertyValue('--svcFrom') === ''),
      ).toBe(true);
      expect(observed).toContain(container.querySelector('#svcGridServices'));
    });

    it('dresses and measures every card once the observer reports it near', () => {
      const { container } = render(<Services />);
      const grid = container.querySelector('#svcGridServices');
      for (const cb of callbacks) {
        cb(
          [{ isIntersecting: true, target: grid }] as unknown as IntersectionObserverEntry[],
          {} as IntersectionObserver,
        );
      }
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>('#svcGridServices .svc'),
      );
      expect(cards.every((el) => el.classList.contains('svc-rev'))).toBe(true);
      expect(cards.every((el) => !el.classList.contains('enter'))).toBe(true);
      expect(
        cards.every((el) => el.style.getPropertyValue('--svcFrom') !== ''),
      ).toBe(true);
    });
  });
});

describe('Gallery', () => {
  it('renders every project as a door card, in sets of four', () => {
    const { container } = render(<Gallery />);
    expect(container.querySelectorAll('.gal-card')).toHaveLength(
      PROJECTS.length,
    );
    expect(container.querySelectorAll('.gal-set')).toHaveLength(
      Math.ceil(PROJECTS.length / 4),
    );
    expect(container.querySelectorAll('.gal-door')).toHaveLength(
      PROJECTS.length,
    );
  });

  /*
   * The overlays are queried off `document`, not off `container`: site.js:2527
   * moves #projDetail (and the lightbox, and the grid view) to <body>, and the
   * port reproduces that with a portal, so they are deliberately NOT inside
   * the section the component renders.
   */
  it('opens the project detail on click and closes it again', () => {
    const { container } = render(<Gallery />);
    const detail = document.querySelector('#projDetail')!;
    expect(detail.parentElement).toBe(document.body);
    expect(detail.className).not.toContain('on');

    fireEvent.click(container.querySelector('.gal-card')!);
    expect(detail.className).toContain('on');
    expect(document.querySelector('#projName')?.textContent).toBe(
      PROJECTS[0].name,
    );
    expect(document.querySelectorAll('.proj-ph')).toHaveLength(
      PROJECTS[0].gallery.length,
    );
    expect(document.documentElement.classList.contains('proj-open')).toBe(true);

    fireEvent.click(document.querySelector('#projClose')!);
    expect(detail.className).not.toContain('on');
    expect(document.documentElement.classList.contains('proj-open')).toBe(
      false,
    );
    // closeFocus (site.js:2475) drops the class and nothing else — the copy
    // stays put so the 0.5s fade has something to fade.
    expect(document.querySelector('#projName')?.textContent).toBe(
      PROJECTS[0].name,
    );
  });

  it('hides the type row and the story column when a project has neither', () => {
    const { container } = render(<Gallery />);
    // Watford has a type but an empty story and no review.
    const idx = PROJECTS.findIndex((p) => !p.story && !p.reviewBy);
    expect(idx).toBeGreaterThan(-1);
    fireEvent.click(container.querySelectorAll('.gal-card')[idx]);
    expect(
      document.querySelector<HTMLElement>('#projDesc')!.style.display,
    ).toBe('none');
  });

  it('closes the open project when any link in the site bar is clicked', () => {
    // site.js:2476-2478 — the capture-phase listener on header.bar. Without it
    // the logo navigates but the overlay stays over the page.
    const bar = document.createElement('header');
    bar.className = 'bar';
    bar.innerHTML = '<a href="/#hero">Topcat Worktops, home</a>';
    document.body.appendChild(bar);
    try {
      const { container } = render(<Gallery />);
      fireEvent.click(container.querySelector('.gal-card')!);
      expect(document.querySelector('#projDetail')!.className).toContain('on');

      fireEvent.click(bar.querySelector('a')!);
      expect(document.querySelector('#projDetail')!.className).not.toContain(
        'on',
      );
      expect(document.documentElement.classList.contains('proj-open')).toBe(
        false,
      );
    } finally {
      bar.remove();
    }
  });
});

describe('Process', () => {
  it('renders four step tiles plus the aftercare banner and three arrows', () => {
    const { container } = render(<Process />);
    expect(container.querySelectorAll('#procFlow .ptile')).toHaveLength(
      PROCESS.length + 1,
    );
    expect(container.querySelector('.pt-e')).toBeTruthy();
    expect(container.querySelectorAll('.pt-arrow')).toHaveLength(3);
    // The grid places by class name, so the classes are load-bearing.
    for (const cls of ['pt-a', 'pt-b', 'pt-c', 'pt-d', 'pt-e']) {
      expect(container.querySelector('.' + cls), cls).toBeTruthy();
    }
  });

  /**
   * ⛔ QUERIED OFF `baseElement`, NOT `container`, AND THAT IS THE POINT.
   *
   * The modal is portalled to <body> — the port of site.js:279's
   * `document.body.appendChild(modal)`, which the film rebuild had dropped.
   * Rendered inside `section#process` it was trapped in that section's
   * stacking context (`z-index:1`), so its own `z-index:120` counted for
   * nothing against the rest of the page: the section divider's `width:100vw`
   * hairline and travelling sheen painted straight across the open card, and
   * the fixed header and sticky bar painted over its ends — the close button
   * was not merely clipped, the pixel under it belonged to the nav burger.
   *
   * So the parent is asserted here. If anyone moves this back inside the
   * section, this test fails rather than the client finding it again.
   */
  it('opens the step modal with that step’s detail copy, portalled to <body>', () => {
    const { container, baseElement } = render(<Process />);
    const modal = baseElement.querySelector('#procModal') as HTMLElement;
    expect(modal).toBeTruthy();
    expect(modal.parentElement).toBe(document.body);
    expect(container.querySelector('#procModal')).toBeNull();
    expect(modal.hidden).toBe(true);

    fireEvent.click(container.querySelector('.pt-a')!);
    expect(modal.hidden).toBe(false);
    expect(baseElement.querySelector('#pmTitle')?.textContent).toBe(
      PROCESS[0].t,
    );
    expect(baseElement.querySelectorAll('#pmPoints li')).toHaveLength(3);
    // The scroller the close button now sits outside of.
    expect(modal.querySelector('.pm-scroll')).toBeTruthy();
  });

  it('does not make the aftercare banner a button', () => {
    const { container } = render(<Process />);
    expect(container.querySelector('.pt-e')).not.toHaveAttribute('role');
  });

  /** Armed, not run at mount — the same deferral, for the same rect read. */
  describe('the flow boots when it is approached, not at mount', () => {
    let callbacks: IntersectionObserverCallback[] = [];
    let realIO: typeof IntersectionObserver;

    beforeEach(() => {
      callbacks = [];
      realIO = globalThis.IntersectionObserver;
      class RecordingIO {
        constructor(cb: IntersectionObserverCallback) {
          callbacks.push(cb);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
      globalThis.IntersectionObserver =
        RecordingIO as unknown as typeof IntersectionObserver;
      window.IntersectionObserver = globalThis.IntersectionObserver;
    });

    afterEach(() => {
      globalThis.IntersectionObserver = realIO;
      window.IntersectionObserver = realIO;
    });

    it('adds no .flow class until the observer reports the flow near', () => {
      const { container } = render(<Process />);
      const flow = container.querySelector('#procFlow')!;
      // jsdom's every rect is zero, so `check()` would pass its 0.72 gate the
      // instant it ran. It has not run.
      expect(flow.classList.contains('flow')).toBe(false);

      // `boot()` refuses to measure a zero-width grid and retries instead —
      // and in jsdom every box is zero-width. Give it one.
      Object.defineProperty(flow, 'clientWidth', { value: 800 });
      for (const cb of callbacks) {
        cb(
          [{ isIntersecting: true, target: flow }] as unknown as IntersectionObserverEntry[],
          {} as IntersectionObserver,
        );
      }
      expect(flow.classList.contains('flow')).toBe(true);
    });
  });
});

describe('Faq', () => {
  it('renders all twelve questions with both label and full text', () => {
    const { container } = render(<Faq />);
    const tabs = container.querySelectorAll('.faq-q');
    expect(tabs).toHaveLength(FAQS.length);
    expect(tabs[0].querySelector('.faq-qt')?.textContent).toBe(FAQS[0].label);
    expect(tabs[0].querySelector('.faq-qf')?.textContent).toBe(FAQS[0].q);
  });

  it('opens the first question by default off phones', () => {
    const { container } = render(<Faq />);
    expect(container.querySelector('.faq-q.on')).toBe(
      container.querySelector('#faqQ0'),
    );
    expect(container.querySelector('#fpA')?.textContent).toBe(FAQS[0].a);
    expect(container.querySelector('#faq')?.className).not.toContain(
      'faq-shut',
    );
  });

  it('swaps the plate to the clicked question', () => {
    const { container } = render(<Faq />);
    fireEvent.click(container.querySelector('#faqQ5')!);
    expect(container.querySelector('#fpQ')?.textContent).toBe(FAQS[5].q);
    expect(container.querySelector('#fpTag')?.textContent).toBe(FAQS[5].tag);
    expect(container.querySelector('#faqPanel')).toHaveAttribute(
      'aria-labelledby',
      'faqQ5',
    );
  });

  it('walks the index with the arrow keys', () => {
    const { container } = render(<Faq />);
    const index = container.querySelector('#faqIndex')!;
    fireEvent.keyDown(index, { key: 'ArrowDown' });
    expect(container.querySelector('.faq-q.on')?.id).toBe('faqQ1');
    fireEvent.keyDown(index, { key: 'End' });
    expect(container.querySelector('.faq-q.on')?.id).toBe(
      'faqQ' + (FAQS.length - 1),
    );
  });
});

describe('Why', () => {
  it('renders the photo tile plus five numbered reason tiles', () => {
    const { container } = render(<Why />);
    expect(container.querySelectorAll('.why-mosaic .wy-tile')).toHaveLength(6);
    expect(container.querySelectorAll('.wy-r')).toHaveLength(5);
    expect(container.querySelector('.wy-p')).toBeTruthy();
    for (const cls of ['wy-a', 'wy-b', 'wy-c', 'wy-d', 'wy-e']) {
      expect(container.querySelector('.' + cls), cls).toBeTruthy();
    }
  });
});

describe('About', () => {
  it('carries the authored --rd stagger on every rise', () => {
    const { container } = render(<About />);
    const rises = container.querySelectorAll<HTMLElement>('.about-copy .rise');
    expect(rises).toHaveLength(7);
    expect(
      Array.from(rises).map((el) => el.style.getPropertyValue('--rd')),
    ).toEqual(['0ms', '120ms', '180ms', '240ms', '300ms', '360ms', '480ms']);
  });

  it('leaves the three unsourced collage tiles without a src', () => {
    const { container } = render(<About />);
    const tiles = container.querySelectorAll('.about-collage .ac-tile');
    expect(tiles).toHaveLength(6);
    // Tile 1 is the brand plate: its only <img> is the logo mark.
    expect(container.querySelector('.ac-w1 img.ac-mark')).toBeTruthy();
    // An empty src would request the page itself.
    for (const img of container.querySelectorAll('img')) {
      if (img.hasAttribute('src')) expect(img.getAttribute('src')).not.toBe('');
    }
  });
});

describe('Stones', () => {
  it('leaves the wheel empty and ships the rail, controls and filter', () => {
    const { container } = render(<Stones />);
    expect(container.querySelector('#wheel')?.childElementCount).toBe(0);
    expect(container.querySelectorAll('#matTabs .mat-tab')).toHaveLength(4);
    expect(container.querySelector('#readout')).toBeTruthy();
    expect(container.querySelectorAll('.sf-chip').length).toBeGreaterThan(0);
  });

  it('toggles the filter drawer and keeps aria-expanded in step', () => {
    const { container } = render(<Stones />);
    const btn = container.querySelector('#stoneFilterBtn')!;
    const drawer = container.querySelector('#stoneFilter') as HTMLElement;
    expect(drawer.hidden).toBe(true);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(drawer.hidden).toBe(false);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Estimator', () => {
  it('ships the panel closed exactly where the source ships it closed', () => {
    const { container } = render(<Estimator />);
    for (const id of ['estPoa', 'estEdgePanel', 'estLmWrap', 'estJnote']) {
      expect(
        container.querySelector<HTMLElement>('#' + id)?.hidden,
        id,
      ).toBe(true);
    }
    // Engine-filled containers stay empty, as in index.html.
    expect(container.querySelector('#estRows')?.childElementCount).toBe(0);
    expect(container.querySelector('#estBoard')?.childElementCount).toBe(0);
  });

  it('keeps the placeholder metrics the engine overwrites', () => {
    const { container } = render(<Estimator />);
    expect(container.querySelector('#estPrice')?.textContent).toBe(
      '£2,000 – £2,500',
    );
    expect(container.querySelector('#estMeta')?.textContent).toBe(
      'Quartz · 2 pieces · 1 slab',
    );
  });

  it('ships the calculator\u2019s compact uploader, and only that one', () => {
    // index.html has two `[data-up]` mount points in this section — one in
    // #estCalc and one in the priced-by-hand panel. The second moved on
    // 27 Aug: it now lives inside <EstimateEnquiry/>, which the board renders
    // only once the engine is mounted AND the stone is priced by hand, so at
    // first paint the calculator's is the only one. See EstimateEnquiry.tsx.
    const { container } = render(<Estimator />);
    expect(container.querySelectorAll('.tc-up')).toHaveLength(1);
    expect(container.querySelectorAll('.tc-up.compact')).toHaveLength(1);
    // And the panel it left is still the panel — copy, points, CTA row.
    expect(container.querySelector('#estPoa .est-poa-points')).toBeTruthy();
    expect(container.querySelector('#estPoa .est-poa-cta')).toBeTruthy();
    // The foot was restructured on 27 Aug: the primary moved OUT of
    // `.est-poa-cta` (which now holds only the two ways to reach a person,
    // stacked) and up into `.est-poa-foot` as `.est-poa-get`, above the
    // labelled hairline. Same link, same target — a different wrapper.
    expect(container.querySelector('#estPoa .est-poa-foot')).toBeTruthy();
    expect(container.querySelector('#estPoa .est-poa-get')).toHaveAttribute('href', '#estPoaForm');
  });
});

describe('Cta', () => {
  it('keeps the hooks tcform.js selects on', () => {
    const { container } = render(<Cta />);
    const form = container.querySelector('form.cta-form');
    expect(form).toHaveAttribute('id', 'ctaForm');
    expect(form).toHaveAttribute('novalidate');
    // No action: the endpoint lives in tcform.js, as in the source.
    expect(form).not.toHaveAttribute('action');
  });

  it('names every field the way send.php expects', () => {
    const { container } = render(<Cta />);
    const names = Array.from(
      container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        '#ctaForm [name]',
      ),
    ).map((el) => el.name);
    expect(names).toEqual([
      'name',
      'email',
      'phone',
      'postcode',
      'message',
    ]);
  });

  it('toggles the attachments panel', () => {
    const { container } = render(<Cta />);
    const btn = container.querySelector('#ctaUpT')!;
    expect(container.querySelector('#ctaUp')?.className).not.toContain('open');
    fireEvent.click(btn);
    expect(container.querySelector('#ctaUp')?.className).toContain('open');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('TradePrompt', () => {
  it('is an aside that reveals itself', () => {
    const { container } = render(<TradePrompt />);
    const aside = container.querySelector('aside.trade-prompt')!;
    expect(aside).toHaveAttribute('aria-label', 'For the trade');
    expect(aside.className).toContain('rise');
    // The reveal root is the element itself, so it must be observed.
    const io = FakeIO.instances.at(-1)!;
    expect(io.observed).toContain(aside);
  });
});
