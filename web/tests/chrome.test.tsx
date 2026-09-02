import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { MobileNav } from '../src/components/chrome/MobileNav';
import { SiteChrome } from '../src/components/chrome/SiteChrome';
import { SiteFooter } from '../src/components/chrome/SiteFooter';
import { SiteHeader } from '../src/components/chrome/SiteHeader';
import { StickyContactBar } from '../src/components/chrome/StickyContactBar';
import { TradeFooter } from '../src/components/chrome/TradeFooter';
import {
  FOOT_EXPLORE,
  FOOT_LEGAL,
  PRIMARY,
  SERVICES,
  STONES_DESKTOP,
  STONES_MOBILE,
  TRADE_FOOT_LEGAL,
  isBarePath,
  thresholdForVariant,
  variantForPath,
} from '../src/components/chrome/nav-data';

/**
 * These guard the handful of chrome details that a later edit is most likely
 * to "tidy" into a regression — the ones the source only reveals if you diff
 * all 178 pages. Each one names the source line it is defending.
 */

let pathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

beforeEach(() => {
  pathname = '/';
  document.documentElement.className = '';
  window.scrollY = 0;
});

afterEach(() => {
  cleanup();
  document.documentElement.className = '';
});

/* ------------------------------------------------------------------------ */

describe('variant resolution', () => {
  it('routes the six site.css pages to rich and everything else to lite', () => {
    for (const p of [
      '/',
      '/about/',
      '/contact/',
      '/estimate/',
      '/projects/',
      '/services/',
    ]) {
      expect(variantForPath(p), p).toBe('rich');
    }

    // A service DETAIL page is lite even though /services/ itself is rich.
    for (const p of [
      '/services/fireplaces/',
      '/stones/carrara/',
      '/guides/quartz/',
      '/worktops/london/',
      '/trade/',
      '/privacy/',
      '/sitemap/',
    ]) {
      expect(variantForPath(p), p).toBe('lite');
    }
  });

  it('keeps the two measured scroll thresholds apart', () => {
    // site.js:2815 vs the content pages' inline `window.scrollY>12`.
    expect(thresholdForVariant('rich')).toBe(40);
    expect(thresholdForVariant('lite')).toBe(12);
  });
});

/* ------------------------------------------------------------------------ */

describe('SiteHeader', () => {
  it('gives the rich bar its id, flare and dropdowns, and the lite bar none', () => {
    const { container, rerender } = render(<SiteHeader variant="rich" />);
    expect(container.querySelector('header.bar')).toHaveAttribute(
      'id',
      'siteBar',
    );
    expect(container.querySelector('.bar-flare')).toBeInTheDocument();
    expect(container.querySelectorAll('.nav-item')).toHaveLength(2);

    rerender(<SiteHeader variant="lite" />);
    expect(container.querySelector('header.bar')).not.toHaveAttribute('id');
    expect(container.querySelector('.bar-flare')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.nav-item')).toHaveLength(0);
    expect(container.querySelectorAll('nav.top > a')).toHaveLength(
      PRIMARY.length,
    );
  });

  it('renders class="bar" on the server pass, as the legacy HTML does', () => {
    // The source adds .scrolled from a deferred script, so the shipped HTML
    // never carries it. Anything else is a hydration mismatch waiting to fire.
    const { container } = render(<SiteHeader variant="rich" />);
    expect(container.querySelector('header')!.className).toBe('bar');
  });

  it('forms at 40px on rich and 12px on lite', () => {
    const { container, unmount } = render(<SiteHeader variant="lite" />);
    const bar = () => container.querySelector('header.bar')!;

    act(() => {
      window.scrollY = 20;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(bar().className).toContain('scrolled'); // 20 > 12
    unmount();

    const rich = render(<SiteHeader variant="rich" />);
    act(() => {
      window.scrollY = 20;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(
      rich.container.querySelector('header.bar')!.className,
    ).not.toContain('scrolled'); // 20 < 40
  });

  it('keeps the two carets structurally different', () => {
    // Services is stroke-width 1.6 with a linecap only; Stones is 1.4 and
    // also sets a linejoin. Hand-editing drift in the source, kept.
    const { container } = render(<SiteHeader variant="rich" />);
    const carets = container.querySelectorAll('.nav-caret path');
    expect(carets).toHaveLength(2);
    expect(carets[0].getAttribute('stroke-width')).toBe('1.6');
    expect(carets[0].getAttribute('stroke-linejoin')).toBeNull();
    expect(carets[1].getAttribute('stroke-width')).toBe('1.4');
    expect(carets[1].getAttribute('stroke-linejoin')).toBe('round');
  });

  it('adds no ARIA state to the CSS-only dropdowns', () => {
    // :hover / :focus-within with no JS. Announcing an expanded state that no
    // key can toggle would be worse than the source's silence.
    const { container } = render(<SiteHeader variant="rich" />);
    for (const item of container.querySelectorAll('.nav-item > a')) {
      expect(item).not.toHaveAttribute('aria-expanded');
      expect(item).not.toHaveAttribute('aria-haspopup');
    }
  });
});

/* ------------------------------------------------------------------------ */

describe('mobile nav', () => {
  const bothMounted = (variant: 'rich' | 'lite' = 'lite') =>
    render(
      <>
        <SiteHeader variant={variant} />
        <MobileNav variant={variant} />
      </>,
    );

  it('shares one open state between the burger and the sheet', () => {
    // They are separate components; the module store is what joins them.
    bothMounted();
    const burger = screen.getByRole('button', { name: 'Open menu' });

    fireEvent.click(burger);
    expect(document.documentElement).toHaveClass('nav-open');
    expect(burger).toHaveAttribute('aria-expanded', 'true');
    expect(burger).toHaveAccessibleName('Close menu');

    fireEvent.click(burger);
    expect(document.documentElement).not.toHaveClass('nav-open');
  });

  it('renders exactly eleven children, because the stagger is positional', () => {
    // chrome.css targets .mobile-nav > *:nth-child(1..10); .mn-row is the last
    // child precisely so that it gets no delay.
    //
    // ⚠️ IT WAS TEN CHILDREN AND A 1..9 LADDER until the Articles link landed
    // on 2 Sep 2026. If you are here because this number went red again, the
    // fix is NOT to bump it on its own: the delays are positional, so a new
    // top-level link also needs a new step in chrome.css or it arrives with no
    // delay, ahead of the item before it. The test below enforces that pairing.
    const { container } = render(<MobileNav />);
    const sheet = container.querySelector('#mobileNav')!;
    expect(sheet.children).toHaveLength(11);
    expect(sheet.children[8]).toHaveAttribute('href', '/articles');
    expect(sheet.children[10]).toHaveClass('mn-row');
    expect(sheet.children[1]).toHaveAttribute('id', 'mnSubServices');
    expect(sheet.children[4]).toHaveAttribute('id', 'mnSubStones');
  });

  /**
   * THE PAIRING THE PREVIOUS TEST CANNOT SEE.
   *
   * The sheet's entrance animation is a positional ladder in chrome.css:
   * `.mobile-nav > *:nth-child(N){transition-delay:…}`. jsdom does not apply
   * the stylesheet, so a component test can only ever count the markup, and
   * the markup passing tells you nothing about whether the ladder still
   * reaches the last link. That gap is exactly how an eleventh child would
   * ship animating wrongly with a green suite.
   *
   * So this reads the stylesheet as text and asserts the two stay in step:
   * every child except `.mn-row` must have a step. It is the only automated
   * thing standing between a future nav item and a silently broken entrance.
   */
  it('has a stagger step in chrome.css for every child except .mn-row', () => {
    const css = readFileSync(
      resolve(__dirname, '../src/components/chrome/chrome.css'),
      'utf8',
    );
    const steps = [...css.matchAll(/\.mobile-nav > \*:nth-child\((\d+)\)/g)].map((m) =>
      Number(m[1]),
    );

    const { container } = render(<MobileNav />);
    const sheet = container.querySelector('#mobileNav')!;
    const needed = sheet.children.length - 1; // .mn-row is deliberately last and undelayed

    // A contiguous 1..needed ladder, no gaps and no strays.
    expect([...steps].sort((a, b) => a - b)).toEqual(
      Array.from({ length: needed }, (_, i) => i + 1),
    );
  });

  it('closes when any link inside the sheet is tapped', () => {
    bothMounted();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(document.documentElement).toHaveClass('nav-open');

    fireEvent.click(screen.getByRole('link', { name: 'Get a free quote' }));
    expect(document.documentElement).not.toHaveClass('nav-open');
  });

  it('closes on Escape unconditionally, as the source does', () => {
    bothMounted();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.documentElement).not.toHaveClass('nav-open');

    // Bound with no open-state guard, so a second press is a harmless no-op.
    expect(() => fireEvent.keyDown(window, { key: 'Escape' })).not.toThrow();
  });

  it('opens one sub-panel at a time', () => {
    const { container } = render(<MobileNav />);
    const [services, stones] = [
      ...container.querySelectorAll<HTMLButtonElement>('.mn-toggle'),
    ];

    fireEvent.click(services);
    expect(services).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('#mnSubServices')).toHaveClass('open');

    // closeSubs() runs first in the source, so this closes Services.
    fireEvent.click(stones);
    expect(services).toHaveAttribute('aria-expanded', 'false');
    expect(stones).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('#mnSubServices')).not.toHaveClass('open');

    // Tapping the open one closes it.
    fireEvent.click(stones);
    expect(stones).toHaveAttribute('aria-expanded', 'false');
  });

  it('resets the accordion on a lite Escape but not on a rich one', () => {
    // site.js only resets from the burger's second click listener; the content
    // pages' inline script folds closeSubs into setOpen, so every close resets.
    const rich = render(
      <>
        <SiteHeader variant="rich" />
        <MobileNav variant="rich" />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(rich.container.querySelector('.mn-toggle')!);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(rich.container.querySelector('#mnSubServices')).toHaveClass('open');
    cleanup();

    const lite = render(
      <>
        <SiteHeader variant="lite" />
        <MobileNav variant="lite" />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(lite.container.querySelector('.mn-toggle')!);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(lite.container.querySelector('#mnSubServices')).not.toHaveClass(
      'open',
    );
  });

  it('releases the scroll lock when the sheet unmounts', () => {
    const { unmount } = bothMounted();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(document.documentElement).toHaveClass('nav-open');
    unmount();
    expect(document.documentElement).not.toHaveClass('nav-open');
  });

  it('lists six stones on mobile against three on the desktop dropdown', () => {
    // Not a transcription slip — the legacy markup really does differ.
    expect(STONES_DESKTOP).toHaveLength(3);
    expect(STONES_MOBILE).toHaveLength(6);

    const { container } = render(<MobileNav />);
    expect(
      container.querySelectorAll('#mnSubStones a'),
    ).toHaveLength(STONES_MOBILE.length);
    expect(
      container.querySelectorAll('#mnSubServices a'),
    ).toHaveLength(SERVICES.length);
  });
});

/* ------------------------------------------------------------------------ */

describe('StickyContactBar', () => {
  it("takes the source's early return when there is no reveal anchor", () => {
    // `if(!document.querySelector('.hero-ctas')){ bar-always; on; return; }`
    const { container } = render(<StickyContactBar mode="scroll" />);
    expect(container.querySelector('.mbar')).toHaveClass('on');
    expect(document.documentElement).toHaveClass('bar-always');
  });

  it('stays down until the anchor clears the header, then comes up', () => {
    const anchor = document.createElement('div');
    anchor.className = 'hero-ctas';
    anchor.getBoundingClientRect = () => ({ bottom: 500 }) as DOMRect;
    document.body.append(anchor);

    const { container } = render(<StickyContactBar mode="scroll" />);
    expect(container.querySelector('.mbar')).not.toHaveClass('on');
    expect(document.documentElement).not.toHaveClass('bar-always');

    act(() => {
      anchor.getBoundingClientRect = () => ({ bottom: -10 }) as DOMRect;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(container.querySelector('.mbar')).toHaveClass('on');

    anchor.remove();
  });
});

/* ------------------------------------------------------------------------ */

describe('SiteFooter', () => {
  it('leaves .foot-tail empty so :empty can hide it below 721px', () => {
    const { container } = render(<SiteFooter />);
    const tail = container.querySelector('#footTail')!;
    // A single stray comment or space here breaks `.foot-tail:empty`.
    expect(tail.childNodes).toHaveLength(0);
  });

  it('renders area and hours inside .foot-contact for the server pass', () => {
    // jsdom resolves no media query, so --footTail is never 'on' and the
    // re-parenting is a no-op — which is exactly the <721px reading.
    const { container } = render(<SiteFooter />);
    expect(
      container.querySelector('.foot-contact .foot-c-area'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.foot-contact .foot-c-hours'),
    ).toBeInTheDocument();
  });

  it('carries the Explore column and an FAQ link that resolves everywhere', () => {
    const { container } = render(<SiteFooter />);
    expect(container.querySelectorAll('.foot-explore li')).toHaveLength(
      FOOT_EXPLORE.length,
    );
    /*
      WAS a bare `#faq`, which is what the source ships and what this test used
      to assert. It resolves on only three of the 178 pages (home, about,
      contact) and was dead on the other 175 — the 27 Aug control audit clicked
      it on /privacy, /terms and /stones/compare.html and it went nowhere.
      The client asked for every button to go where it is supposed to, so the
      default is now `/#faq`. Deliberate divergence from the legacy build; do
      not "restore" it to match old.
    */
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '/#faq',
    );
  });

  it('accepts a corrected FAQ href', () => {
    render(<SiteFooter faqHref="/#faq" />);
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '/#faq',
    );
  });
});

/* ------------------------------------------------------------------------ */

describe('/trade/ — the one page with no mobile chrome', () => {
  /**
   * 177 of the 178 live pages carry `nav.mobile-nav`, the `.nav-burger` that
   * opens it, the `.mbar` sticky bar and `footer.site#footer`. /trade/ carries
   * none of them and ships its own footer instead. Giving it the shared chrome
   * rewrites the one page a builder or developer actually lands on, so each
   * half of that divergence is nailed down here.
   */
  it('knows which routes are bare, and does not over-match', () => {
    for (const p of ['/trade', '/trade/']) expect(isBarePath(p), p).toBe(true);
    for (const p of ['/', '/privacy/', '/sitemap', '/trader/', null, undefined]) {
      expect(isBarePath(p), String(p)).toBe(false);
    }
    // Still `lite` for every other purpose: flat bar, 12px threshold.
    expect(variantForPath('/trade/')).toBe('lite');
  });

  it('gives /trade/ no sheet, no burger and no sticky bar', () => {
    pathname = '/trade';
    const { container } = render(
      <SiteChrome>
        <main />
      </SiteChrome>,
    );
    expect(container.querySelector('header.bar')).toBeInTheDocument();
    expect(container.querySelector('.nav-burger')).toBeNull();
    expect(container.querySelector('#mobileNav')).toBeNull();
    expect(container.querySelector('.mbar')).toBeNull();
    expect(container.querySelector('.wa-fab')).toBeNull();
    // Its own footer, not the shared one.
    expect(container.querySelector('footer.site')).toBeInTheDocument();
    expect(container.querySelector('#footer')).toBeNull();
  });

  it('keeps the sheet, the burger and the bar on every other lite route', () => {
    pathname = '/privacy';
    const { container } = render(
      <SiteChrome>
        <main />
      </SiteChrome>,
    );
    expect(container.querySelector('.nav-burger')).toBeInTheDocument();
    expect(container.querySelector('#mobileNav')).toBeInTheDocument();
    expect(container.querySelector('.mbar')).toBeInTheDocument();
    expect(container.querySelector('footer.site#footer')).toBeInTheDocument();
  });

  it('drops the burger only when asked', () => {
    const { container, rerender } = render(<SiteHeader variant="lite" />);
    expect(container.querySelector('.nav-burger')).toBeInTheDocument();
    rerender(<SiteHeader variant="lite" burger={false} />);
    expect(container.querySelector('.nav-burger')).toBeNull();
  });

  it('ships /trade/ its own footer copy, not the shared footer copy', () => {
    const { container } = render(<TradeFooter />);
    // The tagline is the tell: the shared footer says "from slab selection to
    // a flawless fit", this one says "by one team".
    expect(container.querySelector('.foot-tag')).toHaveTextContent(
      'Bespoke stone worktops, templated, fitted and guaranteed by one team.',
    );
    // None of the shared footer's extras.
    for (const sel of [
      '.foot-guar',
      '.foot-social',
      '.foot-tail',
      '.foot-c-wa',
      '.foot-explore',
      '.foot-browse',
    ]) {
      expect(container.querySelector(sel), sel).toBeNull();
    }
    // A three-link bottom bar, not the shared four.
    const legal = [...container.querySelectorAll('.foot-legal a')];
    expect(legal.map((a) => a.textContent)).toEqual(
      TRADE_FOOT_LEGAL.map((l) => l.label),
    );
    expect(legal.map((a) => a.getAttribute('href'))).toEqual([
      '/contact/',
      '/index.html#faq',
      '/sitemap.html',
    ]);
  });
});

/* ------------------------------------------------------------------------ */

describe('the footer Sitemap link', () => {
  it('points at a route that exists', () => {
    // FOOT_LEGAL renders in the bottom bar of all 199 exported pages, so a
    // missing app/sitemap/page.tsx is 199 links to a 404, not one.
    expect(FOOT_LEGAL[0]).toEqual({ href: '/sitemap.html', label: 'Sitemap' });
    expect(
      existsSync(resolve(__dirname, '../src/app/sitemap/page.tsx')),
    ).toBe(true);
    // `.html` leaf, so postexport must NOT be asked for a directory form.
    expect(
      readFileSync(resolve(__dirname, '../scripts/postexport.mjs'), 'utf8'),
    ).not.toContain("'/sitemap/'");
  });
});
